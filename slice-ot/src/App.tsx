import { useMemo, useState } from 'react';
import {
  Activity,
  Code2,
  Compass,
  History,
  Home,
  Lock,
  RotateCcw,
  Shield,
  ShieldAlert,
  Target,
} from 'lucide-react';
import {
  ALL_BIAS_IDS,
  SCENARIO_PRESETS,
  calculateSlice,
  type ConfidenceInputs,
  type ImpactInputs,
  type LikelihoodInputs,
  type LikelihoodScore,
  type ScenarioMetadata,
  type ScenarioPreset,
} from './lib/sliceLogic';
import { ScoreInput } from './components/ScoreInput';
import { ConfidenceInput } from './components/ConfidenceInput';
import { ImpactInput } from './components/ImpactInput';
import { BiasChecklist } from './components/BiasChecklist';
import { DecisionMatrix } from './components/DecisionMatrix';
import { ResultCard } from './components/ResultCard';

const DEFAULT_PRESET = SCENARIO_PRESETS[0];

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [activePresetId, setActivePresetId] = useState<string>(DEFAULT_PRESET.id);
  const [scenario, setScenario] = useState<ScenarioMetadata>(DEFAULT_PRESET.metadata);
  const [lInputs, setLInputs] = useState<LikelihoodInputs>(DEFAULT_PRESET.likelihood);
  const [cInputs, setCInputs] = useState<ConfidenceInputs>(DEFAULT_PRESET.confidence);
  const [iInputs, setIInputs] = useState<ImpactInputs>(DEFAULT_PRESET.impact);
  const [biases, setBiases] = useState<string[]>(DEFAULT_PRESET.biases);

  const result = useMemo(
    () => calculateSlice(lInputs, cInputs, iInputs, biases),
    [lInputs, cInputs, iInputs, biases]
  );

  const loadPreset = (preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    setScenario({ ...preset.metadata });
    setLInputs({ ...preset.likelihood });
    setCInputs({ ...preset.confidence });
    setIInputs({ ...preset.impact });
    setBiases([...preset.biases]);
  };

  const resetBlank = () => {
    setActivePresetId('custom');
    setScenario({
      title: 'Custom OT Threat Scenario',
      assetZone: 'Purdue Level 1/2 · Specify Asset & Zone',
      attackPath: 'Specify adversary entry vector and lateral path',
      consequenceChain: 'Specify physical, environmental, and operational consequence chain',
    });
    setLInputs({ accessibility: 3, exploitComplexity: 3, historicalFrequency: 1 });
    setCInputs({
      controlValidation: 'Low',
      assetInventory: 'Low',
      networkTelemetry: 'Low',
      analyticCorroboration: 'Low',
    });
    setIInputs({ safety: 1, environmental: 1, operational: 1 });
    setBiases([]);
  };

  const handleExportJson = () => {
    const payload = {
      methodology: 'SLiCE (Structured Likelihood and Confidence Evaluation)',
      standardReference: 'ICD 203 ATS 3 & 4 / AIChE GCPS 2026',
      generatedAt: new Date().toISOString(),
      scenario,
      inputs: {
        likelihood: lInputs,
        confidence: cInputs,
        impact: iInputs,
        biasesReviewed: biases,
      },
      output: result,
    };
    downloadFile(
      `slice-assessment-${Date.now()}.json`,
      JSON.stringify(payload, null, 2),
      'application/json'
    );
  };

  const handleExportMarkdown = () => {
    const md = [
      `# SLiCE OT Cybersecurity Assessment Record`,
      ``,
      `- **Generated:** ${new Date().toISOString()}`,
      `- **Scenario:** ${scenario.title}`,
      `- **Target Asset / Zone:** ${scenario.assetZone}`,
      `- **Attack Path:** ${scenario.attackPath}`,
      `- **Consequence Chain:** ${scenario.consequenceChain}`,
      ``,
      `## Risk Expression & Recommended Action`,
      `- **SLiCE Triplet:** \`${result.triplet}\``,
      `- **Recommended Action:** **${result.action}**`,
      `- **Likelihood:** ${result.likelihoodTier} (${result.likelihoodScore.toFixed(2)} — ${result.likelihoodLabel}, ${result.likelihoodRange})`,
      `- **Confidence:** ${result.confidenceRating} (Base: ${result.baseConfidenceRating}; Biases Evaluated: ${biases.length}/${ALL_BIAS_IDS.length})`,
      `- **Impact:** ${result.impactTier} (${result.impactLabel})`,
      ``,
      `## Factor Breakdown`,
      `- Accessibility (A, 40%): ${lInputs.accessibility}`,
      `- Exploit Complexity (E, 35%): ${lInputs.exploitComplexity}`,
      `- Historical Frequency (H, 25%): ${lInputs.historicalFrequency}`,
      `- C1 Control Validation: ${cInputs.controlValidation}`,
      `- C2 Asset Inventory: ${cInputs.assetInventory}`,
      `- C3 Network Telemetry: ${cInputs.networkTelemetry}`,
      `- C4 Analytic Corroboration: ${cInputs.analyticCorroboration}`,
      `- Impact (Safety / Environmental / Operational): I${iInputs.safety} / I${iInputs.environmental} / I${iInputs.operational}`,
      ``,
      `## Active Overrides & Guardrails`,
      ...(result.appliedRules.length
        ? result.appliedRules.map((r) => `- **${r.title}:** ${r.detail}`)
        : ['- None triggered']),
      ...(result.advisories.length
        ? result.advisories.map((a) => `- **${a.title}:** ${a.detail}`)
        : []),
      ``,
    ].join('\n');

    downloadFile(`slice-assessment-${Date.now()}.md`, md, 'text/markdown');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* MT-Lab Sticky Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-extrabold tracking-wider text-base uppercase bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent">
                  SLiCE Interactive Console
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/70 text-cyan-300 font-mono font-bold">
                  ICD 203 · OT RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Structured Likelihood &amp; Confidence Evaluation • AIChE GCPS 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={resetBlank}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Blank Scenario</span>
            </button>
            <a
              href="cutlass-demo.html"
              className="bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-700/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CUTLASS ↗</span>
            </a>
            <a
              href="halberd-demo.html"
              className="bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-700/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>HALBERD ↗</span>
            </a>
            <a
              href="index.html"
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>MT-Lab Home</span>
            </a>
            <a
              href="https://github.com/Mthompson6782/MT-Lab/tree/main/slice-ot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Source &amp; Docs ↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* Scenario Presets Strip */}
      <section className="border-b border-slate-800/80 bg-slate-900/40 px-4 sm:px-6 py-3 no-print">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reference OT Threat Scenarios (Click to Explore SLiCE Mechanics)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {SCENARIO_PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/45 shadow-md shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 leading-snug">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {preset.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scenario & Scoring Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Scenario Framing */}
          <section className="glass-panel rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/70">
                  SCOPE
                </span>
                <h2 className="text-base font-bold text-slate-100">
                  Defined Threat Scenario (ICD 203 Alternative Analysis)
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={scenario.title}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setScenario({ ...scenario, title: e.target.value });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  Target Asset &amp; Purdue Zone
                </label>
                <input
                  type="text"
                  value={scenario.assetZone}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setScenario({ ...scenario, assetZone: e.target.value });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  Adversary Access &amp; Attack Path
                </label>
                <input
                  type="text"
                  value={scenario.attackPath}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setScenario({ ...scenario, attackPath: e.target.value });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1">
                  Physical Consequence Chain
                </label>
                <input
                  type="text"
                  value={scenario.consequenceChain}
                  onChange={(e) => {
                    setActivePresetId('custom');
                    setScenario({ ...scenario, consequenceChain: e.target.value });
                  }}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-slate-100 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Step 1: Likelihood */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase">
                  Step 1
                </span>
                <h2 className="text-lg font-bold text-white">
                  Likelihood Assessment (12-Month Window)
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                L = 0.40A + 0.35E + 0.25H
              </span>
            </div>

            <ScoreInput
              label="Factor A · Accessibility"
              weightLabel="Weight 40%"
              description="How reachable is the target asset from the adversary’s starting position?"
              value={lInputs.accessibility}
              onChange={(v) => {
                setActivePresetId('custom');
                setLInputs({ ...lInputs, accessibility: v as LikelihoodScore });
              }}
              options={[
                {
                  value: 5,
                  label: 'Directly Exposed',
                  description: 'Public IP, internet-facing, or weak default external auth',
                },
                {
                  value: 4,
                  label: 'Low Effort',
                  description: 'Single permissive boundary or limited-auth VPN/remote access',
                },
                {
                  value: 3,
                  label: 'Moderate Effort',
                  description: 'Monitored multi-boundary path (DMZ + deny-by-default FW)',
                },
                {
                  value: 2,
                  label: 'Difficult',
                  description: 'IEC 62443 zones/conduits requiring multi-layer compromise',
                },
                {
                  value: 1,
                  label: 'Effectively Isolated',
                  description: 'Verified air-gap, controlled physical access & USB lock',
                },
              ]}
              icon={Lock}
            />

            <ScoreInput
              label="Factor E · Exploit Complexity"
              weightLabel="Weight 35%"
              description="Technical difficulty once access is obtained (score simplest viable path to consequence)."
              value={lInputs.exploitComplexity}
              onChange={(v) => {
                setActivePresetId('custom');
                setLInputs({ ...lInputs, exploitComplexity: v as LikelihoodScore });
              }}
              options={[
                {
                  value: 5,
                  label: 'Trivial',
                  description: 'Public exploits, no auth, standard IT tools, zero OT skill',
                },
                {
                  value: 4,
                  label: 'Low',
                  description: 'Minor tool adaptation; public OT protocol tooling exists',
                },
                {
                  value: 3,
                  label: 'Moderate',
                  description: 'Custom tooling & process logic comprehension needed',
                },
                {
                  value: 2,
                  label: 'High',
                  description: 'Deep OT expertise; proprietary undocumented interfaces',
                },
                {
                  value: 1,
                  label: 'Extreme',
                  description: 'Nation-state zero-day firmware / multi-month preparation',
                },
              ]}
              icon={Activity}
            />

            <ScoreInput
              label="Factor H · Historical Frequency"
              weightLabel="Weight 25%"
              description="Observed frequency of similar attacks (H <= 2 caps overall Confidence at Moderate)."
              value={lInputs.historicalFrequency}
              onChange={(v) => {
                setActivePresetId('custom');
                setLInputs({ ...lInputs, historicalFrequency: v as LikelihoodScore });
              }}
              options={[
                {
                  value: 5,
                  label: 'Frequent',
                  description: 'Multiple confirmed incidents in sector/class (<12 mo)',
                },
                {
                  value: 4,
                  label: 'Recurring',
                  description: 'Confirmed incidents (<24 mo) in sector or adjacent',
                },
                {
                  value: 3,
                  label: 'Occasional',
                  description: 'Confirmed within 36 mo or conference PoC exploit',
                },
                {
                  value: 2,
                  label: 'Rare',
                  description: 'Theoretical / academic only; no wild exploitation',
                },
                {
                  value: 1,
                  label: 'Unprecedented',
                  description: 'No known research, disclosure, or attack activity',
                },
              ]}
              icon={History}
            />
          </section>

          {/* Step 2: Confidence */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase">
                  Step 2
                </span>
                <h2 className="text-lg font-bold text-white">
                  Analytic Confidence Rating (Evidentiary Foundation)
                </h2>
              </div>
              <span className="font-mono text-xs text-slate-400">
                ICD 203 ATS 4 · Independent Axis
              </span>
            </div>

            <ConfidenceInput
              code="C1"
              label="Control Validation Recency"
              description="How recently controls protecting this asset were independently tested in OT."
              value={cInputs.controlValidation}
              onChange={(v) => {
                setActivePresetId('custom');
                setCInputs({ ...cInputs, controlValidation: v });
              }}
              criteria={{
                high: 'Independent OT pentest / architecture audit < 12 months covering this scenario.',
                moderate: 'Validated 12–24 months ago, or prior validation had limited OT scope.',
                low: 'No independent OT-specific validation within 24+ months.',
              }}
            />

            <ConfidenceInput
              code="C2"
              label="Asset Inventory Completeness"
              description="Accuracy of asset, firmware, protocol, and connectivity visibility."
              value={cInputs.assetInventory}
              onChange={(v) => {
                setActivePresetId('custom');
                setCInputs({ ...cInputs, assetInventory: v });
              }}
              criteria={{
                high: '>= 90% OT assets w/ firmware, network addresses & protocols verified < 6 mo.',
                moderate: '60–89% coverage, or inventory lacks firmware and protocol granularity.',
                low: '< 60% coverage or major segments of the OT environment undocumented.',
              }}
            />

            <ConfidenceInput
              code="C3"
              label="Network Telemetry Coverage"
              description="Ability to detect adversary activity across Purdue levels."
              value={cInputs.networkTelemetry}
              onChange={(v) => {
                setActivePresetId('custom');
                setCInputs({ ...cInputs, networkTelemetry: v });
              }}
              criteria={{
                high: 'Full OT IDS across all Purdue levels w/ ICS protocol rules & triage.',
                moderate: 'Perimeter and primary conduits monitored; gaps at lower Purdue levels.',
                low: 'Minimal or no OT-specific passive network monitoring.',
              }}
            />

            <ConfidenceInput
              code="C4"
              label="Analytic Corroboration"
              description="Number and independence of converging evidence sources."
              value={cInputs.analyticCorroboration}
              onChange={(v) => {
                setActivePresetId('custom');
                setCInputs({ ...cInputs, analyticCorroboration: v });
              }}
              overrideWarning="Low triggers Single-Source Override"
              criteria={{
                high: '3+ independent evidence sources converging on the same score.',
                moderate: '2 independent sources, or 1 recent scoped OT penetration test.',
                low: 'Single source, assessor judgment alone, or unverified vendor claims.',
              }}
            />
          </section>

          {/* Step 3: Bias Catalog & Impact */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs px-2.5 py-0.5 rounded uppercase">
                  Step 3
                </span>
                <h2 className="text-lg font-bold text-white">
                  OT Analytic Bias Review &amp; Physical Impact
                </h2>
              </div>
            </div>

            <BiasChecklist
              checkedBiases={biases}
              onChange={(next) => {
                setActivePresetId('custom');
                setBiases(next);
              }}
            />

            <ImpactInput
              safety={iInputs.safety}
              environmental={iInputs.environmental}
              operational={iInputs.operational}
              onChange={(cat, val) => {
                setActivePresetId('custom');
                setIInputs({ ...iInputs, [cat]: val });
              }}
            />
          </section>
        </div>

        {/* Right Column: Decision Matrix & Output */}
        <div className="lg:col-span-5 space-y-4">
          <ResultCard
            result={result}
            biasesChecked={biases.length}
            onExportJson={handleExportJson}
            onExportMarkdown={handleExportMarkdown}
          />
          <DecisionMatrix
            likelihoodTier={result.likelihoodTier}
            confidenceRating={result.confidenceRating}
            activeAction={result.action}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
