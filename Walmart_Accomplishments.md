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

- **Walmart Resilience Dashboard** — Built and deployed an interactive, browser-based dashboard (React + Chart.js) for navigating Walmart's infrastructure taxonomy and cyber-physical engineered controls. Adapted from the DHS/Idaho National Laboratory Cyber-Informed Engineering Engineered Controls Explorer and tailored to Walmart's operational context.
  - Taxonomy browser: Division → Facility → Department → System → Component drill-down.
  - NIST CSF alignment: controls tagged and visualized across Identify, Protect, Detect, Respond, Recover.
  - Recursive analytics: live charts for control distribution and resilience coverage.
  - Self-contained architecture — no backend required. Source in `MT-Lab/walmart-dashboard/`.
  - *Impact:* Gives security and operations teams a shared, visual language for OT resilience posture.

- **HALBERD OT Defense Platform** — Continued development and demonstration of the open-source, low-SWaP OT/ICS cybersecurity platform (Happened-Before Language, eLEARN baseline engine, Effects Language threat emulation mapped to ATT&CK for ICS, EdgeReactor operator console). Positioned as a candidate tool for Walmart's OT visibility and non-disruptive response needs.
  - *Impact:* Demonstrates hands-on capability to detect, emulate, and respond to cyber-physical attacks without disrupting production.

- **SHANK OT Asset Intelligence** — Advanced OT asset management platform (part of the Blade Fleet) for deep, passive hardware and firmware inspection, Purdue/IEC 62443 segmentation audits, and contextual risk scoring. Complements HALBERD for full asset visibility.
  - *Impact:* Addresses the core OT challenge of knowing what is actually on the network — a prerequisite for any vulnerability management program.

- **CUTLASS** — Cyber Unified Threat Level Automated Site Survey. Automated IEC 62443-2 risk assessment engine that can be run against any site at any time. Ingests data from existing collection sources, then executes the full seven-step ZCR process end-to-end.
  - *Impact:* Turns a manual, periodic compliance exercise into continuous, on-demand risk assessment — scalable across the entire retail footprint without adding headcount.

### Q2 2026

- *(Add entries here as they occur.)*

### Q1 2026

- *(Add entries here as they occur.)*

---

## Impact Themes (for Review Narrative)

1. **OT Visibility & Asset Intelligence** — Building the foundation to see and understand every OT/IoT asset across Walmart's footprint.
2. **Resilience & Cyber-Informed Engineering** — Translating federal CIE frameworks into practical, Walmart-specific tooling and dashboards.
3. **Non-Disruptive Defense** — Tools and approaches that protect operations without tripping lines or slowing the business.
4. **Standards Authority** — Co-author of NIST SP 800-82 Rev 3; active on IEC 62443 / ISA 99 and ISA 84 committees — bringing external credibility to internal program decisions.

---

## Notes for End-of-Year Review

- Quantify wherever possible: number of assets inventoried, controls mapped, teams onboarded, time saved, risk reduced.
- Capture stakeholder quotes or adoption metrics for the dashboard and any deployed tools.
- Tie each accomplishment to business outcomes: uptime protected, compliance posture improved, incident response time reduced.
- Update this file monthly — don't wait until December.

---

*Last updated: 2026-09-22*