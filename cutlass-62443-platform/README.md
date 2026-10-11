# ⚔️ CUTLASS™
### *Cyber Unified Threat Level Automated Site Survey*
**Automated ISA/IEC 62443-3-2 & 62443-3-3 Risk Platform for Enterprise OT**

[![CUTLASS](https://img.shields.io/badge/CUTLASS-CYBER_UNIFIED_THREAT_LEVEL_AUTOMATED_SITE_SURVEY-0071dc.svg?style=for-the-badge&logo=shield)](https://github.com/Mthompson6782/MT-Lab)
[![Standards](https://img.shields.io/badge/STANDARDS-ISA%2FIEC%2062443--3--2%20%7C%2062443--3--3-blue.svg)](https://www.isa.org/)
[![Target SL](https://img.shields.io/badge/TARGET%20SECURITY%20LEVEL-SL--T%202%20(GLOBAL)-amber.svg)]()
[![Asset Source](https://img.shields.io/badge/TELEMETRY-ARMIS%20OT-0071dc.svg)]()
[![CVE Intelligence](https://img.shields.io/badge/VULN%20FEED-CVE%20INTEL%20FEED-red.svg)]()
[![AI Engine](https://img.shields.io/badge/AI%20COPILOT-HYBRID%20LLM%20%2B%20DETERMINISTIC-purple.svg)]()

---

## 📌 Executive Overview

**CUTLASS (Cyber Unified Threat Level Automated Site Survey)** is an enterprise-scale cyber-physical risk assessment platform engineered specifically for modern operational technology environments. Manual, spreadsheet-driven risk assessments fail at enterprise scale across hundreds of industrial facilities and millions of OT devices. CUTLASS automates the 62443-3-2 lifecycle by ingesting:
1. **Live Network Telemetry & OT Inventory from Armis** (Asset discovery, Purdue levels, MAC/IP, communication protocols, network boundaries).
2. **Vulnerability Intelligence Feeds** (Active CVEs, CVSS scores, CISA KEV status, OT exploitability rank).
3. **Enterprise Standards & Policies** (Policy-as-code YAML enforcement).
4. **Mandated Target Security Level 2 (SL-T 2)** across all operational zones.

---

## 🏛️ IEC 62443-3-2 Methodology Alignment

| Clause | Standard Activity | Platform Automation |
| :--- | :--- | :--- |
| **Z1** | **Identify the System Under Consideration (SuC)** | Auto-groups assets into facility perimeters (e.g. DC #104). |
| **Z2** | **Initial Risk Assessment** | Calculates unmitigated cyber-physical consequence on plant operations. |
| **Z3** | **Zone & Conduit Partitioning** | Purdue Model (L0-L5) boundary grouping & network conduit mapping. |
| **Z4** | **Risk Assessment Threshold Screening** | Automatically routes high-criticality zones (Ammonia, Sorters) to detailed assessment. |
| **Z5** | **Detailed Risk Assessment & SL-V Evaluation** | Calculates $Likelihood \times Consequence$ and computes Achieved Security Level Vector ($SL\text{-}V = [AC, UC, SI, DC, RDF, TRE, RA]$). |
| **Z6** | **Cybersecurity Requirements Specification (CRS)** | Generates actionable engineering requirements and OT-safe compensating controls. |

---

## 🤖 Role of AI & LLM Components

The platform uses a **Hybrid Architecture**:
- **Deterministic Engine**: Mathematical risk calculations ($R = L \times C$), Purdue boundary rules, and boolean SL-2 compliance checks are 100% deterministic and tamper-proof for regulatory auditors (TÜV, exida, ISA).
- **AI / LLM Intelligence Engine**:
  1. **Threat Scenario Synthesis**: Translates technical CVE mechanics + Armis device profiles into realistic MITRE ATT&CK for ICS attack paths.
  2. **OT-Safe Compensating Control Generator**: When PLCs cannot be patched due to operational run constraints, the AI generates actionable industrial firewall ACLs, Modbus/CIP Deep Packet Inspection (DPI) rules, and network micro-segmentation configurations.
  3. **Policy-to-Rule Ingestion Assistant**: Maps unstructured enterprise standards and SOP documents directly into machine-readable IEC 62443-3-3 rule sets.
  4. **Executive Briefing & Audit Narrative Generator**: Writes CISO / VP of Supply Chain executive briefings and audit evidence statements.
  5. **Natural Language Copilot**: Enables OT engineers to query the platform in plain English (*"Which ammonia controllers are exposed to the DMZ?"*).

---

## 🚀 Quickstart & Usage

### 1. Run the Complete Assessment Pipeline
```powershell
cd C:\Users\mthom\.gemini\antigravity\scratch\MT-Lab\cutlass-62443-platform
python main.py
```

### 2. Launch the Interactive Web Dashboard
```powershell
python main.py --serve --port 8080
```
Open your browser to: `http://localhost:8080/index.html`

### 3. Generated Deliverables
- **Markdown Audit Report**: `reports/iec62443_3_2_audit_report.md`
- **Machine JSON Data**: `reports/iec62443_assessment.json`
- **Interactive Single-Page UI**: `ui/index.html`

---

## 📁 Repository Structure

```
cutlass-62443-platform/
├── config/
│   ├── standards/
│   │   ├── iec62443_sl2_requirements.yaml  # IEC 62443-3-3 FR 1-7 SL-2 requirements
│   │   └── enterprise_ot_policy.yaml       # Enterprise baseline OT rules
│   └── consequence_matrix.yaml             # MHE, ASRS, Ammonia impact matrix
├── connectors/
│   ├── armis_connector.py                  # Armis API & telemetry ingest
│   └── cve_connector.py                    # CVE intelligence feed client
├── core/
│   ├── models.py                           # Pydantic data schemas
│   ├── zone_partitioner.py                 # Purdue Zone & Conduit partitioner (Z1 & Z3)
│   ├── risk_engine.py                      # Likelihood x Consequence calculator (Z2 & Z5)
│   ├── sl_evaluator.py                     # SL-A vs SL-T 2 gap evaluator
│   └── crs_generator.py                    # Cybersecurity Requirements Specification (Z6)
├── ai/
│   └── llm_analyzer.py                     # AI threat synthesis & compensating controls
├── data/
│   └── sample_telemetry/                   # Realistic industrial DC telemetry
├── reports/                                # Generated audit reports
├── ui/
│   └── index.html                          # Executive dashboard & topology map
└── main.py                                 # Orchestration CLI
```
