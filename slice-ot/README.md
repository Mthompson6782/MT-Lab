# SLiCE™ — Structured Likelihood and Confidence Evaluation

An Intelligence Community Directive (**ICD 203**) inspired **Operational Technology (OT) / Industrial Control Systems (ICS) Cybersecurity Risk & Analytic Confidence Engine**.

Developed for the **AIChE 2026 Spring Meeting & 22nd Global Congress on Process Safety (GCPS)**, SLiCE replaces single-point risk matrices with an explicit **Likelihood : Confidence : Impact (`L : C : I`)** triplet so plant engineers, cyber analysts, and asset owners never mistake *"low visibility"* for *"low risk."*

- **Live Interactive Console:** [https://mthompson6782.github.io/MT-Lab/slice-demo.html](https://mthompson6782.github.io/MT-Lab/slice-demo.html)
- **Full Methodology Specification:** [docs/METHODOLOGY.md](docs/METHODOLOGY.md)
- **MT-Lab Portal:** [https://mthompson6782.github.io/MT-Lab/](https://mthompson6782.github.io/MT-Lab/)

---

## Why SLiCE?

Conventional IT scoring models (e.g., CVSS alone or single-point `Likelihood × Impact` heat maps) collapse **technical probability** and **evidentiary certainty** into a single ambiguous number. In industrial environments—especially brownfield facilities with missing asset inventories, sparse Purdue Level 1/2 telemetry, or air-gap assumptions—an unmonitored PLC often gets scored as "Low Likelihood" because *"we haven't seen anything happen."*

SLiCE enforces ICD 203 Analytic Tradecraft Standards (**ATS 3** and **ATS 4**) by expressing every risk judgment as an uncollapsed triplet:

```text
L[1–5] (weighted score) : C-[Low | Moderate | High] : I[1–5]
```

And routing decisions through a **3 × 3 (`L × C`) Decision Matrix** that separates engineering remediation (**MITIGATE**) from targeted telemetry/verification (**CHARACTERIZE** / **INVESTIGATE**).

---

## Key Engine & UI Capabilities

- **Weighted Likelihood Model (`src/lib/sliceLogic.ts`)**:
  Computes $L = 0.40A + 0.35E + 0.25H$ across **Attack Surface & Accessibility ($A$)**, **Exploitable Conditions ($E$)**, and **Historical & Threat Activity ($H$)**, mapping to ICD 203 tiers **`L1` (Remote)** through **`L5` (Almost certain)**.
- **Four-Dimension Analytic Confidence (`C1–C4`)**:
  Evaluates **Control Validation (`C1`)**, **Asset Inventory (`C2`)**, **Network Telemetry (`C3`)**, and **Analytic Corroboration (`C4`)**.
- **Deterministic Integrity Safeguards**:
  - **Single-Source Override**: `C4 = Low` forces overall Confidence to `Low` regardless of `C1–C3`.
  - **Historical Linkage Rule**: `H <= 2` caps overall Confidence at `Moderate`.
  - **10-Bias Analytic Catalog Gate**: Confidence cannot exceed `Moderate` until all 10 OT cognitive biases are evaluated.
  - **Bias Advisories**: Surfaces targeted warnings for **Air-Gap Complacency (`A <= 2`)**, **Absence-of-Evidence Fallacy (`H <= 2` & `C3 = Low`)**, and **Cascade / Degraded Response (`I >= I3`)**.
- **Worst-Case Consequence Scoring (`I1–I5`)**:
  Evaluates **Safety & HSE**, **Environmental Release**, and **Operational Impact** using `max(...)` (`I1 Negligible` to `I5 Catastrophic`).
- **3 × 3 `L × C` Decision Matrix**:

| Likelihood Tier | High Confidence | Moderate Confidence | Low Confidence |
| :--- | :--- | :--- | :--- |
| **L4–L5 (Likely – Almost certain)** | **MITIGATE** | **INVESTIGATE** | **CHARACTERIZE** |
| **L3 (Roughly even chance)** | **MONITOR** | **ASSESS** | **INVESTIGATE** |
| **L1–L2 (Remote – Unlikely)** | **ACCEPT** | **MONITOR** | **CHARACTERIZE** *(Bottom-Right Paradox)* |

- **5 Reference OT Scenario Presets & Export**:
  Includes 5 built-in ICS scenarios demonstrating each matrix action and guardrail override, plus instant client-side **Markdown (`.md`)** and **JSON (`.json`)** report downloads.

---

## Local Development, Testing & Single-File Build

This project uses React 19, TypeScript, Tailwind CSS v3, Vite, Vitest, and `vite-plugin-singlefile` to emit a zero-dependency standalone console copied to `../slice-demo.html`.

```bash
cd slice-ot
npm install

# Run unit tests (Vitest)
npm test

# Typecheck + ESLint
npm run lint

# Start local dev server
npm run dev

# Build standalone single-file HTML bundle (dist/index.html)
npm run build
```

*(Note on Windows PowerShell: if script execution policy blocks `npm.ps1`, run commands via `cmd /c "npm test"` or `npm.cmd`.)*

---

## Repository Structure

```text
slice-ot/
├── docs/
│   └── METHODOLOGY.md           # Full mathematical spec, tables, biases & standards mapping
├── src/
│   ├── components/
│   │   ├── BiasChecklist.tsx    # Interactive 10-Bias OT Analytic Catalog gate
│   │   ├── ConfidenceInput.tsx  # C1–C4 selector controls & active override alerts
│   │   ├── DecisionMatrix.tsx   # Live highlighted 3x3 (L x C) Action Matrix
│   │   ├── ImpactInput.tsx      # Safety, Environmental, and Operational I1–I5 inputs
│   │   ├── ResultCard.tsx       # Sticky L:C:I triplet readout, rules, advisories & export
│   │   └── ScoreInput.tsx       # Weighted A / E / H likelihood controls
│   ├── lib/
│   │   ├── sliceLogic.ts        # Core SLiCE engine, presets, bias catalog & action matrix
│   │   └── sliceLogic.test.ts   # Vitest unit test suite covering boundaries & overrides
│   ├── App.tsx                  # Interactive MT-Lab dark-mode console
│   ├── index.css                # Tailwind entrypoint & dark styling
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts               # Configured with base: './' & viteSingleFile()
```
