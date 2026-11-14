import type { LucideIcon } from 'lucide-react';

interface ScoreOption {
  value: number;
  label: string;
  description: string;
}

interface ScoreInputProps {
  label: string;
  weightLabel: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  options: ScoreOption[];
  icon?: LucideIcon;
}

export function ScoreInput({
  label,
  weightLabel,
  description,
  value,
  onChange,
  options,
  icon: Icon,
}: ScoreInputProps) {
  return (
    <div className="glass-panel rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="text-base font-bold text-slate-100">{label}</h3>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
          {weightLabel}
        </span>
      </div>
      <p className="text-slate-400 text-xs mb-4">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                selected
                  ? 'border-cyan-400 bg-cyan-950/50 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`font-mono font-extrabold text-base ${
                    selected ? 'text-cyan-300' : 'text-slate-400'
                  }`}
                >
                  {option.value}
                </span>
                {selected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </div>
              <span className="font-semibold text-xs text-slate-100 mb-1">
                {option.label}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
