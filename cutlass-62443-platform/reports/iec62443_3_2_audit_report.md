# ⚔️ CUTLASS: Cyber Unified Threat Level Automated Site Survey
### ISA/IEC 62443-3-2 & 62443-3-3 Detailed Cyber-Physical Risk Assessment
**Facility / System Under Consideration (SuC):** Global Logistics DC #104 (Ambient & Cold Chain Operations)
**Facility ID:** SUC-DC-104 | **Facility Type:** Distribution Center
**Assessment Date:** 2026-10-11 20:02:18 UTC
**Target Security Level (Global):** SL-T 2
**Facility SL-2 Compliance (verified zones):** 16.7%
**SL-2 Evidence Coverage:** 50.9% of SRs have telemetry or survey evidence
**Tolerable Risk (5x5 matrix):** Moderate | **Site Survey:** C:\Users\mthom\.gemini\antigravity\scratch\MT-Lab\cutlass-62443-platform\data\sites\DC-104\survey.yaml
**Overall Inherent Risk Score:** 10.42 / 25

---

## 1. Executive Briefing
### Executive Summary: IEC 62443-3-2 Cyber Risk Assessment
**System Under Consideration:** Global Logistics DC #104 (Ambient & Cold Chain Operations) (Global Logistics Operations - DC-104)
**Assessment Standard:** ISA/IEC 62443-3-2 & IEC 62443-3-3 | **Target Security Level:** SL-T 2 (Across all OT Zones)

#### 1. Security Posture & Compliance Status
- **Facility SL-2 Compliance:** **16.7%** of operational zones currently meet SL-T 2.
- **Overall Unmitigated Risk Score:** **10.42 / 25**.
- **Critical Cyber-Physical Scenarios Identified:** **5**.
- **Non-Compliant Zones:** Ammonia Refrig, Supervisory Hmi, Sortation Conveyor, Asrs Pallet, Site Operations.

#### 2. Key Findings & Operational Exposure
1. **Direct DMZ Bypass into Ammonia Refrigeration (Safety Loop Threat):** Armis telemetry detected an uninspected direct conduit from Enterprise IT into the Ammonia Refrigeration PLC (Johnson Controls Frick Quantum HD). Combined with CVE-2021-32955 (Authentication Bypass), an attacker could alter setpoints or trigger an ammonia safety hazard without crossing the L3.5 DMZ.
2. **Sortation Core Controller Exposure:** The Dematic S7-1517F sortation controller is exposed to CVE-2023-3595 (S7comm-plus RCE). A disruption to this controller stops outbound trailer dispatch.
3. **Engineering Workstation Hardening Deficiencies:** L2 supervisory workstations still run unencrypted SMBv1 and permit uninspected RDP, violating FR 1.1 and FR 4.1.

#### 3. Strategic Remediation Roadmap
- **Immediate Action (48 Hours):** Sever the unauthorized enterprise conduit CND-06 to the Ammonia PLC; force all diagnostics through the L3.5 CyberArk jumpbox.
- **Compensating Controls (7 Days):** Implement Deep Packet Inspection (DPI) on the sortation firewall to block malformed S7comm-plus packets.
- **Planned Maintenance (Next Scheduled Downtime Window):** Apply tested firmware patches to Rockwell GuardLogix and Siemens controllers.

---

## 2. System Partitioning: Zones & Conduits (Clause Z1 & Z3)
| Zone ID | Zone Name | Purdue Level | Target SL | Achieved SL (SL-A) | SL Gap | Assets Count | Criticality |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `ZONE-AMMONIA-REFRIG` | Ammonia Refrig | L1_BasicControl | SL-2 | **SL-0 (+3 FR unverified)** | ⚠️ Gap: 2.0 | 2 | 5/5 |
| `ZONE-SUPERVISORY-HMI` | Supervisory Hmi | L2_SupervisoryControl | SL-2 | **SL-1 (+2 FR unverified)** | ⚠️ Gap: 1.0 | 2 | 3/5 |
| `ZONE-SORTATION-CONVEYOR` | Sortation Conveyor | L1_BasicControl | SL-2 | **SL-1 (+3 FR unverified)** | ⚠️ Gap: 1.0 | 1 | 4/5 |
| `ZONE-ASRS-PALLET` | Asrs Pallet | L1_BasicControl | SL-2 | **SL-1 (+6 FR unverified)** | ⚠️ Gap: 1.0 | 1 | 4/5 |
| `ZONE-SITE-OPERATIONS` | Site Operations | L3_SiteOperations | SL-2 | **SL-1 (+5 FR unverified)** | ⚠️ Gap: 1.0 | 1 | 3/5 |
| `ZONE-OT-DMZ` | Ot Dmz | L3_5_OT_DMZ | SL-2 | **SL-2** | ✅ Compliant | 1 | 3/5 |

### Network Conduits Inventory
| Conduit ID | Path | Encrypted | L3.5 DMZ Traversal | Firewall Inspection | Policy Status |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `CND-01-ENT-TO-DMZ` | `ZONE-ENTERPRISE-L4` ➔ `ZONE-OT-DMZ` | Yes | Yes | Yes | ✅ Compliant |
| `CND-02-DMZ-TO-SITEOPS` | `ZONE-OT-DMZ` ➔ `ZONE-SITE-OPERATIONS` | Yes | Yes | Yes | ✅ Compliant |
| `CND-03-SITEOPS-TO-SUPERVISORY` | `ZONE-SITE-OPERATIONS` ➔ `ZONE-SUPERVISORY-HMI` | Yes | No | Yes | ✅ Compliant |
| `CND-04-SUPERVISORY-TO-AMMONIA` | `ZONE-SUPERVISORY-HMI` ➔ `ZONE-AMMONIA-REFRIG` | No | No | No | 🚨 VIOLATION |
| `CND-05-SUPERVISORY-TO-SORTATION` | `ZONE-SUPERVISORY-HMI` ➔ `ZONE-SORTATION-CONVEYOR` | No | No | Yes | ✅ Compliant |
| `CND-06-ROGUE-IT-TO-AMMONIA` | `ZONE-ENTERPRISE-L4` ➔ `ZONE-AMMONIA-REFRIG` | No | No | No | 🚨 VIOLATION |

---

## 3. Security Level Vector Breakdown (Clause Z5 / IEC 62443-3-3)
SL-T 2 is the enterprise floor for every FR. SL-A is established from evidence only: `2` = all SL-2 SRs met, `1`/`0` = gap evidenced, `≤1?` = **unverified** (at least one SR has no evidence). `ᶜ` = capped by component SL-C.

| Zone Name | FR 1 (IAC) | FR 2 (UC) | FR 3 (SI) | FR 4 (DC) | FR 5 (RDF) | FR 6 (TRE) | FR 7 (RA) | SL-A Min | Evidence | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Ammonia Refrig | 1 | ≤1? | ≤1? | 0ᶜ | 0 | 1 | ≤1? | **SL-0 (+3 FR unverified)** | 42.1% | ❌ DEFICIENT |
| Supervisory Hmi | 1 | 1 | ≤1? | 1 | 2 | 1 | ≤1? | **SL-1 (+2 FR unverified)** | 52.6% | ❌ DEFICIENT |
| Sortation Conveyor | 1 | ≤1? | ≤1? | 1 | 2 | 1 | ≤1? | **SL-1 (+3 FR unverified)** | 52.6% | ❌ DEFICIENT |
| Asrs Pallet | ≤1? | ≤1? | ≤1? | ≤1? | ≤1? | 1 | ≤1? | **SL-1 (+6 FR unverified)** | 21.1% | ❌ DEFICIENT |
| Site Operations | ≤1? | ≤1? | ≤1? | ≤1? | 2 | 1 | ≤1? | **SL-1 (+5 FR unverified)** | 36.8% | ❌ DEFICIENT |
| Ot Dmz | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **SL-2** | 100.0% | ✅ PASS |

### SR Evidence Detail

**Ammonia Refrig** (`ZONE-AMMONIA-REFRIG`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.2 Software Process and Device Identification | 🟡 partial | observed | CND-04-SUPERVISORY-TO-AMMONIA: unauthenticated industrial protocol(s) EtherNet/IP, Modbus-TCP cross boundary; CND-06-ROGUE-IT-TO-AMMONIA: unauthenticated industrial protocol(s) Modbus-TCP cross boundary |
| SR 1.3 Account Management & Password Strength | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.7 Strength of Password Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.1 Authorization Enforcement (RBAC) | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.2 Wireless Use Control | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.3 Portable Media & Mobile Code | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.1 Communication Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.2 Malicious Code Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.4 Software and Information Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.1 Information Confidentiality in Transit | 🚨 observed_violation | observed | CND-04-SUPERVISORY-TO-AMMONIA: cleartext management (HTTP) crosses zone boundary; CND-06-ROGUE-IT-TO-AMMONIA: cleartext management (HTTP) crosses zone boundary |
| SR 4.3 Use of Cryptography | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.1 Network Segmentation (Zones & Conduits) | 🚨 observed_violation | observed | CND-06-ROGUE-IT-TO-AMMONIA: direct path from ZONE-ENTERPRISE-L4 into field zone without DMZ |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | 🚨 observed_violation | observed | Uninspected inbound conduit(s): CND-04-SUPERVISORY-TO-AMMONIA, CND-06-ROGUE-IT-TO-AMMONIA |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | 🟡 partial | attested | Windows hosts forward logs to SIEM; PLC program-change logging not enabled _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 2 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

**Supervisory Hmi** (`ZONE-SUPERVISORY-HMI`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | 🟡 partial | attested | HMI uses shared operator account on night shift _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 1.2 Software Process and Device Identification | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.3 Account Management & Password Strength | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.7 Strength of Password Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.1 Authorization Enforcement (RBAC) | 🟡 partial | attested | RBAC on HMI; none on EWS _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 2.2 Wireless Use Control | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.3 Portable Media & Mobile Code | ❌ not_met | attested | USB ports open on EWS _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 3.1 Communication Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.2 Malicious Code Protection | ❔ no_evidence | none | Attestation expired 2025-06-01 - re-survey required |
| SR 3.4 Software and Information Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.1 Information Confidentiality in Transit | 🟡 partial | observed | DC104-REFRIG-HMI-01 exposes cleartext mgmt (HTTP, SMB); DC104-ENG-WORKSTATION-EWS-01 exposes cleartext mgmt (SMBv1) |
| SR 4.3 Use of Cryptography | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.1 Network Segmentation (Zones & Conduits) | ✅ met | observed | Observed conduits respect Purdue boundaries |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | ✅ met | observed | All inbound conduits pass stateful inspection |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | 🟡 partial | attested | Windows hosts forward logs to SIEM; PLC program-change logging not enabled _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 2 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

**Sortation Conveyor** (`ZONE-SORTATION-CONVEYOR`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | ✅ met | attested | Controller access via EWS only; named accounts in TIA _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 1.2 Software Process and Device Identification | 🟡 partial | observed | CND-05-SUPERVISORY-TO-SORTATION: unauthenticated industrial protocol(s) PROFINET cross boundary |
| SR 1.3 Account Management & Password Strength | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.7 Strength of Password Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.1 Authorization Enforcement (RBAC) | ✅ met | attested | S7 protection level 3 (full access protection) _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 2.2 Wireless Use Control | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.3 Portable Media & Mobile Code | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.1 Communication Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.2 Malicious Code Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.4 Software and Information Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.1 Information Confidentiality in Transit | 🟡 partial | observed | DC104-MAIN-CROSSBELT-SORTER-PLC exposes cleartext mgmt (HTTP, SNMPv2c) |
| SR 4.3 Use of Cryptography | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.1 Network Segmentation (Zones & Conduits) | ✅ met | observed | Observed conduits respect Purdue boundaries |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | ✅ met | observed | All inbound conduits pass stateful inspection |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | 🟡 partial | attested | Windows hosts forward logs to SIEM; PLC program-change logging not enabled _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 1 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

**Asrs Pallet** (`ZONE-ASRS-PALLET`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.2 Software Process and Device Identification | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.3 Account Management & Password Strength | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.7 Strength of Password Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.1 Authorization Enforcement (RBAC) | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.2 Wireless Use Control | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.3 Portable Media & Mobile Code | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.1 Communication Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.2 Malicious Code Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.4 Software and Information Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.1 Information Confidentiality in Transit | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.3 Use of Cryptography | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.1 Network Segmentation (Zones & Conduits) | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | 🟡 partial | attested | Windows hosts forward logs to SIEM; PLC program-change logging not enabled _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 1 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

**Site Operations** (`ZONE-SITE-OPERATIONS`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.2 Software Process and Device Identification | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.3 Account Management & Password Strength | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 1.7 Strength of Password Authentication | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.1 Authorization Enforcement (RBAC) | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.2 Wireless Use Control | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 2.3 Portable Media & Mobile Code | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.1 Communication Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.2 Malicious Code Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 3.4 Software and Information Integrity | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 4.1 Information Confidentiality in Transit | ✅ met | observed | All inbound conduits encrypted; no cleartext management observed |
| SR 4.3 Use of Cryptography | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 5.1 Network Segmentation (Zones & Conduits) | ✅ met | observed | Observed conduits respect Purdue boundaries |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | ✅ met | observed | All inbound conduits pass stateful inspection |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | 🟡 partial | attested | Windows hosts forward logs to SIEM; PLC program-change logging not enabled _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 1 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ❔ no_evidence | none | No telemetry or survey evidence |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

**Ot Dmz** (`ZONE-OT-DMZ`)

| SR | Status | Source | Evidence |
| :--- | :--- | :--- | :--- |
| SR 1.1 Human User Identification and Authentication | ✅ met | attested | Jump host: named AD accounts + MFA _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 1.2 Software Process and Device Identification | ✅ met | attested | Device certs on jump host / brokers _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 1.3 Account Management & Password Strength | ✅ met | attested | Central AD account mgmt _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 1.7 Strength of Password Authentication | ✅ met | attested | AD password policy _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 2.1 Authorization Enforcement (RBAC) | ✅ met | attested | RBAC groups for vendor vs internal _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 2.2 Wireless Use Control | ✅ met | attested | No wireless in DMZ _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 2.3 Portable Media & Mobile Code | ✅ met | attested | USB blocked by GPO _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 3.1 Communication Integrity | ✅ met | attested | TLS on all DMZ sessions _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 3.2 Malicious Code Protection | ✅ met | attested | EDR deployed _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 3.4 Software and Information Integrity | ✅ met | attested | Signed software only _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 4.1 Information Confidentiality in Transit | ✅ met | observed | All inbound conduits encrypted; no cleartext management observed |
| SR 4.3 Use of Cryptography | ✅ met | attested | FIPS-validated TLS _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 5.1 Network Segmentation (Zones & Conduits) | ✅ met | observed | Observed conduits respect Purdue boundaries |
| SR 5.2 Zone Boundary Protection (Firewalls & DMZ) | ✅ met | observed | All inbound conduits pass stateful inspection |
| SR 5.3 General Purpose Person-to-Person Communication | ✅ met | attested | Web/email proxy blocks for OT VLANs verified _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.1 Audit Log Generation | ✅ met | attested | Session recording + SIEM _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 6.2 Continuous Monitoring & Anomaly Detection | ✅ met | observed | Armis passively monitors 1 asset(s) in zone |
| SR 7.1 Denial of Service Protection | ✅ met | attested | Firewall DoS protections _(attested 2026-09-10, expires 2027-09-10)_ |
| SR 7.3 Control System Backup and Recovery | ✅ met | attested | Weekly PLC/HMI project backups to offline vault; restore tested 2026-08 _(attested 2026-09-10, expires 2027-09-10)_ |

### Site-Survey Worklist (SRs with no evidence)
- **Ammonia Refrig:** SR 1.1 Human User Identification and Authentication; SR 1.3 Account Management & Password Strength; SR 1.7 Strength of Password Authentication; SR 2.1 Authorization Enforcement (RBAC); SR 2.2 Wireless Use Control; SR 2.3 Portable Media & Mobile Code; SR 3.1 Communication Integrity; SR 3.2 Malicious Code Protection; SR 3.4 Software and Information Integrity; SR 4.3 Use of Cryptography; SR 7.1 Denial of Service Protection
- **Supervisory Hmi:** SR 1.2 Software Process and Device Identification; SR 1.3 Account Management & Password Strength; SR 1.7 Strength of Password Authentication; SR 2.2 Wireless Use Control; SR 3.1 Communication Integrity; SR 3.2 Malicious Code Protection; SR 3.4 Software and Information Integrity; SR 4.3 Use of Cryptography; SR 7.1 Denial of Service Protection
- **Sortation Conveyor:** SR 1.3 Account Management & Password Strength; SR 1.7 Strength of Password Authentication; SR 2.2 Wireless Use Control; SR 2.3 Portable Media & Mobile Code; SR 3.1 Communication Integrity; SR 3.2 Malicious Code Protection; SR 3.4 Software and Information Integrity; SR 4.3 Use of Cryptography; SR 7.1 Denial of Service Protection
- **Asrs Pallet:** SR 1.1 Human User Identification and Authentication; SR 1.2 Software Process and Device Identification; SR 1.3 Account Management & Password Strength; SR 1.7 Strength of Password Authentication; SR 2.1 Authorization Enforcement (RBAC); SR 2.2 Wireless Use Control; SR 2.3 Portable Media & Mobile Code; SR 3.1 Communication Integrity; SR 3.2 Malicious Code Protection; SR 3.4 Software and Information Integrity; SR 4.1 Information Confidentiality in Transit; SR 4.3 Use of Cryptography; SR 5.1 Network Segmentation (Zones & Conduits); SR 5.2 Zone Boundary Protection (Firewalls & DMZ); SR 7.1 Denial of Service Protection
- **Site Operations:** SR 1.1 Human User Identification and Authentication; SR 1.2 Software Process and Device Identification; SR 1.3 Account Management & Password Strength; SR 1.7 Strength of Password Authentication; SR 2.1 Authorization Enforcement (RBAC); SR 2.2 Wireless Use Control; SR 2.3 Portable Media & Mobile Code; SR 3.1 Communication Integrity; SR 3.2 Malicious Code Protection; SR 3.4 Software and Information Integrity; SR 4.3 Use of Cryptography; SR 7.1 Denial of Service Protection

---

## 4. Threat Scenarios & Detailed Risk Assessment (Clause Z5)
### Zone: Ammonia Refrig (`ZONE-AMMONIA-REFRIG`)
#### 🔴 Scenario: Exploit of CVE-2021-32955 on DC104-AMMONIA-COMP-PLC-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-01`)
- **Vulnerability Reference:** `CVE-2021-32955`
- **Threat Vector:** Remote exploit via Modbus-TCP, EtherNet/IP, HTTP targeting Johnson Controls Frick Quantum HD Web Server Authentication Bypass
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC104-AMMONIA-COMP-PLC-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Attack Vectors:** remote_access, network_exploit, logic_download
- **Unmitigated Risk:** L5 × C5 ➔ **Critical**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L5 × C5 ➔ **Critical** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DMZ-ENFORCE`: Sever direct/uninspected conduits; force all inter-zone traffic through L3.5 DMZ stateful firewall _(−2 on remote_access)_
  - `CC-JUMPHOST-MFA`: Vendor/remote engineering access only via MFA-enforced, session-recorded L3.5 jump host _(−1 on remote_access, credential_abuse)_
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-ASSET-ALLOWLIST-ACL`: Controller-level ACL / micro-segmentation: only authorized HMI and EWS addresses may reach the controller _(−1 on network_exploit, logic_download)_
- **Projected Residual (if recommended controls implemented):** L2 × C5 ➔ **High** (**still NOT tolerable → ZCR 7 risk acceptance required**)

#### 🔴 Scenario: Exploit of CVE-2020-5504 on DC104-AMMONIA-COMP-PLC-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-02`)
- **Vulnerability Reference:** `CVE-2020-5504`
- **Threat Vector:** Remote exploit via Modbus-TCP, EtherNet/IP, HTTP targeting Modbus-TCP Stack Denial of Service and State Injection in Embedded Controller
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC104-AMMONIA-COMP-PLC-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Attack Vectors:** remote_access, network_exploit, logic_download
- **Unmitigated Risk:** L4 × C5 ➔ **Critical**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L4 × C5 ➔ **Critical** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DMZ-ENFORCE`: Sever direct/uninspected conduits; force all inter-zone traffic through L3.5 DMZ stateful firewall _(−2 on remote_access)_
  - `CC-JUMPHOST-MFA`: Vendor/remote engineering access only via MFA-enforced, session-recorded L3.5 jump host _(−1 on remote_access, credential_abuse)_
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-ASSET-ALLOWLIST-ACL`: Controller-level ACL / micro-segmentation: only authorized HMI and EWS addresses may reach the controller _(−1 on network_exploit, logic_download)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L1 × C5 ➔ **Moderate** (tolerable)

#### 🔴 Scenario: Exploit of CVE-2022-3153 on DC104-AMMONIA-SIS-PANEL-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-03`)
- **Vulnerability Reference:** `CVE-2022-3153`
- **Threat Vector:** Remote exploit via CIP-Safety, EtherNet/IP targeting Rockwell Automation GuardLogix/ControlLogix CIP Explicit Message Buffer Overflow
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC104-AMMONIA-SIS-PANEL-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Attack Vectors:** remote_access, network_exploit, logic_download
- **Unmitigated Risk:** L5 × C5 ➔ **Critical**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L5 × C5 ➔ **Critical** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DMZ-ENFORCE`: Sever direct/uninspected conduits; force all inter-zone traffic through L3.5 DMZ stateful firewall _(−2 on remote_access)_
  - `CC-JUMPHOST-MFA`: Vendor/remote engineering access only via MFA-enforced, session-recorded L3.5 jump host _(−1 on remote_access, credential_abuse)_
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-ASSET-ALLOWLIST-ACL`: Controller-level ACL / micro-segmentation: only authorized HMI and EWS addresses may reach the controller _(−1 on network_exploit, logic_download)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L2 × C5 ➔ **High** (**still NOT tolerable → ZCR 7 risk acceptance required**)

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC104-AMMONIA-SIS-PANEL-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-04`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via CIP-Safety, EtherNet/IP targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC104-AMMONIA-SIS-PANEL-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Attack Vectors:** remote_access, local_access, logic_download
- **Unmitigated Risk:** L4 × C5 ➔ **Critical**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L4 × C5 ➔ **Critical** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DMZ-ENFORCE`: Sever direct/uninspected conduits; force all inter-zone traffic through L3.5 DMZ stateful firewall _(−2 on remote_access)_
  - `CC-JUMPHOST-MFA`: Vendor/remote engineering access only via MFA-enforced, session-recorded L3.5 jump host _(−1 on remote_access, credential_abuse)_
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-ASSET-ALLOWLIST-ACL`: Controller-level ACL / micro-segmentation: only authorized HMI and EWS addresses may reach the controller _(−1 on network_exploit, logic_download)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L1 × C5 ➔ **Moderate** (tolerable)

### Zone: Supervisory Hmi (`ZONE-SUPERVISORY-HMI`)
#### 🔴 Scenario: Exploit of CVE-2022-3153 on DC104-REFRIG-HMI-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-01`)
- **Vulnerability Reference:** `CVE-2022-3153`
- **Threat Vector:** Remote exploit via RDP, SMB, EtherNet/IP, HTTP targeting Rockwell Automation GuardLogix/ControlLogix CIP Explicit Message Buffer Overflow
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC104-REFRIG-HMI-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Attack Vectors:** ot_internal, network_exploit, credential_abuse
- **Unmitigated Risk:** L4 × C3 ➔ **High**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L4 × C3 ➔ **High** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-WINDOWS-HARDEN`: Harden HMI/EWS: disable SMBv1 and cleartext HTTP, application allow-listing, local admin removal _(−1 on credential_abuse, network_exploit, local_access)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L3 × C3 ➔ **Moderate** (tolerable)

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC104-REFRIG-HMI-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-02`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via RDP, SMB, EtherNet/IP, HTTP targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC104-REFRIG-HMI-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Attack Vectors:** ot_internal, local_access, credential_abuse
- **Unmitigated Risk:** L2 × C3 ➔ **Moderate**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L2 × C3 ➔ **Moderate** (tolerable)
- **Recommended Controls:**
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-WINDOWS-HARDEN`: Harden HMI/EWS: disable SMBv1 and cleartext HTTP, application allow-listing, local admin removal _(−1 on credential_abuse, network_exploit, local_access)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L1 × C3 ➔ **Low** (tolerable)

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC104-ENG-WORKSTATION-EWS-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-03`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via RDP, CIP, S7comm, SMBv1 targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC104-ENG-WORKSTATION-EWS-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Attack Vectors:** ot_internal, local_access, credential_abuse
- **Unmitigated Risk:** L2 × C3 ➔ **Moderate**
- **Implemented Controls (verified, credited):** none
- **Current Residual Risk:** L2 × C3 ➔ **Moderate** (tolerable)
- **Recommended Controls:**
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-WINDOWS-HARDEN`: Harden HMI/EWS: disable SMBv1 and cleartext HTTP, application allow-listing, local admin removal _(−1 on credential_abuse, network_exploit, local_access)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L1 × C3 ➔ **Low** (tolerable)

### Zone: Sortation Conveyor (`ZONE-SORTATION-CONVEYOR`)
#### 🔴 Scenario: Exploit of CVE-2023-3595 on DC104-MAIN-CROSSBELT-SORTER-PLC via Conduit (`TS-ZONE-SORTATION-CONVEYOR-01`)
- **Vulnerability Reference:** `CVE-2023-3595`
- **Threat Vector:** Remote exploit via PROFINET, S7comm-Plus, SNMPv2c, HTTP targeting Siemens SIMATIC S7-1500 Remote Code Execution via S7comm-Plus Memory Corruption
- **Operational & Safety Consequence:** Critical logistics disruption: Compromise of DC104-MAIN-CROSSBELT-SORTER-PLC halts core DC sortation / ASRS cranes, causing multi-hour trailer backlog, regional store replenishment delays, and >$1M operational loss.
- **Attack Vectors:** ot_internal, network_exploit, logic_download
- **Unmitigated Risk:** L5 × C4 ➔ **Critical**
- **Implemented Controls (verified, credited):** `CC-ASSET-ALLOWLIST-ACL` (−1 on network_exploit, logic_download)
- **Current Residual Risk:** L4 × C4 ➔ **High** (**NOT tolerable**)
- **Recommended Controls:**
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L3 × C4 ➔ **High** (**still NOT tolerable → ZCR 7 risk acceptance required**)

### Zone: Asrs Pallet (`ZONE-ASRS-PALLET`)
#### 🔴 Scenario: Exploit of CVE-2020-5504 on DC104-ASRS-CRANE-CONTROLLER-01 via Conduit (`TS-ZONE-ASRS-PALLET-01`)
- **Vulnerability Reference:** `CVE-2020-5504`
- **Threat Vector:** Remote exploit via ADS, EtherCAT, Modbus-TCP targeting Modbus-TCP Stack Denial of Service and State Injection in Embedded Controller
- **Operational & Safety Consequence:** Critical logistics disruption: Compromise of DC104-ASRS-CRANE-CONTROLLER-01 halts core DC sortation / ASRS cranes, causing multi-hour trailer backlog, regional store replenishment delays, and >$1M operational loss.
- **Attack Vectors:** ot_internal, network_exploit, logic_download
- **Unmitigated Risk:** L2 × C4 ➔ **Moderate**
- **Implemented Controls (verified, credited):** `CC-ASSET-ALLOWLIST-ACL` (−1 on network_exploit, logic_download)
- **Current Residual Risk:** L1 × C4 ➔ **Moderate** (tolerable)
- **Recommended Controls:**
  - `CC-DPI-WRITE-BLOCK`: Industrial DPI: block program download / write function codes (Modbus 05/06/15/16, CIP 0x4D/0x4E, S7 download) except from allow-listed EWS _(−1 on logic_download)_
  - `CC-PATCH-MAINT-WINDOW`: Apply vendor-validated firmware/patch in next planned maintenance window _(−2 on network_exploit, local_access)_
- **Projected Residual (if recommended controls implemented):** L1 × C4 ➔ **Moderate** (tolerable)


---

## 5. Multi-Hop Attack Graphs & Cyber-Physical Blast Radius Analysis
**Total Facility Financial Loss Exposure:** **$5,763,000.00 USD**

| Attack Path ID | Path Name | Target Zone / Asset | Primary Failure Mode | Downtime (hrs) | Financial Loss ($) | Stores Impacted |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `PATH-AMMONIA-CATASTROPHIC-01` | Enterprise DMZ Bypass to Ammonia Safety Release (Catastrophic Path) | `DC104-AMMONIA-COMP-PLC-01` | Emergency Pressure Relief & System Lockdown; ... | 18.0h | **$4,410,000** | 142 stores |
| `PATH-SORTATION-DISPATCH-02` | Supervisory EWS Pivot to Crossbelt Sorter S7comm-Plus RCE | `DC104-MAIN-CROSSBELT-SORTER-PLC` | S7 PLC Hard Fault; 400 Diverter Trays Locked ... | 8.5h | **$1,098,000** | 96 stores |
| `PATH-ASRS-CRANE-03` | Modbus DoS Injection against High-Bay ASRS Crane System | `DC104-ASRS-CRANE-CONTROLLER-01` | EtherCAT Bus Desynchronization; Automated Cra... | 4.0h | **$255,000** | 65 stores |

### ⚔️ Path Details: Enterprise DMZ Bypass to Ammonia Safety Release (Catastrophic Path) (`PATH-AMMONIA-CATASTROPHIC-01`)
- **Adversary Profile:** Opportunistic Cybercriminal or Ransomware Actor (IEC 62443 SL-2 Profile)
- **Initial Access Entry Point:** Enterprise Corporate Subnet (L4) ➔ **Target Asset:** `DC104-AMMONIA-COMP-PLC-01` (ZONE-AMMONIA-REFRIG)
- **Safety Hazard Level:** Catastrophic Chemical Release (OSHA PSM / EPA RMP Mandated Evacuation)
- **Environmental Impact:** High potential anhydrous ammonia vapor plume hazard; HazMat team deployment
- **Financial Downtime Burn:** $145,000/hour | **Total Estimated Loss:** $4,410,000
- **Affected Downstream Stores:** 142 Stores Delayed

**Attack Hop Sequence & Barrier Breaches:**
  1. **[Initial Access]** `Enterprise IT LAN (L4)` ➔ `Rogue Diagnostics Conduit (CND-06)`
     - *Vector:* Adversary on corporate network discovers unmonitored vendor diagnostics routing
     - *Violated SL-2 Barrier:* FR 5.1 & ENT-OT-POL-01 (Strict Purdue L3.5 DMZ Enforcement)
  2. **[Direct Boundary Penetration]** `Rogue Diagnostics Conduit (CND-06)` ➔ `DC104-AMMONIA-COMP-PLC-01 (10.142.12.10)`
     - *Vector:* Unfiltered routing directly enters Level 1 Ammonia Control VLAN without firewall inspection
     - *Violated SL-2 Barrier:* FR 5.2 (Stateful Zone Boundary Filtering)
  3. **[Control Hijack]** `DC104-AMMONIA-COMP-PLC-01` ➔ `Frick Quantum HD Web Server & Modbus Engine`
     - *Vector:* Exploits CVE-2021-32955 (Authentication Bypass) over unencrypted HTTP/Modbus-TCP (`CVE-2021-32955`)
     - *Violated SL-2 Barrier:* FR 1.1 (Human Identification) & FR 4.1 (Encrypted Transport)
  4. **[Physical Process Sabotage]** `Frick Quantum HD Controller` ➔ `Ammonia Compressor Discharge Valves & High-Stage Suction`
     - *Vector:* Overwrites high-pressure setpoints; commands compressor into unrecoverable emergency overpressure surge
     - *Violated SL-2 Barrier:* FR 3.1 (Communication Integrity & Logic Validation)

**Cascading Supply Chain & Operational Gridlock:**
  - **Upstream:** Inbound refrigerated tractor-trailers turned away / re-routed to neighboring regional DCs; Cold dock receiving doors 1-28 shuttered
  - **Downstream:** 142 regional fulfillment facilities experience milk, produce, and fresh meat stockouts within 24 hours; OSHA and EPA formal regulatory investigation and consent decree review

### ⚔️ Path Details: Supervisory EWS Pivot to Crossbelt Sorter S7comm-Plus RCE (`PATH-SORTATION-DISPATCH-02`)
- **Adversary Profile:** Targeted Cybercriminal / Ransomware Operator with OT Tooling
- **Initial Access Entry Point:** Level 2 Supervisory HMI VLAN (VLAN-22) ➔ **Target Asset:** `DC104-MAIN-CROSSBELT-SORTER-PLC` (ZONE-SORTATION-CONVEYOR)
- **Safety Hazard Level:** Recordable Floor Hazard (High-speed package jams, belt slippage)
- **Environmental Impact:** Minimal (Localized conveyor motor overheating)
- **Financial Downtime Burn:** $88,000/hour | **Total Estimated Loss:** $1,098,000
- **Affected Downstream Stores:** 96 Stores Delayed

**Attack Hop Sequence & Barrier Breaches:**
  1. **[Privilege Escalation]** `Compromised Supervisory Workstation (DC104-ENG-WORKSTATION-EWS-01)` ➔ `Local Windows SAM / LSASS Memory`
     - *Vector:* Exploits CVE-2021-34444 (Windows RDP Privilege Escalation) via legacy SMBv1 (`CVE-2021-34444`)
     - *Violated SL-2 Barrier:* FR 1.3 (Account Management) & FR 3.2 (Malware/EDR Protection)
  2. **[Lateral Movement]** `DC104-ENG-WORKSTATION-EWS-01` ➔ `Supervisory-to-Sortation Conduit (CND-05)`
     - *Vector:* Initiates crafted S7comm-plus packets across conduit directly targeting TCP port 102
     - *Violated SL-2 Barrier:* FR 5.2 (Stateful Conduit Deep Packet Inspection)
  3. **[Remote Code Execution]** `CND-05 Conduit` ➔ `DC104-MAIN-CROSSBELT-SORTER-PLC (10.142.14.20)`
     - *Vector:* Exploits CISA KEV CVE-2023-3595 (S7comm-plus Memory Corruption) to crash CPU execution (`CVE-2023-3595`)
     - *Violated SL-2 Barrier:* FR 3.4 (Firmware & Memory Integrity)
  4. **[Physical Mechanical Halt]** `SIMATIC S7-1517F Controller` ➔ `Main Crossbelt Sortation Induction Motors & Diverter Vanes`
     - *Vector:* CPU enters permanent DEFECT stop state; conveyor belts freeze under full load
     - *Violated SL-2 Barrier:* FR 7.1 (Denial of Service Protection & Recovery)

**Cascading Supply Chain & Operational Gridlock:**
  - **Upstream:** Automated Storage & Retrieval System (ASRS) halts buffering; warehouse aisles gridlocked; Internal cross-dock conveyor queues back up across 3 miles of track
  - **Downstream:** Trailer dispatch window missed for 48 outbound trailers; Demurrage and carrier retention penalties accrued across 18 regional trucking fleets; 96 Retail stores miss morning replenishment cutoff

### ⚔️ Path Details: Modbus DoS Injection against High-Bay ASRS Crane System (`PATH-ASRS-CRANE-03`)
- **Adversary Profile:** Generic Script / Low Motivation Attacker (SL-2 Profile)
- **Initial Access Entry Point:** Supervisory HMI Network (L2) ➔ **Target Asset:** `DC104-ASRS-CRANE-CONTROLLER-01` (ZONE-ASRS-PALLET)
- **Safety Hazard Level:** None (Safety laser curtains active)
- **Environmental Impact:** None
- **Financial Downtime Burn:** $45,000/hour | **Total Estimated Loss:** $255,000
- **Affected Downstream Stores:** 65 Stores Delayed

**Attack Hop Sequence & Barrier Breaches:**
  1. **[Protocol Abuse]** `Supervisory HMI Network (L2)` ➔ `Beckhoff CX5140 Embedded PC (DC104-ASRS-CRANE-CONTROLLER-01)`
     - *Vector:* Transmits malformed Modbus function code sequences over TCP port 502 (`CVE-2020-5504`)
     - *Violated SL-2 Barrier:* FR 7.1 (DoS Protection & Protocol Validation)
  2. **[Physical Crane Stoppage]** `Beckhoff CX5140 Embedded PC` ➔ `ASRS High-Bay Storage Cranes 1-8`
     - *Vector:* Communication stack watchdog drops EtherCAT synchronization; cranes brake in mid-aisle
     - *Violated SL-2 Barrier:* FR 7.3 (Control System Resiliency)

**Cascading Supply Chain & Operational Gridlock:**
  - **Upstream:** Pallet induction starved across all 8 high-bay aisles
  - **Downstream:** Replenishment pallet drops delayed by 4 hours

---

## 6. Cybersecurity Requirements Specification (CRS) (Clause Z6)
| Req ID | Priority | Target Zone | Standard Requirement | Actionable Engineering Specification | Responsible Team |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CRS-SUC-DC-104-001` | **P0 - Immediate / Safety Block** | Ammonia Refrig | FR 5: Restricted Data Flow | Audit and sever all direct conduits bypassing the L3.5 DMZ into Ammonia Refrig. Re-route traffic through stateful industrial firewalls with protocol-specific allow-lists. | Enterprise OT Network Engineering & Facility Maintenance |
| `CRS-SUC-DC-104-002` | **P2 - High** | Ammonia Refrig | FR 1: Identification & FR 4: Confidentiality | Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in Ammonia Refrig. Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory). | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-003` | **P2 - High** | Ammonia Refrig | FR6: SR 6.1 Audit Log Generation | Close SR 6.1 gap to SL-2 (partial): Windows hosts forward logs to SIEM; PLC program-change logging not enabled | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-004` | **P2 - High** | Supervisory Hmi | FR 1: Identification & FR 4: Confidentiality | Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in Supervisory Hmi. Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory). | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-005` | **P2 - High** | Supervisory Hmi | FR2: SR 2.1 Authorization Enforcement (RBAC) | Close SR 2.1 gap to SL-2 (partial): RBAC on HMI; none on EWS | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-006` | **P2 - High** | Supervisory Hmi | FR2: SR 2.3 Portable Media & Mobile Code | Close SR 2.3 gap to SL-2 (not met): USB ports open on EWS | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-007` | **P2 - High** | Supervisory Hmi | FR6: SR 6.1 Audit Log Generation | Close SR 6.1 gap to SL-2 (partial): Windows hosts forward logs to SIEM; PLC program-change logging not enabled | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-008` | **P2 - High** | Sortation Conveyor | FR 1: Identification & FR 4: Confidentiality | Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in Sortation Conveyor. Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory). | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-009` | **P2 - High** | Sortation Conveyor | FR6: SR 6.1 Audit Log Generation | Close SR 6.1 gap to SL-2 (partial): Windows hosts forward logs to SIEM; PLC program-change logging not enabled | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-010` | **P2 - High** | Asrs Pallet | FR6: SR 6.1 Audit Log Generation | Close SR 6.1 gap to SL-2 (partial): Windows hosts forward logs to SIEM; PLC program-change logging not enabled | Enterprise OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-104-011` | **P2 - High** | Site Operations | FR6: SR 6.1 Audit Log Generation | Close SR 6.1 gap to SL-2 (partial): Windows hosts forward logs to SIEM; PLC program-change logging not enabled | Enterprise OT Systems Administration & Cybersecurity Operations |