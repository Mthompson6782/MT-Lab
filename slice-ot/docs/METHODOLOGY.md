# SLiCE Methodology Specification

**Structured Likelihood and Confidence Evaluation for OT/ICS Cybersecurity Risk Assessment**  
*Based on the paper presented at the AIChE 2026 Spring Meeting & 22nd Global Congress on Process Safety (GCPS), Houston, TX (April 2026).*

---

## 1. Executive Problem Statement

Traditional industrial cybersecurity risk assessments routinely borrow single-point likelihood scores or standard IT matrices that suffer from two structural failures in Operational Technology (OT):

1. **False Precision**: Assigning an unqualified `"Low"` or `"2/5"` likelihood to a legacy PLC or SIS scenario masks whether that score reflects verified network segmentation and continuous telemetry—or simply complete blindness.
2. **Collapsing Probability with Certainty**: When teams try to average uncertainty directly into risk scores, high-consequence blind spots drift into the middle of the register and fail to drive either remediation or characterization.

**SLiCE** solves both failures by strictly separating **Likelihood ($L$)** *(how probable is the scenario given technical exposure and adversary trajectory?)* from **Confidence ($C$)** *(how strong, corroborated, and complete is the evidence supporting that judgment?)*.

---

## 2. Foundation in Intelligence Community Directive (ICD) 203

SLiCE adapts two core tradecraft mandates from **ICD 203** (*Analytic Standards*):

- **Analytic Tradecraft Standard 3 (Expressions of Likelihood & Uncertainty)**: Assessments must express likelihood using standardized qualitative terms paired with numeric bounds—never bare, ambiguous labels—and state confidence levels explicitly.
- **Analytic Tradecraft Standard 4 (Distinction Between Judgments & Evidentiary Bases)**: Analysts must distinguish underlying technical judgments from the breadth, independence, and quality of corroborating sources.

In SLiCE, **Likelihood and Confidence are never multiplied or averaged together**. Every scenario outputs a three-part expression:

```text
L[1–5] : C-[Low | Moderate | High] : I[1–5]
```

*(For example: `L4 (3.65) : C-Low : I5` signals a likely high-consequence event backed by weak evidence—mandating urgent characterization rather than blind assumption.)*

---

## 3. Likelihood Scoring ($L_1 - L_5$)

Likelihood is evaluated on a 1–5 integer scale across three weighted factors:

$$L = 0.40A + 0.35E + 0.25H$$

| Factor | Weight | Scope |
| :--- | :---: | :--- |
| **$A$ — Attack Surface & Accessibility** | **40%** | Reachability from IT, internet, transient maintenance laptops, vendor remote access, or physical access paths. |
| **$E$ — Exploitable Conditions** | **35%** | Difficulty of chaining vulnerabilities, unauthenticated industrial protocols (Modbus/TCP, CIP, S7, DNP3), default credentials, and missing segmentation. |
| **$H$ — Historical & Threat Activity** | **25%** | Observed intrusion attempts, relevant ICS advisories, sector targeting, and verified detection coverage over a 36-month window. |

*Scores are rounded to two decimal places before tier assignment.*

### Likelihood Tiers & ICD 203 Calibrated Language

| Tier | Score Range | ICD 203 Language | Approximate Probability | Operational Interpretation |
| :---: | :---: | :--- | :---: | :--- |
| **L5** | `4.21 – 5.00` | Almost certain | `~85–97%` | Event is expected absent significant change in conditions. |
| **L4** | `3.41 – 4.20` | Likely | `~55–80%` | Event will probably occur given current trajectory. |
| **L3** | `2.61 – 3.40` | Roughly even chance | `~40–60%` | Contributing factors exist but outcome is uncertain. |
| **L2** | `1.81 – 2.60` | Unlikely | `~15–35%` | Event is possible but not expected under current conditions. |
| **L1** | `1.00 – 1.80` | Remote | `~2–15%` | Event would require extraordinary or unprecedented circumstances. |

---

## 4. Analytic Confidence Engine ($C_1 - C_4$)

Confidence is assessed across four independent dimensions rated **Low (`1`)**, **Moderate (`2`)**, or **High (`3`)**:

1. **$C_1$ — Control Validation**: Has segmentation, firewall ACL enforcement, hardening, or compensating logic been empirically tested (e.g., configuration audit, tabletop, or scoped pentest) vs. assumed on paper?
2. **$C_2$ — Asset Inventory**: Do we have complete, current firmware, serial, protocol, and engineering workstation inventories down to Purdue Levels 0–2?
3. **$C_3$ — Network Telemetry**: Is passive OT intrusion detection / NetFlow / SPAN visibility deployed along the attack path so malicious commands or staging would actually be observed?
4. **$C_4$ — Analytic Corroboration**: Are claims substantiated by multiple independent evidence sources (e.g., PCAPs + PLC logs + field walkdown), rather than a single questionnaire, stale diagram, or unverified vendor assurance?

### Base Confidence Aggregation Rule

Let $n_{\text{Low}}$, $n_{\text{Mod}}$, and $n_{\text{High}}$ denote counts across $\{C_1, C_2, C_3, C_4\}$:

- If $n_{\text{Low}} \ge 2 \implies$ **Low**
- Else if $n_{\text{High}} \ge 3$ and $n_{\text{Low}} = 0 \implies$ **High**
- Else if $(n_{\text{Mod}} + n_{\text{High}}) \ge 2$ and $n_{\text{Low}} \le 1 \implies$ **Moderate**
- Else $\implies$ **Low**

### Mandatory Integrity Safeguards & Caps

Even if base aggregation yields `Moderate` or `High`, SLiCE enforces three deterministic guardrails:

| Rule | Condition | Effect | Rationale |
| :--- | :--- | :--- | :--- |
| **1. Single-Source Override** | `C4 = Low` | Forces Confidence to **Low** *(regardless of `C1–C3`)* | Uncorroborated claims (e.g., vendor assurances or a single unverified diagram) cannot anchor Moderate/High certainty. |
| **2. Historical Linkage Rule** | `H <= 2` | Caps Confidence at **Moderate** | When empirical history (`H = 1` or `H = 2`) is sparse, the analyst cannot claim High certainty without prior detection proof. |
| **3. Bias Catalog Gate** | Reviewed biases `< 10` | Caps Confidence at **Moderate** | High Confidence requires explicit sign-off across all 10 OT Cognitive & Analytic Biases. |

---

## 5. Consequence Impact Scoring ($I_1 - I_5$)

Consistent with process safety engineering, SLiCE scores Consequence Impact using **worst-case `max()`** rather than averaging across categories (preventing severe HSE harm from being diluted by minor downtime):

$$I = \max(I_{\text{Safety/HSE}},\; I_{\text{Environmental}},\; I_{\text{Operational}})$$

*(In broader enterprise registers, Financial Loss and Regulatory/Compliance can likewise be folded into the same worst-case `max()` horizon.)*

| Tier | Classification | Description |
| :---: | :--- | :--- |
| **I5** | Catastrophic | Multiple fatalities / permanent disability, irreversible major environmental release, or multi-week/permanent plant outage. |
| **I4** | Severe | Single fatality or life-altering injury, major offsite environmental impact, or extended unit shutdown. |
| **I3** | Significant | Recordable/lost-time injury, reportable onsite release, or multi-hour/multi-day operational disruption. |
| **I2** | Minor | First-aid injury, contained minor spill, or brief recoverable process upset. |
| **I1** | Negligible | No safety/environmental impact; negligible production loss. |

### Impact Integrity Rules

- **Cascade Modeling ($I \ge I_3$)**: Document secondary and tertiary physical/cyber propagation paths at least **two levels deep** beyond the initial target controller.
- **Degraded Operator Response**: Assume compromised/spoofed HMIs, alarm flooding, or distracted operators—never score consequence assuming ideal emergency response.

---

## 6. The $3 \times 3$ (`L × C`) Decision Matrix & Bottom-Right Paradox

Once $L$, $C$, and $I$ are determined, SLiCE maps **Likelihood Tier × Confidence Rating** to an explicit operational mandate *(with Impact $I$ governing remediation priority and SLA urgency)*:

| Likelihood Tier | High Confidence | Moderate Confidence | Low Confidence |
| :--- | :--- | :--- | :--- |
| **L4–L5** *(Likely – Almost certain)* | **MITIGATE** | **INVESTIGATE** | **CHARACTERIZE** |
| **L3** *(Roughly even chance)* | **MONITOR** | **ASSESS** | **INVESTIGATE** |
| **L1–L2** *(Remote – Unlikely)* | **ACCEPT** | **MONITOR** | **CHARACTERIZE** |

### Action Definitions

- **MITIGATE**: High likelihood substantiated by High confidence. Execute immediate engineering controls (conduit ACLs, protocol allowlisting, physical interlocks) and validate effectiveness.
- **INVESTIGATE**: Likelihood appears moderate/elevated, or uncertainty limits confidence. Conduct targeted technical verification (scoped OT assessment, configuration inspection, or detection check) before major capex.
- **CHARACTERIZE**: Evidentiary basis is too thin (`C-Low`) to trust the Likelihood estimate. Deploy passive OT monitoring, complete Purdue Level 0–2 inventory/walkdown, and re-score.
- **ASSESS**: Balanced `L3 : C-Moderate` exposure. Validate compensating controls and add independent corroboration.
- **MONITOR**: Controls and confidence align with exposure; maintain telemetry tracking and scheduled review.
- **ACCEPT**: **Reserved exclusively for `L1–L2` paired with `C-High`.** Document formal risk owner sign-off and review expiration date.

### The Bottom-Right Paradox (`L1–L2` + `C-Low`)

Notice the bottom-right cell: even when an analyst believes likelihood is **Remote or Unlikely (`L1–L2`)**, **`C-Low` blocks `ACCEPT` and mandates `CHARACTERIZE`**.

> *"We don't know" $\neq$ "We're safe."*

---

## 7. Ten-Bias OT Analytic Catalog & Enforcement Rules

| # | Bias Name | Analytic Distortion | Enforcement Rule |
| :-: | :--- | :--- | :--- |
| 1 | **Air-Gap Complacency** | Assumes network isolation equals security, ignoring physical vectors and convergence creep. | **Accessibility floor**: Air-gapped assets with untrusted physical vectors cannot score below `A = 3`. |
| 2 | **Absence-of-Evidence Fallacy** | Interprets zero incidents as security rather than zero detection capability. | **Detection Sufficiency Test** required before scoring `H < 3`. *(Advisory triggers when `H <= 2` and `C3 = Low`.)* |
| 3 | **Vendor Trust Bias** | Accepts OEM security claims without independent verification. | Confidence cannot be `High` if scores rest solely on vendor claims *(enforced via `C4 = Low` override)*. |
| 4 | **Safety System Over-Reliance** | Assumes SIS will compensate for BPCS vulnerabilities. | **Dual-system scenario**: Must score both SIS-available and SIS-compromised. |
| 5 | **Recency Bias** | Over-weights recent headlines; under-weights persistent threats. | **36-month evidence window** and single-event sensitivity test. |
| 6 | **Complexity Discount** | Assumes OT attacks must be sophisticated, ignoring simpler paths. | **Minimum Viable Attack Rule**: Score `E` for the simplest path to consequence. |
| 7 | **Normalization of Residual Risk** | Treats long-standing vulnerabilities as lower risk due to familiarity. | **Vulnerability Age Neutrality**. Untested compensating controls reduce `C4`. |
| 8 | **Sector Exceptionalism** | Believes the organization is not a plausible target. | **Platform-based threat inclusion** and opportunistic threat baseline. |
| 9 | **Assessment Anchoring** | Prior scores bias reassessment toward incremental adjustment. | **Blind Scoring Procedure**: Score before reviewing prior values. |
| 10 | **Consequence Optimism** | Underestimates cascading consequences and assumes normal operator response. | **Cascade Modeling** (2+ levels deep for `I >= I3`) and **Degraded Response Test**. |

---

## 8. The Confidence Dividend

Buying down uncertainty is frequently **faster, safer, and far less capital-intensive** than jumping directly to physical network redesigns based on low-confidence guesses:

- Moving a brownfield unit from `C-Low` to `C-High` via passive OT telemetry (`C3`), physical walkdown inventories (`C2`), and config verification (`C1`) often reveals that a suspected `L4` path is blocked (`L1–L2 -> ACCEPT`), OR focuses scarce capex strictly on the real `MITIGATE` paths rather than speculative compliance theater.

---

## 9. Standards & Regulatory Alignment

SLiCE complements and operationalizes existing industrial cybersecurity frameworks:

- **ISA/IEC 62443-3-2** (*Security Risk Assessment for System Design*): Pairs seamlessly with Zone & Conduit partitioning (e.g., via CUTLASS™) by attaching an auditable `C-rating` to every zone risk score before `SL-T` determination.
- **NIST SP 800-82 Rev. 3** (*Guide to OT Security*): Operationalizes risk characterization with explicit separation between likelihood estimation and monitoring/inventory maturity.
- **TSA Pipeline Security Directives (SD02 series)**: Supports defensible, evidence-backed criticality and segmentation prioritization during regulatory audits.
