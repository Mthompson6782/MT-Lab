"""
IEC 62443-3-3 / 3-2 Security Level (SL) Evaluator - evidence based.

SL-A per Foundational Requirement (FR) is established from evidence, never assumed:
  * any SR observed_violation on a mandatory boundary (SR 5.1) -> SL-A 0
  * any SR observed_violation / not_met / partial               -> SL-A 1 (deficient)
  * otherwise any SR with no_evidence                           -> reported "Unverified (<=1)"
  * all SL-2 SRs met                                            -> SL-A 2
  * then capped by component SL-C (62443-4-2) unless an implemented compensating control covers it.

Target: SL-T 2 is the enterprise floor for every OT zone. (Selected SL-3 REs for safety are
handled as an overlay by the CRS, not by raising SL-T.)
"""

from datetime import date
from typing import Dict, List, Optional, Set

from core.config_loader import (
    load_component_capabilities,
    load_sl2_requirements,
    load_site_survey,
)
from core.evidence import EvidenceResolver
from core.models import FRResult, SecurityLevelVector, SRResult, SystemUnderConsideration, Zone

FR_FIELDS = {"FR1": "fr1_iac", "FR2": "fr2_uc", "FR3": "fr3_si", "FR4": "fr4_dc",
             "FR5": "fr5_rdf", "FR6": "fr6_tre", "FR7": "fr7_ra"}


def implemented_controls_for_zone(survey: Optional[Dict], zone_id: str) -> Set[str]:
    out: Set[str] = set()
    for c in (survey or {}).get("controls_implemented", []) or []:
        zones = c.get("zones", [])
        if "*" in zones or zone_id in zones:
            out.add(c["control_id"])
    return out


class SecurityLevelEvaluator:
    TARGET_SL: float = 2.0  # Enterprise floor across all OT zones

    def __init__(self, facility_id: Optional[str] = None, survey: Optional[Dict] = None,
                 sl2_requirements: Optional[Dict] = None, capabilities: Optional[Dict] = None,
                 as_of: Optional[date] = None):
        self.survey = survey if survey is not None else (load_site_survey(facility_id) if facility_id else None)
        self.resolver = EvidenceResolver(sl2_requirements or load_sl2_requirements(), self.survey, as_of)
        self.capabilities = (capabilities or load_component_capabilities()).get("components", [])

    def evaluate_suc_security_levels(self, suc: SystemUnderConsideration) -> SystemUnderConsideration:
        compliant = 0
        total_srs = 0
        evidenced_srs = 0

        for zone in suc.zones.values():
            sr_results = self.resolver.resolve_zone(zone, suc.zones, suc.conduits)
            zone.sr_results = sr_results
            zone.fr_results = self._fr_results(zone, sr_results)

            vector = SecurityLevelVector(**{FR_FIELDS[fr]: r.sl_a for fr, r in zone.fr_results.items()})
            zone.achieved_sl_vector = vector
            zone.overall_achieved_sl = vector.min_level()   # zone summary = weakest FR (vector kept in report)
            zone.sl_verified = all(r.verified for r in zone.fr_results.values())
            zone.sl_gap = max(0.0, round(self.TARGET_SL - zone.overall_achieved_sl, 2))

            n_ev = sum(1 for r in sr_results if r.status != "no_evidence")
            zone.evidence_coverage_pct = round(100.0 * n_ev / len(sr_results), 1) if sr_results else 0.0
            zone.survey_worklist = [f"{r.sr_id} {r.title}" for r in sr_results if r.status == "no_evidence"]
            total_srs += len(sr_results)
            evidenced_srs += n_ev

            if zone.sl_verified and zone.overall_achieved_sl >= self.TARGET_SL:
                compliant += 1

        n = len(suc.zones)
        suc.sl2_compliance_percentage = round(100.0 * compliant / n, 1) if n else 0.0
        suc.evidence_coverage_percentage = round(100.0 * evidenced_srs / total_srs, 1) if total_srs else 0.0
        suc.survey_source = (self.survey or {}).get("_path")
        return suc

    # ------------------------------------------------------------------
    def _fr_results(self, zone: Zone, sr_results: List[SRResult]) -> Dict[str, FRResult]:
        implemented = implemented_controls_for_zone(self.survey, zone.zone_id)
        out: Dict[str, FRResult] = {}
        for fr in FR_FIELDS:
            srs = [r for r in sr_results if r.fr == fr]
            statuses = {r.status for r in srs}

            if any(r.status == "observed_violation" and r.sr_id == "SR 5.1" for r in srs):
                sl, verified, status = 0.0, True, "deficient"
            elif statuses & {"observed_violation", "not_met", "partial"}:
                sl, verified, status = 1.0, True, "deficient"
            elif "no_evidence" in statuses or not srs:
                sl, verified, status = 1.0, False, "unverified"      # reported as <= 1
            else:
                sl, verified, status = 2.0, True, "achieved"

            ceiling, limiting = self._sl_c_ceiling(zone, fr, implemented)
            if ceiling is not None and ceiling < sl:
                sl = float(ceiling)
                status = "deficient" if verified else status
            else:
                limiting = None          # only name a limiting asset when SL-C actually capped SL-A
            out[fr] = FRResult(fr=fr, sl_a=sl, verified=verified, status=status,
                               sl_c_ceiling=ceiling, sl_c_limiting_asset=limiting)
        return out

    def _sl_c_ceiling(self, zone: Zone, fr: str, implemented: Set[str]):
        ceiling, limiting = None, None
        for asset in zone.assets:
            for comp in self.capabilities:
                m = comp.get("match", {})
                if m.get("vendor") == asset.vendor and m.get("model") == asset.model:
                    val = comp.get("sl_c", {}).get(fr)
                    if val is None:
                        continue
                    compensators = set((comp.get("compensable_by") or {}).get(fr, []))
                    if compensators & implemented:
                        continue                      # attested compensating control lifts the ceiling
                    if ceiling is None or val < ceiling:
                        ceiling, limiting = float(val), asset.name
        return ceiling, limiting
