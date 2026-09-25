# ISA/IEC 62443-3-2 Security Risk Assessment Report
**Facility / System Under Consideration (SuC):** Walmart DC #6094 (Ambient & Cold Chain Operations)
**Facility ID:** SUC-DC-6094 | **Facility Type:** Distribution Center
**Assessment Date:** 2026-09-25 00:32:56 UTC
**Target Security Level (Global):** SL-T 2
**Facility SL-2 Compliance:** 33.3%
**Overall Inherent Risk Score:** 8.75 / 25

---

## 1. Executive Briefing
### Executive Summary: IEC 62443-3-2 Cyber Risk Assessment
**System Under Consideration:** Walmart DC #6094 (Ambient & Cold Chain Operations) (Walmart Supply Chain Operations - DC-6094)
**Assessment Standard:** ISA/IEC 62443-3-2 & IEC 62443-3-3 | **Target Security Level:** SL-T 2 (Across all OT Zones)

#### 1. Security Posture & Compliance Status
- **Facility SL-2 Compliance:** **33.3%** of operational zones currently meet SL-T 2.
- **Overall Unmitigated Risk Score:** **8.75 / 25**.
- **Critical Cyber-Physical Scenarios Identified:** **4**.
- **Non-Compliant Zones:** Ammonia Refrig, Supervisory Hmi, Sortation Conveyor, Asrs Pallet.

#### 2. Key Findings & Operational Exposure
1. **Direct DMZ Bypass into Ammonia Refrigeration (Safety Loop Threat):** Armis telemetry detected an uninspected direct conduit from Enterprise IT into the Ammonia Refrigeration PLC (Johnson Controls Frick Quantum HD). Combined with RUNE CVE-2021-32955 (Authentication Bypass), an attacker could alter setpoints or trigger an ammonia safety hazard without crossing the L3.5 DMZ.
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
| `ZONE-AMMONIA-REFRIG` | Ammonia Refrig | L1_BasicControl | SL-2 | **SL-0.0** | ⚠️ Gap: 2.0 | 2 | 5/5 |
| `ZONE-SUPERVISORY-HMI` | Supervisory Hmi | L2_SupervisoryControl | SL-2 | **SL-0.0** | ⚠️ Gap: 2.0 | 2 | 3/5 |
| `ZONE-SORTATION-CONVEYOR` | Sortation Conveyor | L1_BasicControl | SL-2 | **SL-1.0** | ⚠️ Gap: 1.0 | 1 | 3/5 |
| `ZONE-ASRS-PALLET` | Asrs Pallet | L1_BasicControl | SL-2 | **SL-1.0** | ⚠️ Gap: 1.0 | 1 | 4/5 |
| `ZONE-SITE-OPERATIONS` | Site Operations | L3_SiteOperations | SL-2 | **SL-2.0** | ✅ Compliant | 1 | 3/5 |
| `ZONE-OT-DMZ` | Ot Dmz | L3_5_OT_DMZ | SL-2 | **SL-2.0** | ✅ Compliant | 1 | 3/5 |

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
SL-T is set to **SL 2** across all Foundational Requirements (FR 1 to FR 7):

| Zone Name | FR 1 (IAC) | FR 2 (UC) | FR 3 (SI) | FR 4 (DC) | FR 5 (RDF) | FR 6 (TRE) | FR 7 (RA) | SL-A Min | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Ammonia Refrig | 1.0 | 2.0 | 1.0 | 1.0 | 0.0 | 2.0 | 1.0 | **0.0** | ❌ DEFICIENT |
| Supervisory Hmi | 1.0 | 2.0 | 1.0 | 1.0 | 0.0 | 2.0 | 2.0 | **0.0** | ❌ DEFICIENT |
| Sortation Conveyor | 2.0 | 2.0 | 1.0 | 2.0 | 2.0 | 2.0 | 2.0 | **1.0** | ❌ DEFICIENT |
| Asrs Pallet | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 1.0 | **1.0** | ❌ DEFICIENT |
| Site Operations | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **2.0** | ✅ PASS |
| Ot Dmz | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | 2.0 | **2.0** | ✅ PASS |

---

## 4. Threat Scenarios & Detailed Risk Assessment (Clause Z5)
### Zone: Ammonia Refrig (`ZONE-AMMONIA-REFRIG`)
#### 🔴 Scenario: Exploit of CVE-2021-32955 on DC6094-AMMONIA-COMP-PLC-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-01`)
- **Vulnerability Reference:** `CVE-2021-32955`
- **Threat Vector:** Remote exploit via Modbus-TCP, EtherNet/IP, HTTP targeting Johnson Controls Frick Quantum HD Web Server Authentication Bypass
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC6094-AMMONIA-COMP-PLC-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Unmitigated Risk:** Likelihood = 5/5, Consequence = 5/5 ➔ **Score: 25 (Critical)**
- **Recommended Compensating Controls:**
  - Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.
  - Deploy Industrial Firewall Deep Packet Inspection (DPI) rule restricting 10.142.12.10 to authorized engineering workstation IPs only; block unauthorized firmware download function codes.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.12.10.
- **Residual Risk Post-Mitigation:** Likelihood = 3/5, Consequence = 5/5 ➔ **Score: 15 (High)**

#### 🔴 Scenario: Exploit of CVE-2020-5504 on DC6094-AMMONIA-COMP-PLC-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-02`)
- **Vulnerability Reference:** `CVE-2020-5504`
- **Threat Vector:** Remote exploit via Modbus-TCP, EtherNet/IP, HTTP targeting Modbus-TCP Stack Denial of Service and State Injection in Embedded Controller
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC6094-AMMONIA-COMP-PLC-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Unmitigated Risk:** Likelihood = 4/5, Consequence = 5/5 ➔ **Score: 20 (Critical)**
- **Recommended Compensating Controls:**
  - Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.
  - Deploy Industrial Firewall Deep Packet Inspection (DPI) rule restricting 10.142.12.10 to authorized engineering workstation IPs only; block unauthorized firmware download function codes.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.12.10.
- **Residual Risk Post-Mitigation:** Likelihood = 2/5, Consequence = 5/5 ➔ **Score: 10 (High)**

#### 🔴 Scenario: Exploit of CVE-2022-3153 on DC6094-AMMONIA-SIS-PANEL-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-03`)
- **Vulnerability Reference:** `CVE-2022-3153`
- **Threat Vector:** Remote exploit via CIP-Safety, EtherNet/IP targeting Rockwell Automation GuardLogix/ControlLogix CIP Explicit Message Buffer Overflow
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC6094-AMMONIA-SIS-PANEL-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Unmitigated Risk:** Likelihood = 5/5, Consequence = 5/5 ➔ **Score: 25 (Critical)**
- **Recommended Compensating Controls:**
  - Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.12.11.
- **Residual Risk Post-Mitigation:** Likelihood = 3/5, Consequence = 5/5 ➔ **Score: 15 (High)**

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC6094-AMMONIA-SIS-PANEL-01 via Conduit (`TS-ZONE-AMMONIA-REFRIG-04`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via CIP-Safety, EtherNet/IP targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Catastrophic hazard: Compromise of DC6094-AMMONIA-SIS-PANEL-01 risks uncontrolled ammonia discharge, emergency plant evacuation, OSHA/EPA violation, and full cold-chain perishables destruction.
- **Unmitigated Risk:** Likelihood = 4/5, Consequence = 5/5 ➔ **Score: 20 (Critical)**
- **Recommended Compensating Controls:**
  - Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.12.11.
- **Residual Risk Post-Mitigation:** Likelihood = 2/5, Consequence = 5/5 ➔ **Score: 10 (High)**

### Zone: Supervisory Hmi (`ZONE-SUPERVISORY-HMI`)
#### 🔴 Scenario: Exploit of CVE-2022-3153 on DC6094-REFRIG-HMI-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-01`)
- **Vulnerability Reference:** `CVE-2022-3153`
- **Threat Vector:** Remote exploit via RDP, SMB, EtherNet/IP, HTTP targeting Rockwell Automation GuardLogix/ControlLogix CIP Explicit Message Buffer Overflow
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC6094-REFRIG-HMI-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Unmitigated Risk:** Likelihood = 4/5, Consequence = 3/5 ➔ **Score: 12 (High)**
- **Recommended Compensating Controls:**
  - Disable unneeded legacy protocols (SMBv1, plaintext HTTP); enforce MFA on RDP/bastion jumpbox.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.22.15.
- **Residual Risk Post-Mitigation:** Likelihood = 2/5, Consequence = 3/5 ➔ **Score: 6 (Medium)**

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC6094-REFRIG-HMI-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-02`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via RDP, SMB, EtherNet/IP, HTTP targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC6094-REFRIG-HMI-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Unmitigated Risk:** Likelihood = 2/5, Consequence = 3/5 ➔ **Score: 6 (Medium)**
- **Recommended Compensating Controls:**
  - Disable unneeded legacy protocols (SMBv1, plaintext HTTP); enforce MFA on RDP/bastion jumpbox.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.22.15.
- **Residual Risk Post-Mitigation:** Likelihood = 1/5, Consequence = 3/5 ➔ **Score: 3 (Low)**

#### 🔴 Scenario: Exploit of CVE-2021-34444 on DC6094-ENG-WORKSTATION-EWS-01 via Conduit (`TS-ZONE-SUPERVISORY-HMI-03`)
- **Vulnerability Reference:** `CVE-2021-34444`
- **Threat Vector:** Remote exploit via RDP, CIP, S7comm, SMBv1 targeting Windows Remote Desktop Protocol Elevation of Privilege on Engineering Workstations
- **Operational & Safety Consequence:** Supervisory compromise: Malicious access to DC6094-ENG-WORKSTATION-EWS-01 enables unauthorized PLC program downloads, tampering with setpoints, and lateral movement across L2 OT conduits.
- **Unmitigated Risk:** Likelihood = 2/5, Consequence = 3/5 ➔ **Score: 6 (Medium)**
- **Recommended Compensating Controls:**
  - Deploy Industrial Firewall Deep Packet Inspection (DPI) rule restricting 10.142.22.40 to authorized engineering workstation IPs only; block unauthorized firmware download function codes.
  - Disable unneeded legacy protocols (SMBv1, plaintext HTTP); enforce MFA on RDP/bastion jumpbox.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.22.40.
- **Residual Risk Post-Mitigation:** Likelihood = 1/5, Consequence = 3/5 ➔ **Score: 3 (Low)**

### Zone: Sortation Conveyor (`ZONE-SORTATION-CONVEYOR`)
#### 🔴 Scenario: Exploit of CVE-2023-3595 on DC6094-MAIN-CROSSBELT-SORTER-PLC via Conduit (`TS-ZONE-SORTATION-CONVEYOR-01`)
- **Vulnerability Reference:** `CVE-2023-3595`
- **Threat Vector:** Remote exploit via PROFINET, S7comm-Plus, SNMPv2c, HTTP targeting Siemens SIMATIC S7-1500 Remote Code Execution via S7comm-Plus Memory Corruption
- **Operational & Safety Consequence:** Operational degradation: Compromise of DC6094-MAIN-CROSSBELT-SORTER-PLC causes localized telemetry outage.
- **Unmitigated Risk:** Likelihood = 5/5, Consequence = 2/5 ➔ **Score: 10 (High)**
- **Recommended Compensating Controls:**
  - Immediately sever uninspected/direct conduit bypass into zone; enforce traffic through L3.5 DMZ firewall.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.14.20.
- **Residual Risk Post-Mitigation:** Likelihood = 3/5, Consequence = 2/5 ➔ **Score: 6 (Medium)**

### Zone: Asrs Pallet (`ZONE-ASRS-PALLET`)
#### 🔴 Scenario: Exploit of CVE-2020-5504 on DC6094-ASRS-CRANE-CONTROLLER-01 via Conduit (`TS-ZONE-ASRS-PALLET-01`)
- **Vulnerability Reference:** `CVE-2020-5504`
- **Threat Vector:** Remote exploit via ADS, EtherCAT, Modbus-TCP targeting Modbus-TCP Stack Denial of Service and State Injection in Embedded Controller
- **Operational & Safety Consequence:** Critical logistics disruption: Compromise of DC6094-ASRS-CRANE-CONTROLLER-01 halts core DC sortation / ASRS cranes, causing multi-hour trailer backlog, regional store replenishment delays, and >$1M operational loss.
- **Unmitigated Risk:** Likelihood = 2/5, Consequence = 4/5 ➔ **Score: 8 (Medium)**
- **Recommended Compensating Controls:**
  - Deploy Industrial Firewall Deep Packet Inspection (DPI) rule restricting 10.142.14.35 to authorized engineering workstation IPs only; block unauthorized firmware download function codes.
  - Configure Armis anomaly detection policy to alert on anomalous connection attempts to 10.142.14.35.
- **Residual Risk Post-Mitigation:** Likelihood = 1/5, Consequence = 4/5 ➔ **Score: 4 (Low)**


---

## 5. Cybersecurity Requirements Specification (CRS) (Clause Z6)
| Req ID | Priority | Target Zone | Standard Requirement | Actionable Engineering Specification | Responsible Team |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CRS-SUC-DC-6094-001` | **P0 - Immediate / Safety Block** | Ammonia Refrig | FR 5: Restricted Data Flow | Audit and sever all direct conduits bypassing the L3.5 DMZ into Ammonia Refrig. Re-route traffic through stateful industrial firewalls with protocol-specific allow-lists. | Walmart OT Network Engineering & Facility Maintenance |
| `CRS-SUC-DC-6094-002` | **P1 - Critical** | Ammonia Refrig | FR 3: System Integrity & FR 7: Resource Availability | Deploy industrial firewall Deep Packet Inspection (DPI) rules to shield vulnerable PLCs in Ammonia Refrig from unauthenticated malformed packets (CIP buffer overflows / S7comm-plus memory corruption). Stage firmware patching during the next scheduled planned maintenance window. | Walmart Automation & Controls Engineering |
| `CRS-SUC-DC-6094-003` | **P2 - High** | Ammonia Refrig | FR 1: Identification & FR 4: Confidentiality | Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in Ammonia Refrig. Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory). | Walmart OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-6094-004` | **P0 - Immediate / Safety Block** | Supervisory Hmi | FR 5: Restricted Data Flow | Audit and sever all direct conduits bypassing the L3.5 DMZ into Supervisory Hmi. Re-route traffic through stateful industrial firewalls with protocol-specific allow-lists. | Walmart OT Network Engineering & Facility Maintenance |
| `CRS-SUC-DC-6094-005` | **P1 - Critical** | Supervisory Hmi | FR 3: System Integrity & FR 7: Resource Availability | Deploy industrial firewall Deep Packet Inspection (DPI) rules to shield vulnerable PLCs in Supervisory Hmi from unauthenticated malformed packets (CIP buffer overflows / S7comm-plus memory corruption). Stage firmware patching during the next scheduled planned maintenance window. | Walmart Automation & Controls Engineering |
| `CRS-SUC-DC-6094-006` | **P2 - High** | Supervisory Hmi | FR 1: Identification & FR 4: Confidentiality | Disable unencrypted management protocols (HTTP, Telnet, SMBv1) on HMIs and workstations in Supervisory Hmi. Enforce TLS 1.3 / HTTPS and integrate user accounts with centralized privileged access management (CyberArk/Active Directory). | Walmart OT Systems Administration & Cybersecurity Operations |
| `CRS-SUC-DC-6094-007` | **P1 - Critical** | Sortation Conveyor | FR 3: System Integrity & FR 7: Resource Availability | Deploy industrial firewall Deep Packet Inspection (DPI) rules to shield vulnerable PLCs in Sortation Conveyor from unauthenticated malformed packets (CIP buffer overflows / S7comm-plus memory corruption). Stage firmware patching during the next scheduled planned maintenance window. | Walmart Automation & Controls Engineering |
| `CRS-SUC-DC-6094-008` | **P1 - Critical** | Asrs Pallet | FR 3: System Integrity & FR 7: Resource Availability | Deploy industrial firewall Deep Packet Inspection (DPI) rules to shield vulnerable PLCs in Asrs Pallet from unauthenticated malformed packets (CIP buffer overflows / S7comm-plus memory corruption). Stage firmware patching during the next scheduled planned maintenance window. | Walmart Automation & Controls Engineering |