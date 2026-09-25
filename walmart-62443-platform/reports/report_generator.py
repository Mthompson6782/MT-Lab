"""
IEC 62443-3-2 Formal Report & Audit Deliverable Generator.
Generates:
1. Markdown Audit Report (Compliant with ISA/IEC 62443-3-2 documentation requirements)
2. JSON Assessment Export (For SIEM, GRC tooling, and Armis/RUNE feedback loops)
"""

import json
import os
from typing import Dict
from core.models import SystemUnderConsideration


class ReportGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_json_report(self, suc: SystemUnderConsideration, filename: str = "iec62443_assessment.json") -> str:
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(suc.model_dump(), f, indent=2)
        return filepath

    def generate_markdown_report(
        self,
        suc: SystemUnderConsideration,
        executive_summary: str,
        crs_doc: Dict,
        filename: str = "iec62443_3_2_audit_report.md"
    ) -> str:
        filepath = os.path.join(self.output_dir, filename)

        md = []
        md.append(f"# ⚔️ CUTLASS: Cyber Unified Threat Level Automated Site Survey")
        md.append(f"### ISA/IEC 62443-3-2 & 62443-3-3 Detailed Cyber-Physical Risk Assessment")
        md.append(f"**Facility / System Under Consideration (SuC):** {suc.name}")
        md.append(f"**Facility ID:** {suc.suc_id} | **Facility Type:** {suc.facility_type}")
        md.append(f"**Assessment Date:** {suc.assessment_timestamp}")
        md.append(f"**Target Security Level (Global):** SL-T {suc.target_security_level_global}")
        md.append(f"**Facility SL-2 Compliance:** {suc.sl2_compliance_percentage}%")
        md.append(f"**Overall Inherent Risk Score:** {suc.overall_risk_score} / 25")
        md.append("\n---\n")

        # Executive Briefing
        md.append("## 1. Executive Briefing")
        md.append(executive_summary)
        md.append("\n---\n")

        # Z1 & Z3 Zones and Conduits Table
        md.append("## 2. System Partitioning: Zones & Conduits (Clause Z1 & Z3)")
        md.append("| Zone ID | Zone Name | Purdue Level | Target SL | Achieved SL (SL-A) | SL Gap | Assets Count | Criticality |")
        md.append("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |")
        for z in suc.zones.values():
            md.append(
                f"| `{z.zone_id}` | {z.name} | {z.purdue_level.value} | SL-{z.target_sl} | **SL-{z.overall_achieved_sl}** | "
                f"{'⚠️ Gap: ' + str(z.sl_gap) if z.sl_gap > 0 else '✅ Compliant'} | {len(z.assets)} | {z.zone_criticality}/5 |"
            )
        md.append("\n### Network Conduits Inventory")
        md.append("| Conduit ID | Path | Encrypted | L3.5 DMZ Traversal | Firewall Inspection | Policy Status |")
        md.append("| :--- | :--- | :---: | :---: | :---: | :--- |")
        for c in suc.conduits.values():
            status = "🚨 VIOLATION" if c.violates_policy else "✅ Compliant"
            md.append(
                f"| `{c.conduit_id}` | `{c.from_zone_id}` ➔ `{c.to_zone_id}` | {'Yes' if c.is_encrypted else 'No'} | "
                f"{'Yes' if c.traverses_dmz else 'No'} | {'Yes' if c.has_firewall_inspection else 'No'} | {status} |"
            )
        md.append("\n---\n")

        # Security Level Vector Table
        md.append("## 3. Security Level Vector Breakdown (Clause Z5 / IEC 62443-3-3)")
        md.append("SL-T is set to **SL 2** across all Foundational Requirements (FR 1 to FR 7):\n")
        md.append("| Zone Name | FR 1 (IAC) | FR 2 (UC) | FR 3 (SI) | FR 4 (DC) | FR 5 (RDF) | FR 6 (TRE) | FR 7 (RA) | SL-A Min | Status |")
        md.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |")
        for z in suc.zones.values():
            v = z.achieved_sl_vector
            status = "✅ PASS" if z.overall_achieved_sl >= 2.0 else "❌ DEFICIENT"
            md.append(f"| {z.name} | {v.fr1_iac} | {v.fr2_uc} | {v.fr3_si} | {v.fr4_dc} | {v.fr5_rdf} | {v.fr6_tre} | {v.fr7_ra} | **{z.overall_achieved_sl}** | {status} |")
        md.append("\n---\n")

        # Threat Scenarios & Detailed Risk Assessment
        md.append("## 4. Threat Scenarios & Detailed Risk Assessment (Clause Z5)")
        for z in suc.zones.values():
            if z.threat_scenarios:
                md.append(f"### Zone: {z.name} (`{z.zone_id}`)")
                for s in z.threat_scenarios:
                    md.append(f"#### 🔴 Scenario: {s.title} (`{s.scenario_id}`)")
                    md.append(f"- **Vulnerability Reference:** `{s.cve_reference}`")
                    md.append(f"- **Threat Vector:** {s.threat_vector}")
                    md.append(f"- **Operational & Safety Consequence:** {s.operational_impact_summary}")
                    md.append(f"- **Unmitigated Risk:** Likelihood = {s.unmitigated_likelihood}/5, Consequence = {s.unmitigated_consequence}/5 ➔ **Score: {s.unmitigated_risk_score} ({s.unmitigated_risk_level})**")
                    md.append("- **Recommended Compensating Controls:**")
                    for ctrl in s.recommended_compensating_controls:
                        md.append(f"  - {ctrl}")
                    md.append(f"- **Residual Risk Post-Mitigation:** Likelihood = {s.residual_likelihood}/5, Consequence = {s.residual_consequence}/5 ➔ **Score: {s.residual_risk_score} ({s.residual_risk_level})**\n")

        # Attack Graphs & Blast Radius Section
        md.append("\n---\n")
        md.append("## 5. Multi-Hop Attack Graphs & Cyber-Physical Blast Radius Analysis")
        md.append(f"**Total Facility Financial Loss Exposure:** **${suc.total_financial_loss_exposure_usd:,.2f} USD**\n")
        md.append("| Attack Path ID | Path Name | Target Zone / Asset | Primary Failure Mode | Downtime (hrs) | Financial Loss ($) | Stores Impacted |")
        md.append("| :--- | :--- | :--- | :--- | :---: | :---: | :---: |")
        for p in suc.attack_paths:
            br = p.blast_radius
            md.append(
                f"| `{p.path_id}` | {p.title} | `{p.target_asset}` | {br.primary_failure_mode[:45]}... | "
                f"{br.estimated_downtime_hours}h | **${br.total_loss_exposure_usd:,.0f}** | {br.affected_supply_chain_stores} stores |"
            )

        for p in suc.attack_paths:
            br = p.blast_radius
            md.append(f"\n### ⚔️ Path Details: {p.title} (`{p.path_id}`)")
            md.append(f"- **Adversary Profile:** {p.adversary_profile}")
            md.append(f"- **Initial Access Entry Point:** {p.entry_point} ➔ **Target Asset:** `{p.target_asset}` ({p.target_zone})")
            md.append(f"- **Safety Hazard Level:** {br.safety_hazard_level}")
            md.append(f"- **Environmental Impact:** {br.environmental_impact}")
            md.append(f"- **Financial Downtime Burn:** ${br.hourly_financial_burn_usd:,.0f}/hour | **Total Estimated Loss:** ${br.total_loss_exposure_usd:,.0f}")
            md.append(f"- **Affected Walmart Retail Supercenters:** {br.affected_supply_chain_stores} Stores Delayed")
            md.append("\n**Attack Hop Sequence & Barrier Breaches:**")
            for h in p.hops:
                cve_tag = f" (`{h.cve_id}`)" if h.cve_id else ""
                md.append(f"  {h.step_number}. **[{h.action_type}]** `{h.source_node}` ➔ `{h.target_node}`")
                md.append(f"     - *Vector:* {h.vector}{cve_tag}")
                md.append(f"     - *Violated SL-2 Barrier:* {h.violated_sl2_barrier}")
            md.append("\n**Cascading Supply Chain & Operational Gridlock:**")
            md.append(f"  - **Upstream:** {'; '.join(br.cascading_upstream_impact)}")
            md.append(f"  - **Downstream:** {'; '.join(br.cascading_downstream_impact)}")

        # Clause Z6 CRS
        md.append("\n---\n")
        md.append("## 6. Cybersecurity Requirements Specification (CRS) (Clause Z6)")
        md.append("| Req ID | Priority | Target Zone | Standard Requirement | Actionable Engineering Specification | Responsible Team |")
        md.append("| :--- | :--- | :--- | :--- | :--- | :--- |")
        for req in crs_doc.get("requirements", []):
            md.append(f"| `{req['req_id']}` | **{req['priority']}** | {req['target_zone']} | {req['foundational_req']} | {req['specification']} | {req['responsible_team']} |")

        with open(filepath, "w", encoding="utf-8") as f:
            f.write("\n".join(md))

        return filepath
