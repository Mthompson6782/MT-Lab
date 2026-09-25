# Walmart Accomplishments (2026)

**Employee:** Michael Thompson, M.S.  
**Role:** Principal Engineer — Walmart Global Tech (Information Security / OT)  
**Location:** Bentonville, AR  
**Period:** 2026 – Present  
**Purpose:** Living document for end-of-year review, performance discussion, and raise justification. Update continuously.

---

## Role Context

Joined Walmart Global Tech in 2026 as Principal Engineer supporting the IoT/OT security program. Environment includes sensors, cameras, robots, printers, SCADA controllers, and industrial automation platforms across a massive retail footprint. Focus: designing, developing, and scaling security solutions that protect OT/IoT assets while enabling operations.

---

## Accomplishments Log

### Q3 2026 (September – Present)

- **Enterprise Resilience Dashboard** — Built and deployed an interactive, browser-based dashboard (React + Chart.js) for navigating enterprise infrastructure taxonomy and cyber-physical engineered controls. Adapted from the DHS/Idaho National Laboratory Cyber-Informed Engineering Engineered Controls Explorer and tailored to operational context.
  - Taxonomy browser: Division → Facility → Department → System → Component drill-down.
  - NIST CSF alignment: controls tagged and visualized across Identify, Protect, Detect, Respond, Recover.
  - Recursive analytics: live charts for control distribution and resilience coverage.
  - Self-contained architecture — no backend required. Source in `MT-Lab/resilience-dashboard/`.
  - *Impact:* Gives security and operations teams a shared, visual language for OT resilience posture.

- **HALBERD OT Defense Platform** — Continued development and demonstration of the open-source, low-SWaP OT/ICS cybersecurity platform (Happened-Before Language, eLEARN baseline engine, Effects Language threat emulation mapped to ATT&CK for ICS, EdgeReactor operator console). Positioned as a candidate tool for Walmart's OT visibility and non-disruptive response needs.
  - *Impact:* Demonstrates hands-on capability to detect, emulate, and respond to cyber-physical attacks without disrupting production.

- **SHANK OT Asset Intelligence** — Advanced OT asset management platform (part of the Blade Fleet) for deep, passive hardware and firmware inspection, Purdue/IEC 62443 segmentation audits, and contextual risk scoring. Complements HALBERD for full asset visibility.
  - *Impact:* Addresses the core OT challenge of knowing what is actually on the network — a prerequisite for any vulnerability management program.

- **CUTLASS** — Cyber Unified Threat Level Automated Site Survey. Automated IEC 62443-2 risk assessment engine that can be run against any site at any time. Ingests data from existing collection sources, then executes the full seven-step ZCR process end-to-end.
  - *Impact:* Turns a manual, periodic compliance exercise into continuous, on-demand risk assessment — scalable across the entire retail footprint without adding headcount.

- **SABER** — Solution Security Plan Automated Evaluator & Report. Completely redefined how Walmart produces security solution plans for OT devices. SABER ingests incoming SSPs and performs a fully automated OT evaluation, replacing a manual five-hour review process with a ~25-minute report.
  - *Time saved:* ~5 hours per report → ~25 minutes.
  - *Meeting reduction:* Eliminated 2 recurring meetings per week (5 people × 2 hours each).
  - *SLA impact:* OT task completion SLA rose from 21% to 94% completed within 7 days.
  - *Impact:* One of the largest process transformations of the year — faster, more consistent OT security evaluations with dramatically less human overhead.

- **EU Cyber Resilience Act (CRA) Leverage** — Identified and championed the EU Cyber Resilience Act as a lever Walmart can use to acquire SBOMs and HBOMs. Positioned the regulation as a practical acquisition pathway for software and hardware bill-of-materials data that strengthens OT/IoT supply-chain transparency and vulnerability management.
  - *Impact:* Opens a regulatory-backed channel for critical supply-chain intelligence that would otherwise be difficult or costly to obtain — directly feeds asset intelligence and risk assessment programs.

- **FEAR** — Find, Exploits, and Repair. Generates reasonable worst-case exploit scenarios from CUTLASS risk assessments and converts them into structured tabletop exercises. Teams practice the exact attack paths and failure modes before an adversary does, building muscle memory for detection, containment, and recovery.
  - *Impact:* Closes the gap between knowing you're vulnerable and knowing how to respond — turns abstract risk scores into rehearsed, operational readiness.

### Q2 2026

- *(Add entries here as they occur.)*

### Q1 2026

- *(Add entries here as they occur.)*

---

## Standards Leadership

- **IEC 62443 Adoption** — Drove Walmart's shift away from NIST SP 800-82 as the OT cybersecurity standard of choice, moving the organization toward IEC 62443. Actively shaping existing standards and practices to reflect IEC 62443 principles.
  - *Impact:* Strategic standards-level influence — sets the foundation for every OT security decision going forward, not just individual tools.

---

## Impact Themes (for Review Narrative)

1. **OT Visibility & Asset Intelligence** — Building the foundation to see and understand every OT/IoT asset across Walmart's footprint.
2. **Resilience & Cyber-Informed Engineering** — Translating federal CIE frameworks into practical, Walmart-specific tooling and dashboards.
3. **Non-Disruptive Defense** — Tools and approaches that protect operations without tripping lines or slowing the business.
4. **Standards Authority** — Co-author of NIST SP 800-82 Rev 3; active on IEC 62443 / ISA 99 and ISA 84 committees — bringing external credibility to internal program decisions.
5. **Process Automation & Efficiency** — Replacing manual, meeting-heavy OT workflows with automated evaluators that scale without headcount.
6. **Supply-Chain Transparency** — Using regulatory frameworks like the EU CRA to secure SBOMs and HBOMs for stronger OT/IoT vulnerability and risk management.
7. **Incident Readiness & Response** — Moving from static risk assessment to rehearsed response through automated scenario generation and tabletop exercises.

---

## Notes for End-of-Year Review

- Quantify wherever possible: number of assets inventoried, controls mapped, teams onboarded, time saved, risk reduced.
- Capture stakeholder quotes or adoption metrics for the dashboard and any deployed tools.
- Tie each accomplishment to business outcomes: uptime protected, compliance posture improved, incident response time reduced.
- Update this file monthly — don't wait until December.

---

*Last updated: 2026-09-22*