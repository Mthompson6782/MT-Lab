<div align="center">

# 🛡️ MT-Lab
### *Industrial & OT Cybersecurity Engineering Studio*
**Mission-Critical Security Engineering for Industrial Control Systems (ICS), SCADA, & Critical Infrastructure**

[![Launch MT-Lab Portal](https://img.shields.io/badge/▶_LAUNCH_MT--LAB-LIVE_ENGINEERING_PORTAL-0071dc?style=for-the-badge&logo=shield&logoColor=white)](https://mthompson6782.github.io/MT-Lab/)
[![Standards](https://img.shields.io/badge/STANDARDS-ISA%2FIEC_62443--3--2_%7C_62443--3--3_%7C_NIST_SP_800--82-0071dc?style=for-the-badge)](https://www.isa.org/)
[![Target SL](https://img.shields.io/badge/TARGET_SECURITY_LEVEL-SL--T_2_(GLOBAL)-f59e0b?style=for-the-badge)]()
[![Process Safety](https://img.shields.io/badge/OPERATIONS-ZERO--TRIP_FAIL--SAFE-10b981?style=for-the-badge)]()

<br/>

> *"In operational technology, cyber defense is not about data privacy—it is about cyber-physical integrity, process continuity, and the preservation of human life."*

<br/>

---

### 👥 SELECT ENGINEERING PERSPECTIVE
*Explore technical architectures, live consoles, and audit specifications:*

| [🛡️ OT / ICS Cyber Engineer](https://mthompson6782.github.io/MT-Lab/halberd-demo.html) | [⚡ Controls & Automation Lead](https://mthompson6782.github.io/MT-Lab/cutlass-demo.html) | [📋 OT GRC & Compliance Auditor](https://mthompson6782.github.io/MT-Lab/cutlass-demo.html) | [🏛️ Critical Infrastructure Architect](https://mthompson6782.github.io/MT-Lab/halberd-executive.html) |
| :---: | :---: | :---: | :---: |
| Modbus/CIP DPI, Out-of-Sequence Logic | Purdue Conduits, Zero-Trip Operations | ISA/IEC 62443-3-2, SL-V Evaluation | Multi-Hop Attack Graphs & Blast Radius |

---

</div>

<br/>

## 📌 Executive Overview

**MT-Lab** is an engineering laboratory dedicated to operational technology (OT) cybersecurity, industrial control systems (ICS/SCADA), and critical infrastructure defense. The lab focuses on closing the operational gap between enterprise IT security tooling and the deterministic safety constraints of physical plants.

The laboratory currently hosts two flagship cyber-physical platforms:

1. **[⚔️ CUTLASS™](#-cutlass---cyber-unified-threat-level-automated-site-survey)**: Automated ISA/IEC 62443-3-2 & 62443-3-3 risk assessment, Purdue Model zone/conduit partitioning, live Armis telemetry ingestion, multi-hop attack graphs, and supply chain blast radius modeling.
2. **[🛡️ HALBERD™](#-halberd---happened-before-analytics--logic-baseline-for-edge-response--defense)**: Low-SWaP edge cybersecurity engine running at Purdue Levels 1 & 2, utilizing Lamport Happened-Before causal tracking to intercept unauthorized PLC commands, out-of-sequence logic, and setpoint anomalies without false trips.

---

## ⚔️ CUTLASS™ - Cyber Unified Threat Level Automated Site Survey
### *Automated ISA/IEC 62443-3-2 & 62443-3-3 Risk Platform for Enterprise OT*

[![CUTLASS Demo](https://img.shields.io/badge/🎮_LAUNCH-CUTLASS_LIVE_CONSOLE-0071dc?style=flat-square&logo=googlechrome&logoColor=white)](https://mthompson6782.github.io/MT-Lab/cutlass-demo.html)
[![Codebase](https://img.shields.io/badge/📁_SOURCE_CODE-cutlass--62443--platform-gray?style=flat-square&logo=github)](cutlass-62443-platform/)
[![Audit Deliverable](https://img.shields.io/badge/📄_AUDIT_REPORT-IEC_62443_CRS.md-amber?style=flat-square)](cutlass-62443-platform/reports/iec62443_3_2_audit_report.md)

<div align="center">
<img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80" alt="CUTLASS OT Risk Engine" width="850" style="border-radius: 8px; border: 1px solid #1e293b;"/>
</div>

### Problem Statement
Enterprise operational environments (distribution centers, cold storage, automated material handling, manufacturing plants) comprise millions of legacy PLCs, sensors, and HMIs. Traditional periodic spreadsheet risk assessments fail at scale, while active IT vulnerability scanners routinely crash legacy industrial controllers.

### Core Capabilities & Methodology Alignment
CUTLASS automates the entire six-clause **ISA/IEC 62443-3-2** risk assessment lifecycle:

| Clause | Standard Activity | Platform Automation |
| :--- | :--- | :--- |
| **Z1** | **System Under Consideration (SuC)** | Scopes industrial plant perimeters, facilities, and sub-systems from passive network inventory. |
| **Z2** | **Initial Risk Assessment** | Evaluates unmitigated worst-case cyber-physical consequence ($C$) across safety, environmental, and financial dimensions. |
| **Z3** | **Zone & Conduit Partitioning** | Maps assets into strict Purdue Model boundaries (L0 through L5) and quantifies conduit traffic. |
| **Z4** | **Risk Threshold Screening** | Automatically routes critical cyber-physical zones (e.g. Ammonia Refrigeration, High-Speed Sorters) to detailed analysis. |
| **Z5** | **Detailed Assessment & SL-V** | Calculates Likelihood $\times$ Consequence ($R = L \times C$) and computes the Achieved Security Level Vector ($SL\text{-}V = [AC, UC, SI, DC, RDF, TRE, RA]$). |
| **Z6** | **Cybersecurity Requirements (CRS)** | Auto-generates actionable engineering specifications and OT-safe compensating controls. |

### Technical Highlights
- **Passive Ingestion**: Ingests live telemetry from Armis OT sensors and matches active vulnerabilities via internal RUNE CVE feeds.
- **Multi-Hop Attack Graphs**: Traces adversary pivot paths from compromised enterprise DMZ jump boxes down into OT control rings.
- **Supply Chain Blast Radius**: Models real-world financial loss ($/hour) and downstream logistics disruptions across distribution networks.
- **OT-Safe Compensating Controls**: Synthesizes DPI filtering rules and switch ACLs so plant operations can maintain continuous runtime without requiring mid-shift controller reboots.

👉 **[Launch Interactive CUTLASS Console](https://mthompson6782.github.io/MT-Lab/cutlass-demo.html)**

---

## 🛡️ HALBERD™ - Happened-Before Analytics & Logic Baseline for Edge Response & Defense
### *Edge-Native OT/ICS Cybersecurity & Causal Threat Interception*

[![HALBERD Console](https://img.shields.io/badge/🎮_LAUNCH-HALBERD_TECHNICAL_CONSOLE-0d9488?style=flat-square&logo=googlechrome&logoColor=white)](https://mthompson6782.github.io/MT-Lab/halberd-demo.html)
[![Executive Briefing](https://img.shields.io/badge/👔_LAUNCH-EXECUTIVE_STORY_BRIEFING-f59e0b?style=flat-square)](https://mthompson6782.github.io/MT-Lab/halberd-executive.html)
[![Codebase](https://img.shields.io/badge/📁_SOURCE_CODE-halberd--ot-gray?style=flat-square&logo=github)](halberd-ot/)

<div align="center">
<img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" alt="HALBERD Edge Defense" width="850" style="border-radius: 8px; border: 1px solid #1e293b;"/>
</div>

### Problem Statement
Traditional signature-based intrusion detection systems (IDS) deployed in IT networks fail at Purdue Levels 1 & 2 because OT adversaries weaponize **syntactically valid protocol commands**. When an attacker issues a legitimate `Write Single Coil` (Modbus FC 05) or `CIP Set Attribute Single` command to open an ammonia release valve or alter chlorine dosing, conventional firewalls see standard traffic.

### Core Capabilities & Scientific Innovation
HALBERD brings distributed systems formal methods to industrial edge cybersecurity:

- **Lamport Happened-Before ($a \to b$) Causal Engine**: Constructs true chronological dependency trees across distributed controllers, identifying out-of-order execution, command race conditions, and replay attacks.
- **Deep Packet Inspection (DPI)**: Passively parses Modbus-TCP, Ethernet/IP (CIP), and PROFINET at microsecond wire speeds with zero injected jitter into real-time control loops.
- **Cyber-Physical Invariant Validation**: Verifies PLC command arguments against physical plant boundary models (e.g., verifying that a pump start command is preceded by a verified valve open status within allowable $\Delta t$).
- **Zero-Trip Process Safety**: Designed strictly as a non-intrusive edge monitor with deterministic fail-safe behavior that will never cause an uncommanded process shutdown.
- **Low-SWaP & Air-Gapped**: Runs on low size, weight, and power (SWaP) edge hardware (DIN-rail industrial PCs, Raspberry Pi CM4, edge gateways) without cloud dependencies.

👉 **[Launch Interactive HALBERD Console](https://mthompson6782.github.io/MT-Lab/halberd-demo.html)** &nbsp;|&nbsp; **[View Executive Story Briefing](https://mthompson6782.github.io/MT-Lab/halberd-executive.html)**

---

## 🏛️ Defense-in-Depth Architecture: CUTLASS + HALBERD

Together, **CUTLASS** and **HALBERD** deliver comprehensive defense-in-depth across the Purdue Enterprise Reference Architecture:

```
+------------------------------------------------------------------------------------+
|  PURDUE MODEL        |  PLATFORM ROLE               |  SECURITY FOCUS              |
+======================+==============================+==============================+
|  Level 4 / 5         |  CUTLASS™                    |  Enterprise Risk Governance  |
|  Enterprise & DMZ    |  Automated Site Survey       |  Policy-as-Code Ingestion    |
|                      |  Threat Scenario Synthesis   |  Audit & Compliance Reports  |
+----------------------+------------------------------+------------------------------+
|  Level 3             |  CUTLASS™                    |  Zone & Conduit Boundary     |
|  Site Operations     |  Armis & RUNE Telemetry      |  Attack Graph Lateral Paths  |
|  & Plant SCADA       |  Supply Chain Blast Radius   |  Compensating Controls       |
+----------------------+------------------------------+------------------------------+
|  Level 2             |  HALBERD™                    |  HMI / SCADA Link Security   |
|  Area Supervisory    |  Edge Causal Monitor         |  Modbus/CIP Deep Inspection  |
|  Control             |  Process Boundary Check      |  Unauthorized Override Alert |
+----------------------+------------------------------+------------------------------+
|  Level 1             |  HALBERD™                    |  Lamport Happened-Before     |
|  Basic Control       |  Zero-Trip Edge Defense      |  PLC Program Integrity      |
|  (PLCs, RTUs, DCS)   |  Air-Gapped DIN-Rail Engine  |  Physical Safety Interlocks  |
+----------------------+------------------------------+------------------------------+
|  Level 0             |  PHYSICAL PROCESS            |  Pumps, Motors, Ammonia,     |
|  Sensors & Actuators |  Protected Assets            |  Sorters, Valves, Conveyors  |
+------------------------------------------------------------------------------------+
```

---

## 🚀 Live Portals & Quick Links

| Resource | Description | Direct Link |
| :--- | :--- | :--- |
| **MT-Lab Engineering Portal** | Interactive catalog & dashboard for OT cyber engineers | [Launch Portal](https://mthompson6782.github.io/MT-Lab/) |
| **CUTLASS Console** | ISA/IEC 62443-3-2 automated site survey & topology map | [Open CUTLASS UI](https://mthompson6782.github.io/MT-Lab/cutlass-demo.html) |
| **HALBERD Technical Console** | Interactive Happened-Before edge threat simulator | [Open HALBERD UI](https://mthompson6782.github.io/MT-Lab/halberd-demo.html) |
| **HALBERD Executive Briefing** | C-Suite & leadership narrative with interactive audio | [Open Briefing](https://mthompson6782.github.io/MT-Lab/halberd-executive.html) |
| **CUTLASS Codebase** | Python backend, models, risk engine, connectors | [Browse Code](cutlass-62443-platform/) |
| **HALBERD Codebase** | Edge sensor modules, parsers, Lamport logic | [Browse Code](halberd-ot/) |

---

## 📄 License & Standards Compliance

- **Software License**: Distributed under the MIT License. See [LICENSE](LICENSE) for details.
- **Referenced Standards**:
  - ISA/IEC 62443-3-2 (Security risk assessment for system design)
  - ISA/IEC 62443-3-3 (System security requirements and security levels)
  - NIST SP 800-82 Rev. 3 (Guide to Operational Technology Security)
  - CISA Cross-Sector Cybersecurity Performance Goals (CPGs)

---

<div align="center">
<b>MT-Lab</b> • Engineered by Michael Thompson • 2026
</div>
