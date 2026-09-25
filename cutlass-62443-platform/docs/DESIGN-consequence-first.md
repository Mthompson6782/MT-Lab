# CUTLASS Design Proposal: Consequence-First Assessment (CCE + CIE)

Status: DRAFT for review. Nothing here is implemented yet.

## 0. Ground rules (from Michael)

- **SL-T 2 is the floor for every OT zone.** CUTLASS doesn't derive SL-T 3 or 4.
- **Safety overlay.** Where a consequence involves safety (machine-safety controllers, ammonia refrigeration), CUTLASS adds selected SL-3 requirement enhancements (REs). The zone's SL-T stays 2. Output: `SL-T 2 + overlay [SR 1.1 RE2, SR 5.1 RE1, ...]`.
- **No SIS today.** GuardLogix units are machine-safety PLCs. Model them as `machine_safety`, not `sis`.
- **One flat OT zone today.** CUTLASS reports the current state as a single zone. ZCR 3 produces *recommended* zones. It doesn't assume they exist.

## 1. Why consequence-first

Right now the pipeline works device-first: find a CVE, score it, then attach a consequence based on a zone-name string match. CCE turns that around. First decide which outcomes must not happen, then work backwards to the digital assets and paths that could cause them. CIE adds the engineering view: a non-digital engineered control, such as a mechanical relief valve, a hardwired E-stop, or a hardwired ammonia-detector shutdown, **limits the consequence** no matter what an attacker does to the PLC. A cyber control can never do that.

That gives CUTLASS two separate levers:

| Lever | Reduces | Credited from |
|---|---|---|
| Engineered (non-digital) controls | **Consequence** | HCE catalog + site survey |
| Cyber controls (SRs met) | **Likelihood** | Evidence (observed / attested / SL-C) |

## 2. Pipeline mapped to ZCR 1–7 and the CCE phases

| Step | 62443-3-2 | CCE phase | What CUTLASS does |
|---|---|---|---|
| 1 | ZCR 1 Identify SuC | — | Facility perimeter, asset inventory (Armis), observed flows |
| 2 | — | **Ph 1 Consequence prioritization** | Instantiate High-Consequence Events (HCEs) from `hce_catalog.yaml` for this facility type. Keep only HCEs whose required assets actually exist. |
| 3 | ZCR 2 Initial risk | — | Worst-case unmitigated consequence per HCE (likelihood assumed 1.0). Engineered controls may lower consequence here. |
| 4 | — | **Ph 2 System-of-systems** | For each HCE, list the *functions* and digital assets it depends on (control, safety, HMI, EWS, remote access, vendor laptops). |
| 5 | ZCR 3 Partition | — | **Suggest** zones: cluster assets by (HCE membership × function × Purdue level), then check the clusters against observed flows. Output a proposed zone and conduit map with the reasoning for each. |
| 6 | ZCR 4 Screen | — | Plot initial risk on the 5×5 matrix (§2a). **Tolerable = Moderate.** Zones supporting any HCE rated High or Critical go to a detailed assessment. Zones at Low or Moderate get the SL-T 2 baseline only. |
| 7 | ZCR 5 Detailed | **Ph 3 Consequence-based targeting** | Graph search (networkx) from entry points (IT, vendor remote access, wireless, removable media) to *HCE-enabling assets*. SL-A evidence evaluation. Residual risk from implemented controls. |
| 8 | ZCR 6 CRS | **Ph 4 Mitigations** | Requirements ranked by CIE order: (1) remove the digital pathway or add an engineered control, (2) SL-T 2 SR gaps, (3) safety-overlay REs, (4) compensating controls. |
| 9 | ZCR 7 Approval | — | Approval record: asset owner, risk acceptance per HCE, residual risk accepted, sign-off date. Stored in `approvals/<facility>.yaml`. The report shows DRAFT until it's signed. |


### 2a. Risk matrix (5×5, tolerable = Moderate)

Risk is a **cell lookup**, not L×C arithmetic. The matrix leans toward consequence, so a catastrophic consequence never falls to Low. Everything lives in `config/risk_matrix.yaml`.

| Consequence ↓ / Likelihood → | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---|---|---|---|---|
| **5 Catastrophic** | Moderate | High | High | Critical | Critical |
| **4 Major** | Moderate | Moderate | High | High | Critical |
| **3 Moderate** | Low | Moderate | Moderate | High | High |
| **2 Minor** | Low | Low | Moderate | Moderate | High |
| **1 Negligible** | Low | Low | Low | Moderate | Moderate |

- **Tolerable risk = Moderate.** Low and Moderate are tolerable. High and Critical are not.
- **ZCR 4:** Any HCE at High or above in initial risk sends its supporting zone(s) to a detailed assessment.
- **ZCR 5/6 target:** The CRS must bring *current or projected residual* to Moderate or below. If a zone can't get there, it goes to ZCR 7 as an explicit risk acceptance.
- **Safety rule:** A safety consequence of 4 or more triggers the safety overlay REs even when residual risk is tolerable. Tolerable risk doesn't switch off safety hardening.
- The consequence (1–5) is the highest of the safety, operations, environmental and financial scores, after engineered bounds. The scales come from `consequence_matrix.yaml`.
- **Likelihood scale (1–5):**
  - 1 = not reachable from any entry point
  - 2 = reachable only through authenticated, inspected conduits
  - 3 = reachable across a flat OT network
  - 4 = reachable from IT or remote access, or an exploitable CVE on the path
  - 5 = direct IT-to-L1 path, or a KEV-listed CVE on an HCE-enabling asset
  - Implemented controls lower it (§5).

## 3. New config files (policy-as-code actually read)

### `config/hce_catalog.yaml` (per facility type)
```yaml
facility_types: [distribution_center, cold_chain_dc, fulfillment_center]
hces:
  HCE-NH3-01:
    title: Uncontrolled ammonia release from refrigeration
    applies_to: [cold_chain_dc]
    consequence: {safety: 5, operations: 4, environmental: 5, financial: 4}
    regulatory: [OSHA PSM 1910.119, EPA RMP]
    required_functions:
      - {role: refrigeration_control_plc, can_cause: [overpressure, valve_open]}
      - {role: refrigeration_hmi, can_cause: [setpoint_change, alarm_suppression]}
      - {role: engineering_workstation, can_cause: [logic_download]}
    engineered_bounds:          # CIE: non-digital limits on the consequence
      - {id: EB-NH3-RELIEF, desc: Mechanical pressure relief valves, caps: {safety: 3}}
      - {id: EB-NH3-DETECT, desc: Hardwired detector -> compressor shutdown, caps: {safety: 3, environmental: 3}}
    safety_overlay: [SR 1.1 RE2, SR 2.1 RE2, SR 3.2 RE1, SR 5.1 RE1]
  HCE-MS-01:
    title: Machine-safety function defeated (sorter/ASRS personnel exposure)
    required_functions:
      - {role: machine_safety_plc, can_cause: [safety_bypass, logic_download]}
    engineered_bounds:
      - {id: EB-HW-ESTOP, desc: Hardwired E-stop chain independent of PLC, caps: {safety: 3}}
    safety_overlay: [SR 2.1 RE2, SR 3.2 RE1, SR 3.4 RE1]
  HCE-OPS-01:
    title: Multi-shift outage of main sortation
    consequence: {operations: 4, financial: 4}
```

### `sites/<facility>/survey.yaml` (site-survey attestation)
```yaml
facility: DC-XXXX
surveyed_by: {name: ..., date: 2026-09-15}
engineered_bounds_present: {EB-NH3-RELIEF: verified, EB-NH3-DETECT: not_present, EB-HW-ESTOP: verified}
sr_attestations:
  SR 1.1: {status: met, evidence: "AD-backed HMI logins, screenshot ref #123", expires: 2027-09-15}
  SR 2.1: {status: partial, note: "RBAC on HMI, none on EWS"}
controls_implemented:
  - {id: CC-DPI-CIP-WRITE, zones: [OT], verified: 2026-09-10}
```

### `config/component_capabilities.yaml` (62443-4-2 SL-C)
Keyed by vendor/model/firmware. Each entry holds an SL-C per FR and a source (certificate or datasheet). Where there's no entry, the SL-C is unknown, not assumed.

## 4. SL-A: evidence-based, never pass-by-default

For every SL-2 SR in `iec62443_sl2_requirements.yaml`, CUTLASS resolves a status from three sources. The strongest evidence wins, and an observed violation always overrides:

1. **Observed (Armis):** cleartext management protocols, multi-homed devices, IT-to-L1 flows, unknown or wireless assets, default-credential detections, and so on. These are mostly *negative* evidence.
2. **Attested (site survey):** assessor, date, and expiry. Attestations past their expiry revert to `no_evidence`.
3. **Capability (SL-C):** a ceiling. The zone can't achieve FR n above the lowest SL-C of its in-scope components, unless an attested compensating control covers the gap.

SR status values are `met | partial | not_met | observed_violation | no_evidence`.

- An FR's SL-A is 2 only if **every** SL-2 SR in that FR is `met`, capped by SL-C.
- An FR where any SR is `no_evidence` is reported as **"Unverified (≤1)"**, not 2. FR2 and FR6 are evaluated like every other FR.
- The report adds an **evidence coverage %** for each zone, plus a list of the SRs that still need a survey. That list becomes the site-survey worklist for the next visit.

## 5. Residual risk: tied to what's actually in place

- **Inherent** = L0 × C_bounded. C_bounded is the consequence after verified engineered bounds.
- **Current residual** = L_current × C_bounded. Only `implemented` controls (attested or observed) reduce likelihood, and each control earns credit only against the threat vectors it covers. For example, CIP-write DPI credits the `logic_download` vector but not RDP.
- **Projected residual** = the same calculation with the recommended CRS controls added. It's always labelled *projected*.
- Each control credit lowers likelihood by whole steps on the 1–5 scale (minimum 1). Risk is then re-read from the matrix.
- Credits live in `config/control_credits.yaml`, so reviewers can challenge the numbers.

Also: if the Armis live mode returns no conduits or flows, CUTLASS **fails the run**. It doesn't treat that as compliant.

## 6. Open questions for Michael

1. ~~ZCR 4 tolerable-risk threshold~~ **Decided:** 5×5 matrix, tolerable = Moderate (§2a). Please check the cell layout, especially Catastrophic × Rare = Moderate.
2. **HCE starter set.** Is ammonia release / machine-safety defeat / sortation outage / cold-chain loss the right first four for DCs? Anything specific to fulfillment or micro-fulfillment centers?
3. **Consequence dimensions.** Is scoring safety, operations, environmental, and financial separately (taking the max) OK, or do you want weighting?
4. **Engineered-bound credit.** Should a verified engineered bound cap the consequence (as proposed), or only lower it by one step?
5. **Overlay REs.** Are the SL-3 REs listed per HCE the ones you'd include, or do you have a preferred list?
