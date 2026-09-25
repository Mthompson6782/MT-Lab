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
            if zone.sl_gap > 0:
                vector = zone.achieved_sl_vector

                # Check FR 5
                if vector.fr5_rdf < 2.0:
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
                if vector.fr3_si < 2.0 or vector.fr7_ra < 2.0:
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
                if vector.fr1_iac < 2.0 or vector.fr4_dc < 2.0:
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

        return {
            "document_title": f"IEC 62443-3-2 Cybersecurity Requirements Specification (CRS) - {suc.name}",
            "facility_id": suc.suc_id,
            "target_sl": 2,
            "total_requirements": len(requirements),
            "requirements": requirements
        }
