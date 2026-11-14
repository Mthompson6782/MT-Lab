import { ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import type { ConfidenceLevel } from '../lib/sliceLogic';

interface ConfidenceInputProps {
  label: string;
  code: string;
  description: string;
  value: ConfidenceLevel;
  onChange: (value: ConfidenceLevel) => void;
  overrideWarning?: string;
  criteria: {
    low: string;
    moderate: string;
    high: string;
  };
}

export function ConfidenceInput({
  label,
  code,
  description,
  value,
  onChange,
  overrideWarning,
  criteria,
}: ConfidenceInputProps) {
  const options: {
    value: ConfidenceLevel;
    label: string;
    icon: typeof ShieldCheck;
    iconColor: string;
    activeClass: string;
  }[] = [
    {
      value: 'Low',
      label: 'Low',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      activeClass: 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500/40',
    },
    {
      value: 'Moderate',
      label: 'Moderate',
      icon: HelpCircle,
      iconColor: 'text-amber-400',
      activeClass: 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/40',
    },
    {
      value: 'High',
      label: 'High',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      activeClass: 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/40',
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/70">
            {code}
          </span>
          <h3 className="text-base font-bold text-slate-100">{label}</h3>
        </div>
        {overrideWarning && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60">
            {overrideWarning}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs mb-4">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-start p-3.5 rounded-lg border transition-all text-left ${
                isSelected
                  ? option.activeClass
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${option.iconColor}`} />
                <span className="font-bold text-sm text-slate-100">{option.label}</span>
              </div>
              <span className="text-xs text-slate-400 leading-snug">
                {criteria[option.value.toLowerCase() as 'low' | 'moderate' | 'high']}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
