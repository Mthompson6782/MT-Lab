import { Activity, Globe, AlertCircle } from 'lucide-react';
import type { ImpactScore } from '../lib/sliceLogic';

interface ImpactInputProps {
  safety: ImpactScore;
  environmental: ImpactScore;
  operational: ImpactScore;
  onChange: (category: 'safety' | 'environmental' | 'operational', value: ImpactScore) => void;
}

const IMPACT_ROWS: Array<{
  val: ImpactScore;
  tier: string;
  label: string;
  safety: string;
  environmental: string;
  operational: string;
}> = [
  {
    val: 5,
    tier: 'I5',
    label: 'Catastrophic',
    safety: 'Loss of life or permanent disabling injury',
    environmental: 'Irreversible damage; federal regulatory response',
    operational: 'Facility shutdown weeks–months; loss of operating authority',
  },
  {
    val: 4,
    tier: 'I4',
    label: 'Severe',
    safety: 'Serious injury requiring hospitalization',
    environmental: 'Significant release requiring notification & remediation',
    operational: 'Extended outage (days–weeks); major equipment damage',
  },
  {
    val: 3,
    tier: 'I3',
    label: 'Significant',
    safety: 'Minor injuries; first-aid level',
    environmental: 'Contained release; self-reportable',
    operational: 'Partial production loss (hours–days)',
  },
  {
    val: 2,
    tier: 'I2',
    label: 'Minor',
    safety: 'No injuries',
    environmental: 'No release',
    operational: 'Brief process upset; recovered within shift',
  },
  {
    val: 1,
    tier: 'I1',
    label: 'Negligible',
    safety: 'No safety impact',
    environmental: 'No environmental impact',
    operational: 'No operational impact',
  },
];

export function ImpactInput({
  safety,
  environmental,
  operational,
  onChange,
}: ImpactInputProps) {
  const categories = [
    { id: 'safety', label: 'Safety', icon: Activity, value: safety, color: 'text-rose-400' },
    {
      id: 'environmental',
      label: 'Environmental',
      icon: Globe,
      value: environmental,
      color: 'text-emerald-400',
    },
    {
      id: 'operational',
      label: 'Operational',
      icon: AlertCircle,
      value: operational,
      color: 'text-cyan-400',
    },
  ] as const;

  const governingScore = Math.max(safety, environmental, operational);

  return (
    <div className="glass-panel rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="text-base font-bold text-slate-100">
          Physical Consequence & Impact Correlation
        </h3>
        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
          Governing Impact: <strong className="text-amber-400">I{governingScore}</strong> (Worst-Case)
        </span>
      </div>
      <p className="text-slate-400 text-xs mb-5">
        Score the worst plausible physical outcome in each category under degraded operator response. The highest single category governs overall Impact (I).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="font-semibold text-sm text-slate-200">{cat.label}</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-400">I{cat.value}</span>
              </div>

              <div className="space-y-1.5">
                {IMPACT_ROWS.map((row) => {
                  const selected = cat.value === row.val;
                  return (
                    <button
                      key={row.val}
                      type="button"
                      onClick={() => onChange(cat.id, row.val)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        selected
                          ? 'border-cyan-400 bg-cyan-950/45 ring-1 ring-cyan-400/40'
                          : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono font-bold text-xs ${
                            selected ? 'text-cyan-300' : 'text-slate-200'
                          }`}
                        >
                          {row.tier} · {row.label}
                        </span>
                        {row.val >= 3 && (
                          <span className="text-[10px] font-mono text-amber-400/80">
                            Cascade
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {row[cat.id]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
