"""
Cybersecurity Requirements Specification (CRS) Generator (IEC 62443-3-2 Clause Z6).
Generates structured engineering requirements and compensating controls
necessary to achieve SL-2 compliance across all OT zones.
"""

from typing import Dict, List
from core.models import SystemUnderConsideration, Zone


class CRSGenerator:
    def generate_crs_document(self, suc: SystemUnderConsideration) -> Dict:
        """
        Produces the formal Cybersecurity Requirements Specification.
        """
        requirements = []
        req_id = 1

        for z_id, zone in suc.zones.items():
            # Only DEFICIENT FRs (evidence of a gap) generate remediation requirements.
            # UNVERIFIED FRs go to the site-survey worklist instead of generating findings.
            deficient = {fr for fr, r in zone.fr_results.items() if r.status == "deficient"}
            if deficient:
                vector = zone.achieved_sl_vector

                # Check FR 5
                if "FR5" in deficient:
                    requirements.append({
                        "req_id": f"CRS-{suc.suc_id}-{req_id:03d}",
                        "target_zone": zone.name,
                        "zone_id": z_id,
                        "foundational_req": "FR 5: Restricted Data Flow",
                        "priority": "P0 - Immediate / Safety Block",
                        "title": "Remediate Zone Boundary Conduit Bypass",
                        "specification": (
                            f"Audit and sever all direct conduits bypassing the L3.5 DMZ into {zone.name}. "
                            "Re-route traffic through stateful industrial firewalls with protocol-specific allow-lists."
                        ),
                        "responsible_team": "Enterprise OT Network Engineering & Facility Maintenance"
                    })
                    req_id += 1

                # Check FR 3 & FR 7
                if deficient & {"FR3", "FR7"}:
                    requirements.append({
                        "req_id": f"CRS-{suc.suc_id}-{req_id:03d}",
                        "target_zone": zone.name,
                        "zone_id": z_id,
                        "foundational_req": "FR 3: System Integrity & FR 7: Resource Availability",
                        "priority": "P1 - Critical",
                        "specification": (
                            f"Deploy industrial firewall Deep Packet Inspection (DPI) rules to shield vulnerable PLCs in {zone.name} "
                            "from unauthenticated malformed packets (CIP buffer overflows / S7comm-plus memory corruption). "
                            "Stage firmware patching during the next scheduled planned maintenance window."
                        ),
                        "responsible_team": "Enterprise Automation & Controls Engineering"
                    })
                    req_id += 1

                # Check FR 1 & FR 4
                if deficient & {"FR1", "FR4"}:
                    requirements.append({
                        "req_id": f"CRS-{suc.suc_id}-{req_id:03d}",
                        "target_zone": zone.name,
                        "zone_id": z_id,
                        "foundational_req": "FR 1: Identification & FR 4: Confidentiality",
                        "priority": "P2 - High",
                        "specification": (
                            f"Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in {zone.name}. "
                            "Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory)."
                        ),
                        "responsible_team": "Enterprise OT Systems Administration & Cybersecurity Operations"
                    })
                    req_id += 1

            # FRs without a dedicated template above (e.g. FR2 Use Control, FR6 Timely Response):
            # one requirement per deficient SR, carrying the evidence that triggered it.
            for fr in sorted(deficient - {"FR1", "FR3", "FR4", "FR5", "FR7"}):
                for r in zone.sr_results:
                    if r.fr == fr and r.status in ("partial", "not_met", "observed_violation"):
                        requirements.append({
                            "req_id": f"CRS-{suc.suc_id}-{req_id:03d}",
                            "target_zone": zone.name,
                            "zone_id": z_id,
                            "foundational_req": f"{fr}: {r.sr_id} {r.title}",
                            "priority": "P2 - High",
                            "specification": f"Close {r.sr_id} gap to SL-2 ({r.status.replace('_', ' ')}): {r.detail}",
                            "responsible_team": "Enterprise OT Systems Administration & Cybersecurity Operations"
                        })
                        req_id += 1

        worklist = [
            {"zone_id": z.zone_id, "zone": z.name, "sr": item}
            for z in suc.zones.values() for item in z.survey_worklist
        ]

        return {
            "verification_worklist": worklist,   # SRs with no evidence: survey before claiming SL-A
            "document_title": f"IEC 62443-3-2 Cybersecurity Requirements Specification (CRS) - {suc.name}",
            "facility_id": suc.suc_id,
            "target_sl": 2,
            "total_requirements": len(requirements),
            "requirements": requirements
        }
