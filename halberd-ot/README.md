# HALBERD (MITRE Cyber SEAL™ / iolite secure Clone)

**HALBERD** (**H**appened-before **A**nalytics & **L**ogic **B**aseline for **E**dge **R**esponse & **D**efense) is an open-source, modular, low-SWaP (Size, Weight, and Power) cybersecurity defense and threat emulation platform tailored for industrial control systems (ICS), supervisory control and data acquisition (SCADA), and tactical cyber-physical edge environments.

Originally prototyped by MITRE under the **Cyber SEAL™** initiative and commercialized by Highway Ventures as **iolite secure**, this suite bridges the gap between IT network telemetry and cyber-physical process operations.

Unlike traditional enterprise IT security tools that prioritize Confidentiality and often disrupt operations via aggressive scanning or blind disconnections, HALBERD operates strictly on the **Availability, Integrity, and Safety (AIC)** triad.

---

## The 4 Core Architectural Pillars

```
+---------------------------------------------------------------------------------------------------+
|                                      EdgeReactor™ GUI / API                                       |
|  - Purdue Model Architecture Topology (Levels 0 - 3.5)                                            |
|  - Real-Time Cyber-Physical Telemetry & Safety Envelopes                                          |
|  - Guided Non-Disruptive Operator Response Playbooks                                              |
|  - Effects Language Threat Emulation Control Sandbox                                              |
+------------------------------------+--------------------------------------------------------------+
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
+-----------------------------+               +-----------------------------+
|    HBL™ Temporal Engine     |               |    eLEARN™ Baseline Engine  |
|  - Happened-Before Logic    |               |  - Communication Matrix     |
|  - State-Machine Tracking   |               |  - Online Welford / EWMA    |
|  - Inter-Event Correlation  |               |  - CUSUM Drift Detection    |
|  - Multi-Event Watchpoints  |               |  - Physical Safety Bounds   |
+-----------------------------+               +-----------------------------+
             ^                                               ^
             |                                               |
             +-----------------------+-----------------------+
                                     |
               Normalized Industrial Event Stream (Modbus TCP, Sensors)
                                     |
+------------------------------------+--------------------------------------+
|                     Effects Language (EL™) Engine                        |
|  - ATT&CK for ICS Campaign Emulation (T0836, T0855, T0846, T0888)        |
|  - Directed Acyclic Attack Graphs (DAG) with Lazy Precondition Evaluation  |
|  - Built-in Cyber-Physical Plant Simulator (Municipal Water Treatment)   |
+---------------------------------------------------------------------------+
```

### 1. Happened-Before Language (HBL™)
A streaming temporal logic and multi-event state machine analytic engine based on Leslie Lamport's *Happened-Before relation* ($A \to B$):
- Evaluates temporal causal chains across distributed industrial streams (Modbus TCP, DNP3, S7comm, Syslog).
- Expresses declarative **Watchpoints** with sliding time windows, inter-event field correlations (e.g. matching destination PLC across steps), and negative exclusion conditions.
- Reconstructs and displays the exact chronological causality chain for operators ($E_1 \to E_2 \to \dots \to E_n$).

### 2. eLEARN™ Baseline Deviation Engine
A low-SWaP statistical profiler that learns normal operating envelopes without heavy machine-learning overhead:
- **OT Communication Matrix**: Learns authorized source/destination pairings, protocol ports, and permitted function codes. Detects rogue hosts and DMZ bypasses.
- **Process Envelope Profiler**: Online Welford algorithm, EWMA, and CUSUM (Cumulative Sum) tracking for sensor and register values (e.g. tank level, chlorine dosage, motor RPM). Detects out-of-distribution values and stealthy slow drift attacks.

### 3. Effects Language (EL™) Threat Emulation
A declarative attack graph coordination engine mapped directly to **MITRE ATT&CK for ICS**:
- Orchestrates multi-stage adversary campaigns using Directed Acyclic Graphs (DAG).
- **Lazy Precondition Evaluation**: Attack steps evaluate real-time physical conditions (e.g., verifying a pump is running or a tank is full) before triggering effects.
- **Strict Safety Bounds**: Sandboxed against localhost/simulated edge controllers to prevent unintended disruption to operational physical systems.

### 4. EdgeReactor™ Operator Interface & Safe Response Playbooks
A low-friction tactical interface tailored for **non-cyber-savvy plant operators and control engineers**:
- **Purdue Model Visualization**: Dynamic status indicators across Level 0 (Sensors/Actuators), Level 1 (PLCs), Level 2 (HMI/EWS), and Level 3 (Historian/DMZ).
- **Process-First Deterministic Playbooks**: Step-by-step guidance ensuring plant safety:
  1. *Physical Process Verification* (checking physical dials before believing SCADA).
  2. *Hardware Memory Protect Key Switch* (locking PLC chassis physically without tripping process).
  3. *Conduit Isolation* (severing rogue IP/MAC pairings at industrial firewalls while preserving HMI polling).
  4. *Authorized Process Restoration*.

---

## Project Structure

```
cyberseal-ot/
├── seal/
│   ├── config.py                 # Low-SWaP memory limits, timeouts, ports
│   ├── core.py                   # Central OpenSEAL system coordinator
│   ├── cli.py                    # Unified command-line interface
│   ├── topology_manager.py       # Purdue model asset & conduit graph
│   ├── models/                   # Pydantic schemas (events, alerts, playbooks, assets)
│   ├── hbl/                      # Happened-Before Language AST, parser, state machine & engine
│   ├── elearn/                   # Baseline matrix, Welford/EWMA profiler & detector
│   ├── el/                       # Effects Language attack graph, ATT&CK for ICS & executor
│   ├── ot_simulator/             # Water treatment plant physics & Modbus TCP server
│   ├── playbooks/                # Operator response playbooks (JSON)
│   └── edgereactor/              # FastAPI backend & tactical HTML5/Tailwind/WebSocket UI
├── tests/                        # Full pytest test suite
└── requirements.txt              # Dependencies
```

---

## Quick Start

### 1. Installation
Ensure Python 3.10+ is installed:
```powershell
pip install -r requirements.txt
```

### 2. Run Test Suite
Run the automated unit and integration tests:
```powershell
python -m pytest tests/ -v
```

### 3. Launch EdgeReactor™ Dashboard
Start HALBERD with the virtual plant simulator:
```powershell
python -m seal.cli start --port 8080
```
Open your browser to: **`http://localhost:8080`**

### 4. CLI Threat Emulation
Execute an Effects Language multi-stage attack from the command line:
```powershell
# Emulate Unauthorized Chemical Dosing Setpoint Attack (T0846 -> T0855 -> T0836)
python -m seal.cli emulate --scenario chemical_overdose

# Emulate False Water Level Telemetry & Valve Trip (T0855)
python -m seal.cli emulate --scenario false_data_injection
```

### 5. Inspect Watchpoints & Playbooks
```powershell
python -m seal.cli rules
python -m seal.cli playbooks
```

---

## MITRE ATT&CK for ICS Coverage Matrix

| Technique ID | Technique Name | HALBERD Detection Engine | Emulation Scenario | Operator Playbook |
| :--- | :--- | :--- | :--- | :--- |
| **T0836** | Modify Parameter | HBL-WP-001 / eLEARN | Chemical Dosing Setpoint Alteration | `PB-ICS-SETPOINT-01` |
| **T0888** | Loss of Safety | HBL-WP-002 | Toxic Chemical Overdose Injection | `PB-ICS-SETPOINT-01` |
| **T0855** | Unauthorized Command Message | HBL-WP-003 / eLEARN Matrix | Rogue Master Ingress / False Level Spoof | `PB-ICS-COMM-02` |
| **T0846** | Remote System Discovery | HBL-WP-001 | Modbus Diagnostic Query Probe | `PB-ICS-COMM-02` |
