import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Download,
  FileSpreadsheet,
  Flame,
  Gauge,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  Upload,
  Zap,
} from 'lucide-react';
import {
  EquipmentStatusRow,
  FactoryProfile,
  OpportunityItem,
  ProductionBatchRecord,
  RecommendationItem,
  ThemeMode,
} from '../data/factoryData';

/* -------------------------------------------------------------------------- */
/* 1. MACHINES & PROCESS EQUIPMENT VIEW                                       */
/* -------------------------------------------------------------------------- */
export const MachinesView: React.FC<{
  factory: FactoryProfile;
  theme: ThemeMode;
  onSelectOpportunity: (opp: OpportunityItem) => void;
}> = ({ factory, theme, onSelectOpportunity }) => {
  const [processFilter, setProcessFilter] = useState<string>('All');
  const [selectedEq, setSelectedEq] = useState<EquipmentStatusRow>(factory.equipmentList[0]);
  const isDark = theme === 'dark';

  const processes = ['All', 'Welding', 'Pressing', 'Drilling', 'Painting', 'Compression', 'Assembly', 'Thermal', 'Machining'];
  const filtered =
    processFilter === 'All'
      ? factory.equipmentList
      : factory.equipmentList.filter((e) => e.process === processFilter);

  const cardClass = isDark
    ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  return (
    <div className="space-y-5">
      {/* Header & Process Filter Bar */}
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Machines & Manufacturing Processes
            </h2>
           
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {processes.map((proc) => (
              <button
                key={proc}
                type="button"
                onClick={() => setProcessFilter(proc)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  processFilter === proc
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : isDark
                    ? 'bg-[#0f1d2e] text-slate-300 hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {proc}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Equipment Table */}
        <div className={`lg:col-span-8 rounded-xl border p-4 ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-xs font-medium ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <th className="py-2.5 px-3">Equipment</th>
                  <th className="py-2.5 px-3">Process</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Load</th>
                  <th className="py-2.5 px-3 text-right">Expected SEC</th>
                  <th className="py-2.5 px-3 text-right">Actual SEC</th>
                  <th className="py-2.5 px-3 text-right">Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {filtered.map((eq) => {
                  const isSel = selectedEq.id === eq.id;
                  return (
                    <tr
                      key={eq.id}
                      onClick={() => setSelectedEq(eq)}
                      className={`cursor-pointer transition-colors ${
                        isSel
                          ? isDark
                            ? 'bg-emerald-500/10'
                            : 'bg-sky-50/90'
                          : isDark
                          ? 'hover:bg-slate-800/40'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 font-medium">{eq.name}</td>
                      <td className="py-3 px-3 text-slate-400">{eq.process}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${
                            eq.status === 'Alert'
                              ? 'text-rose-400'
                              : eq.status === 'Warning'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              eq.status === 'Alert'
                                ? 'bg-rose-500'
                                : eq.status === 'Warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums">{eq.loadPercent}%</td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-400">
                        {eq.expectedKwhPerUnit.toFixed(2)} kWh/u
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                        {eq.actualKwhPerUnit.toFixed(2)} kWh/u
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-mono tabular-nums font-semibold ${
                          eq.deviationPercent > 5
                            ? 'text-rose-400'
                            : eq.deviationPercent < 0
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {eq.deviationPercent > 0 ? `+${eq.deviationPercent}%` : `${eq.deviationPercent}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Machine Inspector */}
        <div className={`lg:col-span-4 rounded-xl border p-4 flex flex-col justify-between ${cardClass}`}>
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
              <div>
                <span className="text-xs text-emerald-400 font-medium">{selectedEq.process} Process</span>
                <h3 className="text-base font-semibold mt-0.5">{selectedEq.name}</h3>
              </div>
              <span className="font-mono text-xs text-slate-400">{selectedEq.shift}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`rounded-lg p-3 border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs text-slate-400">Active Power Draw</div>
                <div className="text-lg font-bold font-mono tabular-nums mt-0.5">{selectedEq.powerKw} kW</div>
              </div>
              <div className={`rounded-lg p-3 border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs text-slate-400">Units Logged Today</div>
                <div className="text-lg font-bold font-mono tabular-nums mt-0.5">{selectedEq.unitsToday} units</div>
              </div>
              <div className={`rounded-lg p-3 border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs text-slate-400">Expected Baseline</div>
                <div className="text-base font-semibold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {selectedEq.expectedKwhPerUnit} kWh/unit
                </div>
              </div>
              <div className={`rounded-lg p-3 border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs text-slate-400">Actual Intensity</div>
                <div
                  className={`text-base font-semibold font-mono tabular-nums mt-0.5 ${
                    selectedEq.deviationPercent > 5 ? 'text-rose-400' : 'text-sky-400'
                  }`}
                >
                  {selectedEq.actualKwhPerUnit} kWh/unit
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Assigned Operator:</span>
                <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{selectedEq.operator}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Temperature:</span>
                <span className="font-mono tabular-nums">{selectedEq.temperatureC ?? 45}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Baseline Formula:</span>
                <span className="font-mono">E = Base + (Units × {selectedEq.expectedKwhPerUnit})</span>
              </div>
            </div>
          </div>

          {selectedEq.deviationPercent > 5 && factory.opportunities[0] && (
            <button
              type="button"
              onClick={() => onSelectOpportunity(factory.opportunities[0])}
              className="mt-4 w-full py-2 px-4 rounded-lg bg-rose-500/15 border border-rose-500/35 text-rose-300 hover:bg-rose-500/25 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Investigate +{selectedEq.deviationPercent}% Baseline Deviation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. ENERGY TWIN (DIGITAL TWIN OF PRODUCTION vs EXPECTED ENERGY)              */
/* -------------------------------------------------------------------------- */
export const EnergyTwinView: React.FC<{
  factory: FactoryProfile;
  theme: ThemeMode;
  onNavigateSimulator: () => void;
}> = ({ factory, theme, onNavigateSimulator }) => {
  const [selectedShift, setSelectedShift] = useState<'Shift A' | 'Shift B' | 'Shift C'>('Shift A');
  const [batchScale, setBatchScale] = useState<number>(100);
  const isDark = theme === 'dark';

  const cardClass = isDark
    ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const processes = [
    { name: 'Welding Bay (Spot & MIG)', secBase: 0.28, secActual: 0.28, baseLoadKw: 3.2, units: Math.round(240 * (batchScale / 100)), status: 'Optimal' },
    { name: 'Hydraulic Pressing Line', secBase: 0.34, secActual: 0.33, baseLoadKw: 5.5, units: Math.round(290 * (batchScale / 100)), status: 'Optimal' },
    { name: 'CNC Drilling & Milling', secBase: 0.42, secActual: 0.52, baseLoadKw: 4.0, units: Math.round(162 * (batchScale / 100)), status: '+24% Drift' },
    { name: 'Furnace & Heat Treatment', secBase: 0.64, secActual: 0.71, baseLoadKw: 18.0, units: Math.round(310 * (batchScale / 100)), status: '+11% Drift' },
    { name: 'Pneumatic Compression (C1/C2)', secBase: 0.23, secActual: 0.31, baseLoadKw: 14.5, units: Math.round(600 * (batchScale / 100)), status: '42m Idle' },
    { name: 'Paint Booth & Curing', secBase: 0.19, secActual: 0.18, baseLoadKw: 6.0, units: Math.round(300 * (batchScale / 100)), status: 'Optimal' },
    { name: 'Assembly & EOL Testing', secBase: 0.14, secActual: 0.14, baseLoadKw: 2.4, units: Math.round(600 * (batchScale / 100)), status: 'Optimal' },
  ];

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Production-Aware Energy Twin · {factory.shortName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production-aware model linking Output Quantity, Product SKU, Shift, and Machine Base-Load to compute Expected vs Actual Energy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1 text-xs">
              {(['Shift A', 'Shift B', 'Shift C'] as const).map((sh) => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setSelectedShift(sh)}
                  className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    selectedShift === sh
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sh}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onNavigateSimulator}
              className="px-3.5 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Open What-If Simulator</span>
            </button>
          </div>
        </div>

        {/* Interactive Production Volume Slider */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Twin Production Volume Scaling:</span>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={batchScale}
              onChange={(e) => setBatchScale(Number(e.target.value))}
              className="w-44 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono font-semibold text-emerald-400">{batchScale}% of Planned Shift Output</span>
          </div>
          <div className="font-mono text-slate-400">
            Baseline Model: <span className="text-slate-200">E_expected = E_standby + Σ (Units_i × SEC_baseline_i)</span>
          </div>
        </div>
      </div>

      {/* 7 Manufacturing Process Twin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {processes.map((proc) => {
          const expectedKwh = Math.round(proc.baseLoadKw * 4 + proc.units * proc.secBase);
          const actualKwh = Math.round(proc.baseLoadKw * 4 + proc.units * proc.secActual);
          const deltaKwh = actualKwh - expectedKwh;
          const isDrift = deltaKwh > 5;
          return (
            <div
              key={proc.name}
              className={`rounded-xl border p-4 transition-all ${cardClass} ${
                isDrift ? 'border-amber-500/40' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{proc.name}</h3>
                <span
                  className={`text-xs font-mono font-medium ${
                    isDrift ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {proc.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-[11px] text-slate-400">Output</div>
                  <div className="font-mono font-semibold mt-0.5">{proc.units} u</div>
                </div>
                <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-[11px] text-slate-400">Expected</div>
                  <div className="font-mono font-semibold text-emerald-400 mt-0.5">{expectedKwh} kWh</div>
                </div>
                <div className={`p-2 rounded-lg border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-[11px] text-slate-400">Actual</div>
                  <div className={`font-mono font-semibold mt-0.5 ${isDrift ? 'text-rose-400' : 'text-sky-400'}`}>
                    {actualKwh} kWh
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/50 font-mono">
                <span>Base: {proc.secBase} kWh/u</span>
                <span>·</span>
                <span>Actual: {proc.secActual} kWh/u</span>
                <span>·</span>
                <span className={deltaKwh > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {deltaKwh > 0 ? `+${deltaKwh} kWh excess` : `${deltaKwh} kWh saved`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. WHAT-IF SIMULATOR VIEW                                                  */
/* -------------------------------------------------------------------------- */
export const SimulatorView: React.FC<{
  factory: FactoryProfile;
  theme: ThemeMode;
}> = ({ factory, theme }) => {
  const [idleCutoffMin, setIdleCutoffMin] = useState<number>(8);
  const [furnaceTempC, setFurnaceTempC] = useState<number>(815);
  const [shiftedUnits, setShiftedUnits] = useState<number>(100);
  const [syncSchedule, setSyncSchedule] = useState<boolean>(true);
  const [appliedScenario, setAppliedScenario] = useState<boolean>(false);

  const isDark = theme === 'dark';
  const cardClass = isDark
    ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  // Compute simulated savings dynamically
  const compressorSavingKwhDay = Math.round(((42 - idleCutoffMin) / 42) * 18.5);
  const furnaceSavingKwhDay = Math.round(((845 - furnaceTempC) / 30) * 14.2);
  const lineShiftSavingKwhDay = Math.round((shiftedUnits / 100) * 84);
  const syncSavingKwhDay = syncSchedule ? 46 : 0;

  const totalDailyKwhSaved = Math.max(
    0,
    compressorSavingKwhDay + furnaceSavingKwhDay + lineShiftSavingKwhDay + syncSavingKwhDay
  );
  const totalMonthlyKwhSaved = totalDailyKwhSaved * 26;
  const totalMonthlyINRSaved = Math.round(totalMonthlyKwhSaved * 8.12);
  const newEnergyIntensity = Math.max(
    1.65,
    +(factory.kpis.energyIntensity - totalDailyKwhSaved / 950).toFixed(2)
  );

  return (
    <div className="space-y-5">
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              What-If Energy & Production Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate operational adjustments across compressors, furnace setpoints, and line balancing before shop-floor execution
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIdleCutoffMin(8);
              setFurnaceTempC(815);
              setShiftedUnits(100);
              setSyncSchedule(true);
              setAppliedScenario(false);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Recommended</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className={`lg:col-span-7 rounded-xl border p-5 space-y-5 ${cardClass}`}>
          {/* Control 1 */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">1. Compressor C1 Auto-Unload Idle Timer</span>
              <span className="font-mono text-emerald-400">
                Cut off after {idleCutoffMin} min (Currently 42 min idle)
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={42}
              value={idleCutoffMin}
              onChange={(e) => {
                setIdleCutoffMin(Number(e.target.value));
                setAppliedScenario(false);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>2 min (Aggressive)</span>
              <span>Saves ~{compressorSavingKwhDay} kWh/day</span>
              <span>42 min (No cutoff)</span>
            </div>
          </div>

          {/* Control 2 */}
          <div className="space-y-2 pt-3 border-t border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">2. Furnace Holding Zone Temperature Setpoint</span>
              <span className="font-mono text-sky-400">{furnaceTempC}°C (Baseline 845°C)</span>
            </div>
            <input
              type="range"
              min={805}
              max={845}
              step={5}
              value={furnaceTempC}
              onChange={(e) => {
                setFurnaceTempC(Number(e.target.value));
                setAppliedScenario(false);
              }}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>805°C (Light Gauge)</span>
              <span>Saves ~{furnaceSavingKwhDay} kWh/day</span>
              <span>845°C (Current)</span>
            </div>
          </div>

          {/* Control 3 */}
          <div className="space-y-2 pt-3 border-t border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="font-semibold">3. Reallocate Batch Volume (Line 02 → Line 01)</span>
              <span className="font-mono text-emerald-400">{shiftedUnits} units shifted</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={10}
              value={shiftedUnits}
              onChange={(e) => {
                setShiftedUnits(Number(e.target.value));
                setAppliedScenario(false);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>0 units</span>
              <span>Saves ~{lineShiftSavingKwhDay} kWh/day</span>
              <span>200 units</span>
            </div>
          </div>

          {/* Control 4 */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold">
                4. Synchronise Pneumatic Press Runs & Compressor Schedule
              </div>
              <div className="text-[11px] text-slate-400">
                Eliminate partial-load cycling between Shift A and Shift B handovers
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSyncSchedule(!syncSchedule);
                setAppliedScenario(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                syncSchedule
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {syncSchedule ? 'Enabled (+46 kWh/d)' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Simulated Impact Column */}
        <div className={`lg:col-span-5 rounded-xl border p-5 flex flex-col justify-between ${cardClass}`}>
          <div>
            <h3 className="text-sm font-semibold mb-4">Simulated Scenario Outcome</h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#070e17] border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="text-xs text-slate-400">Illustrative Projected Saving</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  ₹{totalMonthlyINRSaved.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Scenario estimate · {totalMonthlyKwhSaved.toLocaleString()} kWh/mo
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#070e17] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="text-xs text-slate-400">Projected Energy Intensity</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-sky-400 mt-1">
                  {newEnergyIntensity} <span className="text-xs font-normal">kWh/unit</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  vs {factory.kpis.energyIntensity} current baseline
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-800/60 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Potential Avoidable Energy:</span>
                <span className="font-mono font-semibold text-emerald-400">-{totalDailyKwhSaved} kWh / day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Illustrative Daily Cost Impact:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  ₹{Math.round(totalDailyKwhSaved * 8.12).toLocaleString()} / day
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avoided Emissions (CEA Grid Factor):</span>
                <span className="font-mono font-semibold">
                  {(totalMonthlyKwhSaved * 0.00079).toFixed(2)} tCO₂e (Illustrative)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setAppliedScenario(true)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{appliedScenario ? 'Scenario Committed to Shift Action Plan ✓' : 'Apply Scenario to Shift Action Plan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. SME PRODUCTION & EXCEL / CSV DATA SOURCES VIEW                          */
/* -------------------------------------------------------------------------- */
export const ProductionDataView: React.FC<{
  factory: FactoryProfile;
  theme: ThemeMode;
  batches: ProductionBatchRecord[];
  onAddBatch: (batch: ProductionBatchRecord) => void;
}> = ({ factory, theme, batches, onAddBatch }) => {
  const [shift, setShift] = useState<ProductionBatchRecord['shift']>('Shift A (06:00-14:00)');
  const [process, setProcess] = useState<ProductionBatchRecord['process']>('Welding');
  const [productSku, setProductSku] = useState<string>('SKU-AX204 (Axle Flange)');
  const [machineId, setMachineId] = useState<string>('CNC Machine 02');
  const [unitsProduced, setUnitsProduced] = useState<number>(220);
  const [actualKwh, setActualKwh] = useState<number>(112);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const cardClass = isDark
    ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const secBaselines: Record<ProductionBatchRecord['process'], number> = {
    Welding: 0.28,
    Pressing: 0.34,
    Drilling: 0.42,
    Painting: 0.19,
    Compression: 0.23,
    Assembly: 0.14,
    Testing: 0.12,
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const secExpected = secBaselines[process] || 0.35;
    const expectedKwh = +(unitsProduced * secExpected).toFixed(1);
    const secActual = +(actualKwh / Math.max(1, unitsProduced)).toFixed(2);
    const deviationPercent = +(((actualKwh - expectedKwh) / expectedKwh) * 100).toFixed(1);

    const newRec: ProductionBatchRecord = {
      id: `batch-${Date.now()}`,
      date: '2026-09-30',
      shift,
      productSku,
      process,
      machineId,
      unitsProduced,
      expectedKwh,
      actualKwh,
      secActual,
      secExpected,
      deviationPercent,
      source: 'Manual Sheet',
      notes:
        deviationPercent > 10
          ? 'Flagged: Abnormal SEC deviation vs baseline'
          : 'Within expected production baseline',
    };
    onAddBatch(newRec);
    setUploadNotice(`Added ${productSku} (${unitsProduced} units) — Expected ${expectedKwh} kWh vs Actual ${actualKwh} kWh (${deviationPercent > 0 ? '+' : ''}${deviationPercent}%)`);
  };

  const handleSimulatedExcelImport = () => {
    const sampleBatch: ProductionBatchRecord = {
      id: `excel-${Date.now()}`,
      date: '2026-09-30',
      shift: 'Shift B (14:00-22:00)',
      productSku: 'SKU-gear-902 (Helical Gear)',
      process: 'Testing',
      machineId: 'EOL Test Bench T-02',
      unitsProduced: 410,
      expectedKwh: 49.2,
      actualKwh: 61.5,
      secActual: 0.15,
      secExpected: 0.12,
      deviationPercent: 25.0,
      source: 'Excel Upload',
      notes: 'Imported from Pune_ShiftB_Production_Log.xlsx · Chiller standby detected',
    };
    onAddBatch(sampleBatch);
    setUploadNotice('Synced "Pune_ShiftB_Production_Log.xlsx" — 1 new anomaly identified on EOL Test Bench (+25% SEC).');
  };

  return (
    <div className="space-y-5">
      {/* SME Data Integration Banner */}
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              SME Production & Electricity Spreadsheet Connector
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect existing Excel production logs with electricity meter readings to establish expected energy baselines without expensive PLC retrofits
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSimulatedExcelImport}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Sample Excel Shift Sheet (.xlsx)</span>
            </button>
          </div>
        </div>
        {uploadNotice && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <span>{uploadNotice}</span>
            <button
              type="button"
              onClick={() => setUploadNotice(null)}
              className="text-xs underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Manual / Spreadsheet Entry Form */}
        <form onSubmit={handleLogSubmit} className={`lg:col-span-4 rounded-xl border p-4 space-y-3.5 ${cardClass}`}>
          <h3 className="text-sm font-semibold">Log Shift Production & Meter Reading</h3>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Manufacturing Process</label>
            <select
              value={process}
              onChange={(e) => setProcess(e.target.value as ProductionBatchRecord['process'])}
              className={`w-full rounded-lg border px-3 py-2 text-xs ${
                isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="Welding">Welding (Baseline 0.28 kWh/unit)</option>
              <option value="Pressing">Pressing (Baseline 0.34 kWh/unit)</option>
              <option value="Drilling">Drilling (Baseline 0.42 kWh/unit)</option>
              <option value="Painting">Painting (Baseline 0.19 kWh/unit)</option>
              <option value="Compression">Compression (Baseline 0.23 kWh/unit)</option>
              <option value="Assembly">Assembly (Baseline 0.14 kWh/unit)</option>
              <option value="Testing">Testing (Baseline 0.12 kWh/unit)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ProductionBatchRecord['shift'])}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="Shift A (06:00-14:00)">Shift A (06-14)</option>
                <option value="Shift B (14:00-22:00)">Shift B (14-22)</option>
                <option value="Shift C (22:00-06:00)">Shift C (22-06)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Machine / Line</label>
              <input
                type="text"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className={`w-full rounded-lg border px-2.5 py-2 text-xs ${
                  isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Product Batch / SKU</label>
            <input
              type="text"
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-xs ${
                isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Units Produced</label>
              <input
                type="number"
                min={1}
                value={unitsProduced}
                onChange={(e) => setUnitsProduced(Number(e.target.value))}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                  isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Metered Energy (kWh)</label>
              <input
                type="number"
                min={1}
                step="0.1"
                value={actualKwh}
                onChange={(e) => setActualKwh(Number(e.target.value))}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-mono ${
                  isDark ? 'bg-[#070e17] border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono flex justify-between">
            <span className="text-slate-400">Expected Baseline:</span>
            <span className="text-emerald-400 font-semibold">
              {(unitsProduced * (secBaselines[process] || 0.35)).toFixed(1)} kWh
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Analyze Batch Against Baseline</span>
          </button>
        </form>

        {/* Production Batches Table */}
        <div className={`lg:col-span-8 rounded-xl border p-4 ${cardClass}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">
              Production-Normalized Energy Records ({batches.length} Batches)
            </h3>
            <span className="text-xs text-slate-400">
              Source: Excel Shift Sheets + Sub-Meter Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-xs font-medium ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <th className="py-2.5 px-2.5">Batch SKU / Machine</th>
                  <th className="py-2.5 px-2.5">Process</th>
                  <th className="py-2.5 px-2.5 text-right">Units</th>
                  <th className="py-2.5 px-2.5 text-right">Expected</th>
                  <th className="py-2.5 px-2.5 text-right">Actual</th>
                  <th className="py-2.5 px-2.5 text-right">SEC (kWh/u)</th>
                  <th className="py-2.5 px-2.5 text-right">Deviation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {batches.map((b) => (
                  <tr key={b.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-2.5">
                      <div className="font-medium">{b.productSku}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.machineId} · {b.source}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-400">{b.process}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums">{b.unitsProduced}</td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums text-slate-400">
                      {b.expectedKwh} kWh
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold">
                      {b.actualKwh} kWh
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono tabular-nums">
                      {b.secActual} <span className="text-slate-500">({b.secExpected})</span>
                    </td>
                    <td
                      className={`py-2.5 px-2.5 text-right font-mono tabular-nums font-semibold ${
                        b.deviationPercent > 8
                          ? 'text-rose-400'
                          : b.deviationPercent < 0
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {b.deviationPercent > 0 ? `+${b.deviationPercent}%` : `${b.deviationPercent}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. REPORTS & VERIFIED SAVINGS VIEW                                         */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* 5. REPORTS & VERIFIED SAVINGS VIEW                                         */
/* -------------------------------------------------------------------------- */

export const ReportsView: React.FC<{
  factory: FactoryProfile;
  theme: ThemeMode;
    curtailmentSavings: Record<string, number>;
  postActionVerifications: {
    machine: string;
    beforeNonProductiveEnergy: number;
    afterNonProductiveEnergy: number;
    reductionKwh: number;
    reductionPercent: number;
    estimatedSavingsINR: number;
    monthlySavingsINR: number;
    annualSavingsINR: number;
    status: "Improved" | "No Significant Change" | "Worsened";
    explanation: string;
  }[];
}> = ({ factory, theme,curtailmentSavings, postActionVerifications }) => {
  const [exportedMsg, setExportedMsg] = useState<string | null>(null);

  const isDark = theme === "dark";

  const cardClass = isDark
    ? "bg-[#0b1522]/90 border-slate-800/80 text-slate-100"
    : "bg-white border-slate-200 text-slate-900 shadow-xs";

  const totalAnnualSavingsINR = postActionVerifications.reduce(
    (sum, verification) =>
      sum + Math.max(0, verification.annualSavingsINR),
    0
  );

  const totalMonthlySavingsINR = postActionVerifications.reduce(
    (sum, verification) =>
      sum + Math.max(0, verification.monthlySavingsINR),
    0
  );

  const totalReductionKwh = postActionVerifications.reduce(
    (sum, verification) =>
      sum + Math.max(0, verification.reductionKwh),
    0
  );

  const improvedMachines = postActionVerifications.filter(
    (verification) => verification.status === "Improved"
  ).length;

  const handleExportCSV = () => {
    const headers = [
      "Date,Shift,SKU,Process,Machine,Units,Expected_kWh,Actual_kWh,SEC_Actual,Deviation_Pct",
    ];

    const rows = factory.productionBatches.map(
      (b) =>
        `${b.date},"${b.shift}","${b.productSku}",${b.process},"${b.machineId}",${b.unitsProduced},${b.expectedKwh},${b.actualKwh},${b.secActual},${b.deviationPercent}%`
    );

    const csv = [...headers, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `WattTwin_${factory.id}_Energy_Intelligence_Report.csv`;

    a.click();

    URL.revokeObjectURL(url);

    setExportedMsg(
      "Downloaded CSV Audit Report with baseline-adjusted SEC verification."
    );
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className={`rounded-xl border p-4 ${cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Verified Savings & ISO 50001 Energy Performance Reports
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Closed-loop verification: Factory Data → Baseline Analysis →
              Anomaly Detection → Actionable Insights → Verified Savings
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Verified Audit CSV</span>
          </button>

        </div>

        {exportedMsg && (
          <div className="mt-3 text-xs text-emerald-400 font-medium">
            {exportedMsg}
          </div>
        )}
      </div>

      {/* Factory-Level Savings Summary */}
      <div className={`rounded-xl border p-5 ${cardClass}`}>

        <div className="flex flex-wrap items-start justify-between gap-5">

          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Demonstrated Energy Impact
            </div>

            <h3 className="text-lg font-semibold mt-1">
              Potential Annual Energy Cost Saving
            </h3>

            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Annualised impact based on the demonstrated reduction
              in non-productive energy across identified machines.
            </p>
          </div>

          <div className="text-right">

            <div className="text-xs text-slate-500">
              Annualised scenario impact
            </div>

            <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
              ₹
              {totalAnnualSavingsINR.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}

              <span className="text-sm text-slate-400 font-normal">
                /year
              </span>
            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

          {/* Total Energy Reduction */}
          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "bg-[#070e17] border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs text-slate-500">
              Non-Productive Energy Reduction
            </div>

            <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
              {totalReductionKwh.toFixed(1)} kWh
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Demonstrated scenario reduction
            </div>
          </div>

          {/* Monthly Cost Impact */}
          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "bg-[#070e17] border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs text-slate-500">
              Monthly Cost Impact
            </div>

            <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
              ₹
              {totalMonthlySavingsINR.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              26 operating days/month
            </div>
          </div>

          {/* Machines Improved */}
          <div
            className={`rounded-lg border p-3 ${
              isDark
                ? "bg-[#070e17] border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="text-xs text-slate-500">
              Machines Improved
            </div>

            <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">
              {improvedMachines}/{postActionVerifications.length}
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              Post-action scenario
            </div>
          </div>

        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">

          <span>
            Electricity rate: ₹8.12/kWh
          </span>

          <span>
            Annualisation: 26 operating days/month × 12 months
          </span>

        </div>

      </div>

      {/* Machine-Level Post-Action Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {postActionVerifications.map((verification) => (

          <div
            key={verification.machine}
            className={`rounded-xl border p-4 ${cardClass}`}
          >

            {/* Machine Header */}
            <div className="flex items-start justify-between gap-3">

              <div>

                <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                  Post-Action Verification
                </div>

                <h3 className="text-sm font-semibold mt-1">
                  {verification.machine}
                </h3>

              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  verification.status === "Improved"
                    ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
                    : verification.status === "Worsened"
                      ? "text-rose-400 border-rose-400/30 bg-rose-400/10"
                      : "text-amber-400 border-amber-400/30 bg-amber-400/10"
                }`}
              >
                {verification.status}
              </span>

            </div>

            {/* Energy Comparison */}
            <div className="grid grid-cols-2 gap-3 mt-4">

              {/* Before */}
              <div>
                <div className="text-xs text-slate-500">
                  Before
                </div>

                <div className="font-mono font-semibold mt-1">
                  {verification.beforeNonProductiveEnergy.toFixed(1)} kWh
                </div>
              </div>

              {/* After */}
              <div>
                <div className="text-xs text-slate-500">
                  After
                </div>

                <div className="font-mono font-semibold mt-1">
                  {verification.afterNonProductiveEnergy.toFixed(1)} kWh
                </div>
              </div>

              {/* Change */}
              <div>
                <div className="text-xs text-slate-500">
                  Change
                </div>

                <div
                  className={`font-mono font-semibold mt-1 ${
                    verification.reductionKwh > 0
                      ? "text-emerald-400"
                      : verification.reductionKwh < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                  }`}
                >
                  {verification.reductionKwh > 0 ? "-" : ""}
                  {Math.abs(
                    verification.reductionKwh
                  ).toFixed(1)}{" "}
                  kWh
                </div>
              </div>

              {/* Change Percentage */}
              <div>
                <div className="text-xs text-slate-500">
                  Change %
                </div>

                <div
                  className={`font-mono font-semibold mt-1 ${
                    verification.reductionPercent > 0
                      ? "text-emerald-400"
                      : verification.reductionPercent < 0
                        ? "text-rose-400"
                        : "text-slate-400"
                  }`}
                >
                  {verification.reductionPercent > 0 ? "-" : ""}
                  {Math.abs(
                    verification.reductionPercent
                  ).toFixed(1)}%
                </div>
              </div>

            </div>

            {/* Financial Impact */}
            <div className="mt-4 pt-3 border-t border-slate-800/60">

              <div className="text-xs text-slate-500 mb-3">
                Estimated Energy Cost Saving
              </div>

              <div className="grid grid-cols-3 gap-3">

                {/* Daily */}
                <div>
                  <div className="text-[11px] text-slate-500">
                    Daily
                  </div>

                  <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                    ₹
                    {verification.estimatedSavingsINR.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                </div>

                {/* Monthly */}
                <div>
                  <div className="text-[11px] text-slate-500">
                    Monthly
                  </div>

                  <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                    ₹
                    {verification.monthlySavingsINR.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                </div>

                {/* Annual */}
                <div className="text-right">
                  <div className="text-[11px] text-slate-500">
                    Annualised
                  </div>

                  <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                    ₹
                    {verification.annualSavingsINR.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>
                </div>

              </div>

              <div className="text-[10px] text-slate-500 mt-2">
                Based on ₹8.12/kWh · 26 operating days/month
              </div>

            </div>

            {/* Verification Finding */}
            <div className="mt-4 pt-3 border-t border-slate-800/60">

              <div className="text-xs text-slate-500 mb-1">
                Verification finding
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {verification.explanation}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};