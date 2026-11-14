import { CheckSquare, Square, CheckCheck, RotateCcw } from 'lucide-react';
import { ALL_BIAS_IDS, BIAS_CATALOG } from '../lib/sliceLogic';

interface BiasChecklistProps {
  checkedBiases: string[];
  onChange: (biases: string[]) => void;
}

export function BiasChecklist({ checkedBiases, onChange }: BiasChecklistProps) {
  const toggleBias = (id: string) => {
    if (checkedBiases.includes(id)) {
      onChange(checkedBiases.filter((b) => b !== id));
    } else {
      onChange([...checkedBiases, id]);
    }
  };

  const allChecked = checkedBiases.length === ALL_BIAS_IDS.length;

  return (
    <div className="glass-panel rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            OT Analytic Bias Catalog (ICD 203 ATS 7)
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Mandatory 10-point cognitive bias review. Confidence cannot exceed Moderate until all 10 biases and enforcement rules are evaluated.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              allChecked
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/70'
                : 'bg-amber-950/70 text-amber-300 border-amber-700/70'
            }`}
          >
            {checkedBiases.length} / {BIAS_CATALOG.length} Evaluated
          </span>

          <button
            type="button"
            onClick={() => onChange(allChecked ? [] : [...ALL_BIAS_IDS])}
            className="text-xs font-mono px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {allChecked ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </>
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify All</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
        {BIAS_CATALOG.map((bias) => {
          const checked = checkedBiases.includes(bias.id);
          return (
            <button
              key={bias.id}
              type="button"
              onClick={() => toggleBias(bias.id)}
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                checked
                  ? 'border-emerald-600/60 bg-emerald-950/25'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-500">
                    #{bias.number.toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-xs text-slate-100">
                    {bias.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {bias.effect}
                </p>
                <p className="text-[10px] font-mono text-cyan-300/90 mt-1 leading-snug">
                  Rule: {bias.enforcementRule}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
