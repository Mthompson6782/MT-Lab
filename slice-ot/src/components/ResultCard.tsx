import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileText,
  Info,
  ShieldAlert,
} from 'lucide-react';
import {
  ACTION_DETAILS,
  type ConfidenceLevel,
  type SliceAction,
  type SliceResult,
} from '../lib/sliceLogic';

interface ResultCardProps {
  result: SliceResult;
  biasesChecked: number;
  onExportJson: () => void;
  onExportMarkdown: () => void;
}

const ACTION_HERO_STYLE: Record<SliceAction, string> = {
  MITIGATE: 'from-rose-600 via-red-600 to-rose-700 text-white border-rose-400/50',
  INVESTIGATE:
    'from-orange-500 via-amber-500 to-orange-600 text-slate-950 border-orange-300/60',
  CHARACTERIZE:
    'from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-yellow-200/70',
  ASSESS: 'from-violet-600 via-purple-600 to-indigo-700 text-white border-violet-400/50',
  MONITOR: 'from-sky-500 via-cyan-500 to-blue-600 text-slate-950 border-sky-300/60',
  ACCEPT:
    'from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 border-emerald-300/60',
};

function confidenceTextColor(rating: ConfidenceLevel) {
  switch (rating) {
    case 'High':
      return 'text-emerald-400';
    case 'Moderate':
      return 'text-amber-400';
    case 'Low':
      return 'text-rose-400';
  }
}

export function ResultCard({
  result,
  biasesChecked,
  onExportJson,
  onExportMarkdown,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const details = ACTION_DETAILS[result.action];
  const heroStyle = ACTION_HERO_STYLE[result.action];

  const handleCopyTriplet = async () => {
    try {
      await navigator.clipboard.writeText(`${result.triplet} -> ${result.action}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable in non-secure context
    }
  };

  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-700/80">
        {/* Hero Action Banner */}
        <div className={`p-5 bg-gradient-to-br ${heroStyle} border-b`}>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest opacity-85 mb-1">
            <span>Recommended Action</span>
            <span>ICD 203 Paired Output</span>
          </div>
          <div className="text-3xl font-black tracking-tight font-mono">
            {result.action}
          </div>
          <div className="text-sm font-bold mt-1">{details.title}</div>
          <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{details.summary}</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Paired Triplet Banner */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                SLiCE Risk Expression (Never Collapsed)
              </div>
              <div className="font-mono font-bold text-sm text-cyan-300 mt-0.5">
                {result.triplet}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyTriplet}
              title="Copy SLiCE risk expression"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* 3 Axis KPI Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                Likelihood
              </div>
              <div className="text-xl font-black font-mono text-white">
                {result.likelihoodTier}
              </div>
              <div className="text-[11px] font-mono text-cyan-300">
                {result.likelihoodScore.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {result.likelihoodLabel}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                Confidence
              </div>
              <div
                className={`text-lg font-black font-mono ${confidenceTextColor(
                  result.confidenceRating
                )}`}
              >
                {result.confidenceRating}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Base: {result.baseConfidenceRating}
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                Biases {biasesChecked}/10
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                Impact
              </div>
              <div className="text-xl font-black font-mono text-white">
                {result.impactTier}
              </div>
              <div className="text-[11px] text-amber-300 mt-0.5">
                {result.impactLabel}
              </div>
            </div>
          </div>

          {/* Mandate */}
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="font-mono font-bold text-cyan-400 uppercase block mb-1">
              Operational Mandate
            </span>
            {details.mandate}
          </div>

          {/* Active Overrides / Rules */}
          {result.appliedRules.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confidence Overrides & Caps Active</span>
              </div>
              {result.appliedRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-2.5 rounded-lg bg-rose-950/35 border border-rose-700/50 text-xs"
                >
                  <div className="font-semibold text-rose-200">{rule.title}</div>
                  <div className="text-[11px] text-rose-200/80 mt-0.5 leading-snug">
                    {rule.detail}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Guardrail Advisories */}
          {result.advisories.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Bias & Modeling Guardrails</span>
              </div>
              {result.advisories.map((adv) => (
                <div
                  key={adv.id}
                  className={`p-2.5 rounded-lg border text-xs ${
                    adv.severity === 'warn'
                      ? 'bg-amber-950/30 border-amber-700/50 text-amber-100'
                      : 'bg-cyan-950/30 border-cyan-800/50 text-cyan-100'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {adv.severity === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400" />}
                    <span>{adv.title}</span>
                  </div>
                  <div className="text-[11px] opacity-85 mt-0.5 leading-snug">
                    {adv.detail}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 no-print">
            <button
              type="button"
              onClick={onExportMarkdown}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-100 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .MD</span>
            </button>
            <button
              type="button"
              onClick={onExportJson}
              className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-xs font-mono font-semibold text-cyan-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
