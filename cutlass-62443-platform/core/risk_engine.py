"""
IEC 62443-3-2 Detailed Risk Assessment Engine.
Calculates Unmitigated, Current Residual and Projected Residual cyber-physical risk
on the 5x5 risk matrix (config/risk_matrix.yaml, tolerable = Moderate).

Residual risk credits only controls verified as implemented in the site survey.
Recommended controls produce a separately labelled PROJECTED residual.
Consequence is unchanged by cyber controls (only engineered/non-digital bounds can lower it - CIE).
"""

from typing import Dict, List, Optional, Tuple
from core.config_loader import load_site_survey
from core.control_credits import ControlCreditEngine, threat_vectors
from core.models import Asset, Conduit, SystemUnderConsideration, ThreatScenario, Zone
from core.risk_matrix import RiskMatrix
from core.sl_evaluator import implemented_controls_for_zone


class RiskEngine:
    def __init__(self, facility_id: Optional[str] = None, survey: Optional[Dict] = None,
                 matrix: Optional[RiskMatrix] = None, credit_engine: Optional[ControlCreditEngine] = None):
        self.survey = survey if survey is not None else (load_site_survey(facility_id) if facility_id else None)
        self.matrix = matrix or RiskMatrix()
        self.credits = credit_engine or ControlCreditEngine()

    def evaluate_suc_risk(self, suc: SystemUnderConsideration) -> SystemUnderConsideration:
        """
        Runs detailed risk assessment across all zones and threat scenarios.
        """
        all_zone_risk_scores = []

        for zone_id, zone in suc.zones.items():
            scenarios = self._generate_and_score_scenarios(zone, suc.conduits)
            zone.threat_scenarios = scenarios

            if scenarios:
                avg_zone_risk = sum(s.unmitigated_risk_score for s in scenarios) / len(scenarios)
                all_zone_risk_scores.append(avg_zone_risk)
            else:
                all_zone_risk_scores.append(2.0)

        suc.overall_risk_score = (
            round(sum(all_zone_risk_scores) / len(all_zone_risk_scores), 2)
            if all_zone_risk_scores else 0.0
        )
        return suc

    def _generate_and_score_scenarios(
        self,
        zone: Zone,
        conduits: dict[str, Conduit]
    ) -> List[ThreatScenario]:
        """
        Synthesizes threat scenarios based on assets, CVE intelligence, and network reachability.
        """
        scenarios: List[ThreatScenario] = []

        # Check inbound conduit posture
        has_insecure_conduit = False
        has_direct_bypass = False
        has_uninspected_inbound = False
        for c_id in zone.inbound_conduits:
            c = conduits.get(c_id)
            if c:
                if not c.has_firewall_inspection or not c.is_encrypted:
                    has_insecure_conduit = True
                if c.violates_policy:
                    has_direct_bypass = True
                if not c.has_firewall_inspection:
                    has_uninspected_inbound = True

        scenario_counter = 1
        for asset in zone.assets:
            for vuln in asset.vulnerabilities:
                # 1. Likelihood Assessment (1 to 5)
                # Base on CVSS score
                if vuln.cvss_score >= 9.0:
                    base_likelihood = 4
                elif vuln.cvss_score >= 7.0:
                    base_likelihood = 3
                elif vuln.cvss_score >= 4.0:
                    base_likelihood = 2
                else:
                    base_likelihood = 1

                # Modifiers
                if vuln.cisa_kev or (vuln.epss_score and vuln.epss_score > 0.5):
                    base_likelihood = min(5, base_likelihood + 1)

                if has_direct_bypass:
                    base_likelihood = min(5, base_likelihood + 1)
                elif not has_insecure_conduit:
                    base_likelihood = max(1, base_likelihood - 1)

                unmitigated_likelihood = base_likelihood

                # 2. Consequence Assessment (1 to 5)
                # Tailored to enterprise physical OT impact
                if asset.is_safety_critical or "AMMONIA" in zone.zone_id:
                    consequence = 5  # OSHA PSM / EPA RMP life safety & catastrophic spoilage
                    impact_summary = (
                        f"Catastrophic hazard: Compromise of {asset.name} risks uncontrolled ammonia discharge, "
                        "emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction."
                    )
                elif any(k in zone.zone_id for k in ("SORTER", "SORTATION", "ASRS")):
                    consequence = 4  # Major operational downtime
                    impact_summary = (
                        f"Critical logistics disruption: Compromise of {asset.name} halts core DC sortation / ASRS cranes, "
                        "causing multi-hour trailer backlog, regional store replenishment delays, and >$1M operational loss."
                    )
                elif asset.device_type in ["HMI", "Engineering_Workstation"]:
                    consequence = 3  # Supervisory tampering / pivot
                    impact_summary = (
                        f"Supervisory compromise: Malicious access to {asset.name} enables unauthorized PLC program downloads, "
                        "tampering with setpoints, and lateral movement across L2 OT conduits."
                    )
                else:
                    consequence = 2
                    impact_summary = f"Operational degradation: Compromise of {asset.name} causes localized telemetry outage."

                unmitigated_consequence = consequence
                unmit_score = unmitigated_likelihood * unmitigated_consequence
                unmit_level = self.matrix.level(unmitigated_consequence, unmitigated_likelihood)

                # Controls: implemented (verified in site survey) vs recommended
                remote_reachable = has_direct_bypass or has_uninspected_inbound
                vectors = threat_vectors(asset, vuln, remote_reachable)
                implemented_ids = implemented_controls_for_zone(self.survey, zone.zone_id)
                implemented = self.credits.credits(sorted(implemented_ids), "implemented")
                recommended = self.credits.credits(
                    self.credits.recommend(asset, vuln, remote_reachable, implemented_ids), "recommended")
                controls = [f"{c.control_id}: {c.title}" for c in recommended]

                # CURRENT residual: only implemented controls reduce likelihood
                residual_consequence = unmitigated_consequence  # cyber controls never lower consequence
                residual_likelihood = max(1, unmitigated_likelihood - self.credits.reduction(vectors, implemented))
                residual_score = residual_likelihood * residual_consequence
                residual_level = self.matrix.level(residual_consequence, residual_likelihood)

                # PROJECTED residual: implemented + recommended
                proj_likelihood = max(1, unmitigated_likelihood - self.credits.reduction(vectors, implemented + recommended))
                proj_level = self.matrix.level(residual_consequence, proj_likelihood)

                scenarios.append(
                    ThreatScenario(
                        scenario_id=f"TS-{zone.zone_id}-{scenario_counter:02d}",
                        title=f"Exploit of {vuln.cve_id} on {asset.name} via Conduit",
                        threat_actor="Opportunistic Cybercriminal or Malicious Insider (IEC 62443 SL-2 Profile)",
                        threat_vector=f"Remote exploit via {', '.join(asset.active_protocols)} targeting {vuln.title}",
                        target_zone_id=zone.zone_id,
                        target_asset_ids=[asset.asset_id],
                        cve_reference=vuln.cve_id,
                        unmitigated_likelihood=unmitigated_likelihood,
                        unmitigated_consequence=unmitigated_consequence,
                        unmitigated_risk_score=unmit_score,
                        unmitigated_risk_level=unmit_level,
                        operational_impact_summary=impact_summary,
                        recommended_compensating_controls=controls,
                        residual_likelihood=residual_likelihood,
                        residual_consequence=residual_consequence,
                        residual_risk_score=residual_score,
                        residual_risk_level=residual_level,
                        residual_tolerable=self.matrix.is_tolerable(residual_level),
                        threat_vectors=vectors,
                        implemented_controls=implemented,
                        recommended_controls=recommended,
                        projected_residual_likelihood=proj_likelihood,
                        projected_residual_risk_score=proj_likelihood * residual_consequence,
                        projected_residual_risk_level=proj_level,
                        projected_residual_tolerable=self.matrix.is_tolerable(proj_level),
                    )
                )
                scenario_counter += 1

        return scenarios
