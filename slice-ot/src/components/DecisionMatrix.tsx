import type { ConfidenceLevel, LikelihoodTier, SliceAction } from '../lib/sliceLogic';

interface DecisionMatrixProps {
  likelihoodTier: LikelihoodTier;
  confidenceRating: ConfidenceLevel;
  activeAction: SliceAction;
}

const MATRIX_ROWS: Array<{
  key: 'high' | 'moderate' | 'low';
  label: string;
  sub: string;
  matches: (tier: LikelihoodTier) => boolean;
  cells: Record<ConfidenceLevel, SliceAction>;
}> = [
  {
    key: 'high',
    label: 'L4–L5',
    sub: 'High Likelihood',
    matches: (t) => t === 'L4' || t === 'L5',
    cells: { High: 'MITIGATE', Moderate: 'INVESTIGATE', Low: 'CHARACTERIZE' },
  },
  {
    key: 'moderate',
    label: 'L3',
    sub: 'Even Chance',
    matches: (t) => t === 'L3',
    cells: { High: 'MONITOR', Moderate: 'ASSESS', Low: 'INVESTIGATE' },
  },
  {
    key: 'low',
    label: 'L1–L2',
    sub: 'Low Likelihood',
    matches: (t) => t === 'L1' || t === 'L2',
    cells: { High: 'ACCEPT', Moderate: 'MONITOR', Low: 'CHARACTERIZE' },
  },
];

const CONF_COLS: ConfidenceLevel[] = ['High', 'Moderate', 'Low'];

const CELL_STYLES: Record<SliceAction, { idle: string; active: string }> = {
  MITIGATE: {
    idle: 'border-rose-900/60 bg-rose-950/20 text-rose-300/70',
    active: 'border-rose-400 bg-rose-600 text-white shadow-lg shadow-rose-500/30 ring-2 ring-rose-300',
  },
  INVESTIGATE: {
    idle: 'border-orange-900/60 bg-orange-950/20 text-orange-300/70',
    active: 'border-orange-300 bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/30 ring-2 ring-orange-200',
  },
  CHARACTERIZE: {
    idle: 'border-amber-900/60 bg-amber-950/20 text-amber-300/70',
    active: 'border-amber-300 bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-amber-200',
  },
  ASSESS: {
    idle: 'border-violet-900/60 bg-violet-950/20 text-violet-300/70',
    active: 'border-violet-300 bg-violet-600 text-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-300',
  },
  MONITOR: {
    idle: 'border-sky-900/60 bg-sky-950/20 text-sky-300/70',
    active: 'border-sky-300 bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/30 ring-2 ring-sky-200',
  },
  ACCEPT: {
    idle: 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300/70',
    active: 'border-emerald-300 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-200',
  },
};

export function DecisionMatrix({
  likelihoodTier,
  confidenceRating,
  activeAction,
}: DecisionMatrixProps) {
  const isBottomRightParadox =
    (likelihoodTier === 'L1' || likelihoodTier === 'L2') && confidenceRating === 'Low';

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
            SLiCE 3×3 Decision Matrix (Likelihood × Confidence)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active response:{' '}
            <span className="font-mono font-bold text-cyan-300">{activeAction}</span>
          </p>
        </div>
        {isBottomRightParadox && (
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/15 border border-amber-400/50 text-amber-300">
            Bottom-Right Paradox Active
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-4 gap-2 mb-2 text-center font-mono text-[11px] uppercase tracking-wider text-slate-400">
            <div />
            {CONF_COLS.map((col) => (
              <div
                key={col}
                className={`py-1 rounded ${
                  confidenceRating === col ? 'text-cyan-300 font-bold bg-cyan-950/50' : ''
                }`}
              >
                C-{col}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {MATRIX_ROWS.map((row) => {
              const rowActive = row.matches(likelihoodTier);
              return (
                <div key={row.key} className="grid grid-cols-4 gap-2 items-stretch">
                  <div
                    className={`flex flex-col justify-center px-2.5 py-2 rounded-lg border font-mono ${
                      rowActive
                        ? 'border-cyan-500/60 bg-cyan-950/40 text-cyan-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold">{row.label}</span>
                    <span className="text-[10px] opacity-80">{row.sub}</span>
                  </div>

                  {CONF_COLS.map((col) => {
                    const cellAction = row.cells[col];
                    const isCellActive = rowActive && confidenceRating === col;
                    const style = isCellActive
                      ? CELL_STYLES[cellAction].active
                      : CELL_STYLES[cellAction].idle;
                    const isParadoxCell = row.key === 'low' && col === 'Low';

                    return (
                      <div
                        key={col}
                        className={`rounded-lg border px-2 py-2.5 flex flex-col items-center justify-center text-center transition-all ${style}`}
                      >
                        <span className="font-mono font-extrabold text-[11px] tracking-wide">
                          {cellAction}
                        </span>
                        {isParadoxCell && (
                          <span
                            className={`text-[9px] mt-0.5 font-mono ${
                              isCellActive ? 'text-slate-900 font-bold' : 'text-amber-400/80'
                            }`}
                          >
                            Don&apos;t know ≠ safe
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
