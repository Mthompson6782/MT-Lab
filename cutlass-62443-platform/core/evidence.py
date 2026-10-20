"""
Evidence resolution for IEC 62443-3-3 SL-2 System Requirements (SRs).

Three evidence sources, merged conservatively (the WORST status wins):
  1. Observed  - passive telemetry (Armis assets + conduits). Mostly negative evidence.
  2. Attested  - site-survey attestation (who / when / expiry). Expired => ignored.
  3. Capability- component SL-C (62443-4-2) applied later as an FR ceiling.

No evidence is never a pass: an SR with no evidence is `no_evidence`, and its FR is reported
as Unverified (<= 1) rather than SL 2.
"""

from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple

from core.models import Asset, Conduit, PurdueLevel, SRResult, Zone

# Status rank: lower is worse. Merge takes the minimum.
STATUS_RANK = {"observed_violation": 0, "not_met": 1, "partial": 2, "met": 3}

CLEARTEXT_MGMT = {"HTTP", "Telnet", "FTP", "SMBv1", "SMB", "SNMPv1", "SNMPv2c"}
UNAUTH_INDUSTRIAL = {"Modbus-TCP", "EtherNet/IP", "CIP", "PROFINET", "S7comm", "ADS", "BACnet"}
FIELD_LEVELS = {PurdueLevel.LEVEL_0, PurdueLevel.LEVEL_1, PurdueLevel.LEVEL_2}
UPPER_LEVELS = {PurdueLevel.LEVEL_3, PurdueLevel.LEVEL_3_5, PurdueLevel.LEVEL_4, PurdueLevel.LEVEL_5}


def _parse_date(v) -> Optional[date]:
    if v is None:
        return None
    if isinstance(v, date):
        return v
    return datetime.strptime(str(v), "%Y-%m-%d").date()


class EvidenceResolver:
    def __init__(self, sl2_requirements: Dict, survey: Optional[Dict], as_of: Optional[date] = None):
        self.as_of = as_of or date.today()
        self.survey = survey or {}
        self.validity_days = int(self.survey.get("default_validity_days", 365))
        # Flatten SR catalog: [(fr, sr_id, title)]
        self.catalog: List[Tuple[str, str, str]] = []
        for fr_key, fr in sl2_requirements["foundational_requirements"].items():
            for sr in fr.get("sl2_requirements", []):
                self.catalog.append((fr_key, sr["id"], sr["title"]))

    # ------------------------------------------------------------------ observed
    def _observed(self, zone: Zone, suc_zones: Dict[str, Zone], conduits: Dict[str, Conduit]) -> Dict[str, Tuple[str, str]]:
        """Returns {sr_id: (status, detail)} from passive telemetry only."""
        obs: Dict[str, Tuple[str, str]] = {}

        def worse(sr: str, status: str, detail: str):
            cur = obs.get(sr)
            if cur is None or STATUS_RANK[status] < STATUS_RANK[cur[0]]:
                obs[sr] = (status, detail)
            elif STATUS_RANK[status] == STATUS_RANK[cur[0]] and detail not in cur[1]:
                obs[sr] = (status, cur[1] + "; " + detail)

        inbound = [conduits[c] for c in zone.inbound_conduits if c in conduits]
        zone_is_field = zone.purdue_level in FIELD_LEVELS

        # SR 5.1 Network segmentation
        seg_violation = False
        for c in inbound:
            src = suc_zones.get(c.from_zone_id)
            src_external = src is None or src.purdue_level in {PurdueLevel.LEVEL_4, PurdueLevel.LEVEL_5}
            if zone_is_field and src_external and not c.traverses_dmz:
                worse("SR 5.1", "observed_violation", f"{c.conduit_id}: direct path from {c.from_zone_id} into field zone without DMZ")
                seg_violation = True
        levels = {a.purdue_level for a in zone.assets}
        if levels & FIELD_LEVELS and levels & UPPER_LEVELS:
            worse("SR 5.1", "observed_violation", "Flat zone: field (L0-L2) and site/enterprise (L3+) assets share one zone")
            seg_violation = True
        if not seg_violation and (zone.inbound_conduits or zone.outbound_conduits):
            worse("SR 5.1", "met", "Observed conduits respect Purdue boundaries")

        # SR 5.2 Zone boundary protection
        if inbound:
            uninspected = [c.conduit_id for c in inbound if not c.has_firewall_inspection]
            if uninspected:
                worse("SR 5.2", "observed_violation", f"Uninspected inbound conduit(s): {', '.join(uninspected)}")
            else:
                worse("SR 5.2", "met", "All inbound conduits pass stateful inspection")

        # SR 4.1 Confidentiality in transit
        for c in inbound:
            clear = sorted(set(c.allowed_protocols) & CLEARTEXT_MGMT)
            if clear and not c.is_encrypted:
                worse("SR 4.1", "observed_violation", f"{c.conduit_id}: cleartext management ({', '.join(clear)}) crosses zone boundary")
        for a in zone.assets:
            clear = sorted(set(a.active_protocols) & CLEARTEXT_MGMT)
            if clear:
                worse("SR 4.1", "partial", f"{a.name} exposes cleartext mgmt ({', '.join(clear)})")
        if inbound and "SR 4.1" not in obs and all(c.is_encrypted for c in inbound):
            worse("SR 4.1", "met", "All inbound conduits encrypted; no cleartext management observed")

        # SR 1.2 Device identification & authentication across conduits
        for c in inbound:
            unauth = sorted(set(c.allowed_protocols) & UNAUTH_INDUSTRIAL)
            if unauth:
                worse("SR 1.2", "partial", f"{c.conduit_id}: unauthenticated industrial protocol(s) {', '.join(unauth)} cross boundary")

        # SR 6.2 Continuous monitoring (positive evidence: Armis sees the zone)
        if zone.assets:
            worse("SR 6.2", "met", f"Armis passively monitors {len(zone.assets)} asset(s) in zone")

        return obs

    # ------------------------------------------------------------------ attested
    def _attested(self, zone_id: str) -> Dict[str, Dict]:
        merged: Dict[str, Dict] = {}
        for sr, rec in (self.survey.get("facility_wide") or {}).items():
            merged[sr] = dict(rec)
        for sr, rec in ((self.survey.get("zones") or {}).get(zone_id) or {}).items():
            merged[sr] = dict(rec)                          # zone entry overrides facility-wide
        valid = {}
        for sr, rec in merged.items():
            attested_on = _parse_date(rec.get("attested_on"))
            expires = _parse_date(rec.get("expires")) or (
                attested_on + timedelta(days=self.validity_days) if attested_on else None
            )
            rec["_expires"] = expires
            rec["_expired"] = bool(expires and expires < self.as_of) or attested_on is None
            valid[sr] = rec
        return valid

    # ------------------------------------------------------------------ resolve
    def resolve_zone(self, zone: Zone, suc_zones: Dict[str, Zone], conduits: Dict[str, Conduit]) -> List[SRResult]:
        observed = self._observed(zone, suc_zones, conduits)
        attested = self._attested(zone.zone_id)
        surveyor = self.survey.get("surveyed_by")
        results: List[SRResult] = []

        for fr, sr_id, title in self.catalog:
            candidates = []                                  # (status, source, detail, att_rec)
            if sr_id in observed:
                st, detail = observed[sr_id]
                candidates.append((st, "observed", detail, None))
            att = attested.get(sr_id)
            expired_note = ""
            if att is not None:
                if att["_expired"]:
                    expired_note = f"Attestation expired {att['_expires']} - re-survey required"
                elif att.get("status") in STATUS_RANK:
                    candidates.append((att["status"], "attested", att.get("evidence", ""), att))

            if not candidates:
                results.append(SRResult(sr_id=sr_id, fr=fr, title=title, status="no_evidence",
                                        source="none", detail=expired_note or "No telemetry or survey evidence"))
                continue

            status, source, detail, rec = min(candidates, key=lambda c: STATUS_RANK[c[0]])
            if len(candidates) > 1:
                source = "observed+attested"
                detail = " | ".join(f"[{c[1]}] {c[2]}" for c in candidates)
            results.append(SRResult(
                sr_id=sr_id, fr=fr, title=title, status=status, source=source, detail=detail,
                attested_by=surveyor if att and not att["_expired"] else None,
                attested_on=str(att.get("attested_on")) if att and not att["_expired"] else None,
                expires=str(att["_expires"]) if att and not att["_expired"] and att["_expires"] else None,
            ))
        return results
