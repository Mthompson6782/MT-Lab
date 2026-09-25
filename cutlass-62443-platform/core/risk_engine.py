"""
IEC 62443-3-2 Detailed Risk Assessment Engine.
Calculates Unmitigated and Residual Cyber-Physical Risk (Likelihood x Consequence)
tailored for enterprise OT operations (MHE, ASRS, AGVs, Ammonia Cold Chain).
"""

from typing import List, Tuple
from core.models import Asset, Conduit, SystemUnderConsideration, ThreatScenario, Zone


class RiskEngine:
    def __init__(self):
        pass

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
        Synthesizes threat scenarios based on assets, RUNE CVEs, and network reachability.
        """
        scenarios: List[ThreatScenario] = []

        # Check inbound conduit posture
        has_insecure_conduit = False
        has_direct_bypass = False
        for c_id in zone.inbound_conduits:
            c = conduits.get(c_id)
            if c:
                if not c.has_firewall_inspection or not c.is_encrypted:
                    has_insecure_conduit = True
                if c.violates_policy:
                    has_direct_bypass = True

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
                elif "SORTER" in zone.zone_id or "ASRS" in zone.zone_id:
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
                unmit_level = self._risk_level(unmit_score)

                # Compensating controls formulation
                controls = self._generate_compensating_controls(asset, vuln, has_insecure_conduit)

                # Residual Risk (Likelihood drops significantly with compensating controls)
                residual_likelihood = max(1, unmitigated_likelihood - 2)
                residual_consequence = unmitigated_consequence  # Inherent consequence stays constant
                residual_score = residual_likelihood * residual_consequence
                residual_level = self._risk_level(residual_score)

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
                        residual_risk_level=residual_level
                    )
                )
                scenario_counter += 1

        return scenarios

    def _risk_level(self, score: int) -> str:
        if score >= 16:
            return "Critical"
        elif score >= 10:
            return "High"
        elif score >= 5:
            return "Medium"
        return "Low"

    def _generate_compensating_controls(self, asset: Asset, vuln, has_insecure_conduit: bool) -> List[str]:
        controls = []
        if has_insecure_conduit:
            controls.append("Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.")

        if "CIP" in asset.active_protocols or "Modbus-TCP" in asset.active_protocols:
            controls.append(
                f"Deploy Industrial Firewall Deep Packet Inspection (DPI) rule restricting {asset.ip_address} "
                "to authorized engineering workstation IPs only; block unauthorized firmware download function codes."
            )

        if asset.device_type in ["HMI", "Engineering_Workstation"]:
            controls.append("Disable unneeded legacy protocols (SMBv1, plaintext HTTP); enforce MFA on RDP/bastion jumpbox.")

        controls.append(f"Configure Armis anomaly detection policy to alert on anomalous connection attempts to {asset.ip_address}.")
        return controls
