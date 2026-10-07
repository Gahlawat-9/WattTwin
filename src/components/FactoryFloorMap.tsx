import React from 'react';
import { ArrowRight, Cpu, Flame, Gauge, Settings, Zap } from 'lucide-react';
import { EquipmentStatusRow, OpportunityItem, ThemeMode } from '../data/factoryData';

interface FactoryFloorMapProps {
  equipmentList: EquipmentStatusRow[];
  opportunities: OpportunityItem[];
  theme: ThemeMode;
  onSelectOpportunity: (opp: OpportunityItem) => void;
  onViewAllMachines: () => void;
}

export const FactoryFloorMap: React.FC<FactoryFloorMapProps> = ({
  equipmentList,
  opportunities,
  theme,
  onSelectOpportunity,
  onViewAllMachines,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isDark
          ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Factory Energy Schematic Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Shop-floor bay consumption, specific energy deviation, and active anomaly locations
          </p>
        </div>
        <button
          type="button"
          onClick={onViewAllMachines}
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
        >
          <span>Machine table</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Shop-Floor Grid Schematic */}
      <div
        className={`p-3 rounded-xl border ${
          isDark ? 'bg-[#070e17] border-slate-800/90' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {equipmentList.slice(0, 6).map((eq) => {
            const isAlert = eq.status === 'Alert';
            const isWarn = eq.status === 'Warning';
            const matchingOpp =
              opportunities.find((o) =>
                o.machine.toLowerCase().includes(eq.name.split(' ')[0].toLowerCase())
              ) || opportunities[0];

            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => {
                  if (isAlert || isWarn) {
                    onSelectOpportunity(matchingOpp);
                  } else {
                    onViewAllMachines();
                  }
                }}
                className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                  isAlert
                    ? isDark
                      ? 'bg-rose-500/10 border-rose-500/45 hover:border-rose-400'
                      : 'bg-rose-50/80 border-rose-300 hover:border-rose-400'
                    : isWarn
                    ? isDark
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                      : 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                    : isDark
                    ? 'bg-[#0b1522] border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>{eq.zoneCode} · {eq.process}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAlert
                        ? 'bg-rose-500 animate-pulse'
                        : isWarn
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <div className="text-xs font-semibold truncate">{eq.name}</div>

                <div className="mt-2 flex items-baseline justify-between font-mono text-[11px] tabular-nums">
                  <span className="text-slate-400">{eq.powerKw} kW</span>
                  <span
                    className={`font-semibold ${
                      eq.deviationPercent > 5
                        ? 'text-rose-400'
                        : eq.deviationPercent < 0
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {eq.deviationPercent > 0 ? `+${eq.deviationPercent}%` : `${eq.deviationPercent}%`} SEC
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Anomaly — Click to investigate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Within expected baseline
            </span>
          </div>
          <span className="font-mono">Schematic layout · Demo floor</span>
        </div>
      </div>
    </div>
  );
};
