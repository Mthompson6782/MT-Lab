"""
IEC 62443-3-3 / 3-2 Security Level (SL) Evaluator.
Evaluates Achieved Security Level (SL-A) vs Target Security Level (SL-T = 2.0)
across Foundational Requirements FR 1 to FR 7.
"""

from typing import Dict, List, Tuple
from core.models import Conduit, SecurityLevelVector, SystemUnderConsideration, Zone


class SecurityLevelEvaluator:
    TARGET_SL: float = 2.0  # Walmart mandated across the board

    def evaluate_suc_security_levels(self, suc: SystemUnderConsideration) -> SystemUnderConsideration:
        """
        Evaluates SL-A vector for each zone and overall facility SL-2 compliance.
        """
        compliant_zones = 0
        total_zones = len(suc.zones)

        for zone_id, zone in suc.zones.items():
            sl_vector = self._evaluate_zone_vector(zone, suc.conduits)
            zone.achieved_sl_vector = sl_vector
            zone.overall_achieved_sl = sl_vector.min_level()  # IEC 62443 rules state zone SL is capped by its weakest FR
            zone.sl_gap = max(0.0, round(self.TARGET_SL - zone.overall_achieved_sl, 2))

            if zone.overall_achieved_sl >= self.TARGET_SL:
                compliant_zones += 1

        suc.sl2_compliance_percentage = (
            round((compliant_zones / total_zones) * 100, 1) if total_zones > 0 else 0.0
        )
        return suc

    def _evaluate_zone_vector(self, zone: Zone, conduits: Dict[str, Conduit]) -> SecurityLevelVector:
        """
        Calculates SL-A for FR 1 through FR 7.
        Baseline is SL 2.0; deductions occur if vulnerabilities or conduit violations degrade the level.
        """
        fr1 = 2.0  # Identification & Authentication
        fr2 = 2.0  # Use Control
        fr3 = 2.0  # System Integrity
        fr4 = 2.0  # Data Confidentiality
        fr5 = 2.0  # Restricted Data Flow
        fr6 = 2.0  # Timely Response to Events
        fr7 = 2.0  # Resource Availability

        # FR 5 (Restricted Data Flow) Evaluation
        for c_id in zone.inbound_conduits + zone.outbound_conduits:
            conduit = conduits.get(c_id)
            if conduit:
                if conduit.violates_policy:
                    fr5 = min(fr5, 0.0)  # Complete boundary breakdown (e.g. direct DMZ bypass)
                elif not conduit.has_firewall_inspection:
                    fr5 = min(fr5, 1.0)

                # FR 4 (Data Confidentiality) Evaluation
                if not conduit.is_encrypted and any(p in ["HTTP", "Telnet", "Modbus-TCP"] for p in conduit.allowed_protocols):
                    fr4 = min(fr4, 1.0)

        # Assets & Vulnerabilities Impact on FR 1, FR 3, and FR 7
        for asset in zone.assets:
            for vuln in asset.vulnerabilities:
                # FR 3 (System Integrity) - Remote Code Execution / Memory Corruption
                if vuln.cvss_score >= 9.0 or vuln.cisa_kev:
                    fr3 = min(fr3, 1.0)

                # FR 7 (Resource Availability) - Controller crash / DoS
                if "Denial of Service" in vuln.title or "lock up" in vuln.description.lower():
                    fr7 = min(fr7, 1.0)

                # FR 1 (Authentication)
                if "Authentication Bypass" in vuln.title or "unauthenticated" in vuln.description.lower():
                    fr1 = min(fr1, 1.0)

            # Check for legacy insecure protocols on asset
            if "SMBv1" in asset.active_protocols:
                fr3 = min(fr3, 1.0)
                fr1 = min(fr1, 1.0)

        return SecurityLevelVector(
            fr1_iac=round(fr1, 1),
            fr2_uc=round(fr2, 1),
            fr3_si=round(fr3, 1),
            fr4_dc=round(fr4, 1),
            fr5_rdf=round(fr5, 1),
            fr6_tre=round(fr6, 1),
            fr7_ra=round(fr7, 1)
        )
