"""
Control credit engine: turns implemented / recommended controls into likelihood reductions.

Residual risk is tied to what is ACTUALLY in place:
  * current residual   -> credits only controls verified as implemented (site survey)
  * projected residual -> current + recommended controls (always labelled "projected")

Two-stage attack model (see config/control_catalog.yaml):
  reduction = best credit on the ACCESS stage
            + weakest credit across ACTION alternatives (adversary picks the least-defended action)
  each stage capped at max_credit_per_stage; total capped at max_total_reduction; L >= 1.
Detective controls earn no likelihood credit.
"""

from typing import Dict, Iterable, List, Optional, Set, Tuple

from core.config_loader import load_control_catalog
from core.models import Asset, ControlCredit

ACCESS_VECTORS = {"remote_access", "ot_internal"}
ACTION_VECTORS = {"network_exploit", "logic_download", "credential_abuse", "local_access"}
CONTROLLER_PROTOCOLS = {"Modbus-TCP", "EtherNet/IP", "CIP", "CIP-Safety", "S7comm", "S7comm-Plus", "ADS", "PROFINET"}
WINDOWS_TYPES = {"HMI", "Engineering_Workstation"}


def threat_vectors(asset: Asset, vuln, insecure_inbound_conduit: bool) -> List[str]:
    """Derive the scenario's attack vectors from telemetry (no hard-coded asset names)."""
    vectors = ["remote_access" if insecure_inbound_conduit else "ot_internal"]
    av_local = bool(vuln.cvss_vector and "/AV:L" in vuln.cvss_vector)
    vectors.append("local_access" if av_local else "network_exploit")
    if asset.device_type not in WINDOWS_TYPES and set(asset.active_protocols) & CONTROLLER_PROTOCOLS:
        vectors.append("logic_download")
    if asset.device_type in WINDOWS_TYPES:
        vectors.append("credential_abuse")
    return vectors


class ControlCreditEngine:
    def __init__(self, catalog: Optional[Dict] = None):
        cfg = catalog or load_control_catalog()
        self.controls: Dict[str, Dict] = cfg.get("controls", {})
        self.max_stage = int(cfg.get("max_credit_per_stage", 2))
        self.max_total = int(cfg.get("max_total_reduction", 3))

    def recommend(self, asset: Asset, vuln, insecure_inbound_conduit: bool, implemented: Set[str]) -> List[str]:
        """Control IDs whose recommend_if matches this scenario and which are not already implemented."""
        out = []
        for cid, c in self.controls.items():
            if cid in implemented:
                continue
            cond = c.get("recommend_if", {}) or {}
            hit = (
                cond.get("always")
                or (cond.get("insecure_inbound_conduit") and insecure_inbound_conduit)
                or (cond.get("protocols_any") and set(cond["protocols_any"]) & set(asset.active_protocols))
                or (cond.get("device_types_any") and asset.device_type in cond["device_types_any"])
                or (cond.get("patch_available") and getattr(vuln, "remediation_patch_available", False))
            )
            if hit:
                out.append(cid)
        return out

    def credits(self, control_ids: Iterable[str], state: str) -> List[ControlCredit]:
        res = []
        for cid in control_ids:
            c = self.controls.get(cid)
            if not c:
                continue
            res.append(ControlCredit(control_id=cid, title=c["title"], state=state,
                                     covers_vectors=list(c.get("covers_vectors", [])),
                                     likelihood_reduction=int(c.get("likelihood_reduction", 0))))
        return res

    def reduction(self, vectors: List[str], credits: List[ControlCredit]) -> int:
        def stage_credit(vec: str) -> int:
            return min(self.max_stage, sum(c.likelihood_reduction for c in credits if vec in c.covers_vectors))

        access = [v for v in vectors if v in ACCESS_VECTORS]
        actions = [v for v in vectors if v in ACTION_VECTORS]
        access_credit = max((stage_credit(v) for v in access), default=0)
        action_credit = min((stage_credit(v) for v in actions), default=0)
        return min(self.max_total, access_credit + action_credit)
