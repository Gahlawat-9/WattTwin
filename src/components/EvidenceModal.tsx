import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  FileSpreadsheet,
  HelpCircle,
  ClipboardCheck,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { AlternativeExplanation, OpportunityItem, ThemeMode } from '../data/factoryData';

interface EvidenceWorkspaceProps {
  opportunities: OpportunityItem[];
  selectedOpportunity: OpportunityItem;
  onSelectOpportunity: (opp: OpportunityItem) => void;
  theme: ThemeMode;
  onClose?: () => void;
  onVerifyStatusChange?: (oppId: string, newStatus: OpportunityItem['validationStatus']) => void;
}

export const EvidenceToActionWorkspace: React.FC<EvidenceWorkspaceProps> = ({
  opportunities,
  selectedOpportunity,
  onSelectOpportunity,
  theme,
  onClose,
  onVerifyStatusChange,
}) => {
  const isDark = theme === 'dark';

  // Local interactive states for the 6-step workflow
  const [explanations, setExplanations] = useState<AlternativeExplanation[]>(
    selectedOpportunity.alternativeExplanations
  );
  const [idleKw, setIdleKw] = useState<number>(selectedOpportunity.assumptions.idlePowerKw);
  const [avoidableMin, setAvoidableMin] = useState<number>(
    selectedOpportunity.assumptions.avoidableMinutesPerDay
  );
  const [opDays, setOpDays] = useState<number>(
    selectedOpportunity.assumptions.operatingDaysPerMonth
  );
  const [tariff, setTariff] = useState<number>(selectedOpportunity.assumptions.tariffINRPerKwh);
  const [engineerNote, setEngineerNote] = useState<string>(selectedOpportunity.proposedAction);
  const [postSecInput, setPostSecInput] = useState<number>(
    selectedOpportunity.postInterventionSec ?? selectedOpportunity.baselineKwhPerUnit
  );
  const [localStatus, setLocalStatus] = useState<OpportunityItem['validationStatus']>(
    selectedOpportunity.validationStatus
  );

  useEffect(() => {
    setExplanations(selectedOpportunity.alternativeExplanations);
    setIdleKw(selectedOpportunity.assumptions.idlePowerKw);
    setAvoidableMin(selectedOpportunity.assumptions.avoidableMinutesPerDay);
    setOpDays(selectedOpportunity.assumptions.operatingDaysPerMonth);
    setTariff(selectedOpportunity.assumptions.tariffINRPerKwh);
    setEngineerNote(selectedOpportunity.proposedAction);
    setPostSecInput(
      selectedOpportunity.postInterventionSec ?? selectedOpportunity.baselineKwhPerUnit
    );
    setLocalStatus(selectedOpportunity.validationStatus);
  }, [selectedOpportunity]);

  const cycleExplanationStatus = (id: string) => {
    const order: AlternativeExplanation['status'][] = [
      'Plausible — Check On Floor',
      'Ruled Out',
      'Confirmed Root Cause',
    ];
    setExplanations((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextIdx = (order.indexOf(item.status) + 1) % order.length;
        return { ...item, status: order[nextIdx] };
      })
    );
  };

  // Explicit transparent calculation from assumptions
  const dailyAvoidableKwh = +((idleKw * avoidableMin) / 60).toFixed(1);
  const monthlyAvoidableKwh = Math.round(dailyAvoidableKwh * opDays);
  const monthlySimulatedINR = Math.round(monthlyAvoidableKwh * tariff);

  const cardSurface = isDark
    ? 'bg-[#0b1522] border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const subSurface = isDark
    ? 'bg-[#070e17] border-slate-800/90 text-slate-200'
    : 'bg-slate-50 border-slate-200/90 text-slate-800';

  const maxChartKw =
    Math.max(...selectedOpportunity.evidenceTimeline.map((r) => Math.max(r.actualKw, r.expectedKw))) *
    1.2;

  return (
    <div className="space-y-5">
      {/* Top Opportunity Selector Bar */}
      <div className={`rounded-xl border p-4 ${cardSurface}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-emerald-400 font-medium">
              Evidence-to-Action Investigation Workflow
            </div>
            <h2 className="text-lg font-semibold tracking-tight mt-0.5">
              Inspecting Reasoning: Observation → Evidence → Alternatives → Action → Simulation → Verification
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {opportunities.map((opp, idx) => {
              const active = opp.id === selectedOpportunity.id;
              return (
                <button
                  key={opp.id}
                  type="button"
                  onClick={() => onSelectOpportunity(opp)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? isDark
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-sky-600 border-sky-600 text-white'
                      : isDark
                      ? 'bg-[#070e17] border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {idx + 1}. {opp.machine}
                </button>
              );
            })}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Return to Overview"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STEP 1 & STEP 2: Observation + Time-Aligned Machine & Production Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step 1: Observation */}
        <div className={`lg:col-span-5 rounded-xl border p-5 flex flex-col justify-between ${cardSurface}`}>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-amber-400">01. Observation</span>
              <span className="font-mono">{selectedOpportunity.shift}</span>
            </div>

            <h3 className="text-base font-semibold leading-snug">
              {selectedOpportunity.title}
            </h3>

            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              {selectedOpportunity.observationSummary}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className={`p-3 rounded-lg border ${subSurface}`}>
                <div className="text-[11px] text-slate-400">Comparable Baseline SEC</div>
                <div className="text-base font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                  {selectedOpportunity.baselineKwhPerUnit} kWh/unit
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Historical SKU reference</div>
              </div>

              <div className={`p-3 rounded-lg border ${subSurface}`}>
                <div className="text-[11px] text-slate-400">Observed Metered SEC</div>
                <div className="text-base font-bold font-mono tabular-nums text-rose-400 mt-0.5">
                  {selectedOpportunity.actualKwhPerUnit} kWh/unit
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {selectedOpportunity.deviationPercent > 0
                    ? `+${selectedOpportunity.deviationPercent}% above baseline`
                    : `${selectedOpportunity.deviationPercent}% vs baseline`}
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-lg border text-xs ${subSurface}`}>
            <div className="text-slate-400 font-medium mb-0.5">Baseline Alignment Method:</div>
            <div className="font-mono text-[11px]">{selectedOpportunity.baselineMethod}</div>
          </div>
        </div>

        {/* Step 2: Time-Aligned Evidence Chart & Readings Table */}
        <div className={`lg:col-span-7 rounded-xl border p-5 ${cardSurface}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-semibold text-sky-400">02. Time-Aligned Evidence</span>
              <h3 className="text-sm font-semibold mt-0.5">
                Machine Power Draw (kW) vs Recorded Production Output (units)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              15-min interval alignment · Demo dataset
            </span>
          </div>

          {/* Visual Bar Comparison of Actual kW vs Expected kW + Production State */}
          <div className={`p-3 rounded-lg border mb-3 ${subSurface}`}>
            <div className="grid grid-cols-5 gap-2 items-end h-28 pt-3 px-2">
              {selectedOpportunity.evidenceTimeline.map((pt) => {
                const actH = Math.max(8, Math.round((pt.actualKw / maxChartKw) * 100));
                const expH = Math.max(8, Math.round((pt.expectedKw / maxChartKw) * 100));
                const isIdleAnomaly = pt.unitsProduced === 0 && pt.actualKw > pt.expectedKw * 1.3;
                return (
                  <div key={pt.time} className="flex flex-col items-center gap-1 h-full justify-end">
                    <div className="text-[10px] font-mono text-slate-400">
                      {pt.unitsProduced}u
                    </div>
                    <div className="w-full flex items-end justify-center gap-1.5 h-16">
                      <div
                        style={{ height: `${expH}%` }}
                        className="w-3 rounded-t-xs bg-emerald-500/50"
                        title={`Expected: ${pt.expectedKw} kW`}
                      />
                      <div
                        style={{ height: `${actH}%` }}
                        className={`w-3 rounded-t-xs ${
                          isIdleAnomaly ? 'bg-rose-500' : 'bg-sky-400'
                        }`}
                        title={`Actual: ${pt.actualKw} kW`}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{pt.time}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 mt-2 border-t border-slate-800/50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/60 inline-block" /> Expected kW
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" /> Actual kW (Producing)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" /> Actual kW (Zero Output)
                </span>
              </div>
            </div>
          </div>

          {/* Interval Readings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 font-sans">
                  <th className="py-1.5 px-2">Time</th>
                  <th className="py-1.5 px-2 text-right">Recorded Output</th>
                  <th className="py-1.5 px-2 text-right">Expected kW</th>
                  <th className="py-1.5 px-2 text-right">Actual kW</th>
                  <th className="py-1.5 px-2">Operating State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {selectedOpportunity.evidenceTimeline.map((row) => (
                  <tr key={row.time}>
                    <td className="py-1.5 px-2">{row.time}</td>
                    <td className="py-1.5 px-2 text-right">{row.unitsProduced} units</td>
                    <td className="py-1.5 px-2 text-right text-emerald-400">{row.expectedKw} kW</td>
                    <td className="py-1.5 px-2 text-right font-semibold">{row.actualKw} kW</td>
                    <td className="py-1.5 px-2 font-sans">
                      <span
                        className={
                          row.machineState.includes('Idle')
                            ? 'text-rose-400 font-medium'
                            : 'text-slate-400'
                        }
                      >
                        {row.machineState}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STEP 3 & STEP 4: Alternative Explanations + Proposed Engineer Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Step 3: Alternative Explanations */}
        <div className={`lg:col-span-6 rounded-xl border p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400">
              03. Alternative Explanations (Diagnostic Checklist)
            </span>
            <span className="text-[11px] text-slate-400">Click any row to update floor status</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Before claiming energy waste, rule out operational or data-logging explanations with the shop-floor team:
          </p>

          <div className="space-y-2.5">
            {explanations.map((exp) => (
              <div
                key={exp.id}
                onClick={() => cycleExplanationStatus(exp.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${subSurface} hover:border-emerald-500/40`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold">{exp.label}</div>
                  <span
                    className={`text-[11px] font-mono shrink-0 ${
                      exp.status === 'Confirmed Root Cause'
                        ? 'text-rose-400 font-semibold'
                        : exp.status === 'Ruled Out'
                        ? 'text-slate-400 line-through'
                        : 'text-amber-400'
                    }`}
                  >
                    {exp.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{exp.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: Proposed Action & Step 6: Verification */}
        <div className={`lg:col-span-6 rounded-xl border p-5 flex flex-col justify-between space-y-4 ${cardSurface}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">
                04. Proposed Engineering Action
              </span>
              <span className="text-xs text-slate-400">
                Owner: <strong className="text-slate-200">{selectedOpportunity.assignedRole}</strong>
              </span>
            </div>

            <textarea
              rows={2}
              value={engineerNote}
              onChange={(e) => setEngineerNote(e.target.value)}
              className={`w-full rounded-lg border p-2.5 text-xs leading-relaxed ${subSurface}`}
            />
          </div>

          {/* Step 5: Simulation Under Explicit Assumptions */}
          <div className={`p-3.5 rounded-xl border ${subSurface}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-400">
                05. Simulation (Explicitly Stated Assumptions)
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Est. ₹{monthlySimulatedINR.toLocaleString()} / month ({monthlyAvoidableKwh} kWh)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Idle Draw (kW)</label>
                <input
                  type="number"
                  step="0.5"
                  value={idleKw}
                  onChange={(e) => setIdleKw(Number(e.target.value))}
                  className="w-full rounded border border-slate-700 bg-transparent px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Avoidable min/day</label>
                <input
                  type="number"
                  value={avoidableMin}
                  onChange={(e) => setAvoidableMin(Number(e.target.value))}
                  className="w-full rounded border border-slate-700 bg-transparent px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Days / month</label>
                <input
                  type="number"
                  value={opDays}
                  onChange={(e) => setOpDays(Number(e.target.value))}
                  className="w-full rounded border border-slate-700 bg-transparent px-2 py-1 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Tariff (₹/kWh)</label>
                <input
                  type="number"
                  step="0.25"
                  value={tariff}
                  onChange={(e) => setTariff(Number(e.target.value))}
                  className="w-full rounded border border-slate-700 bg-transparent px-2 py-1 font-mono"
                />
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Formula: {idleKw} kW × ({avoidableMin}/60 hr) × {opDays} days × ₹{tariff}/kWh = ₹
              {monthlySimulatedINR.toLocaleString()}/mo (Illustrative estimate)
            </div>
          </div>

          {/* Step 6: Verification */}
          <div className={`p-3.5 rounded-xl border ${subSurface}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-emerald-400">
                06. Verification (Post-Intervention Energy per Good Unit)
              </span>
              <span className="text-xs font-mono">
                Status: <strong className="text-emerald-400">{localStatus}</strong>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              {selectedOpportunity.verificationNote}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Before: {selectedOpportunity.actualKwhPerUnit} kWh/u</span>
                <span>→</span>
                <label className="text-slate-400">Post-change SEC:</label>
                <input
                  type="number"
                  step="0.01"
                  value={postSecInput}
                  onChange={(e) => setPostSecInput(Number(e.target.value))}
                  className="w-20 rounded border border-slate-700 bg-transparent px-2 py-1 font-mono text-emerald-400 font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next =
                    localStatus === 'Verified Saving'
                      ? 'Awaiting Validation'
                      : 'Verified Saving';
                  setLocalStatus(next);
                  onVerifyStatusChange?.(selectedOpportunity.id, next);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs cursor-pointer transition-colors"
              >
                {localStatus === 'Verified Saving'
                  ? 'Marked as Verified Saving ✓'
                  : 'Record Post-Change SEC & Verify'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Modal wrapper when opened from secondary tabs */
export const EvidenceModal: React.FC<{
  opportunity: OpportunityItem | null;
  opportunities: OpportunityItem[];
  onSelectOpportunity: (opp: OpportunityItem) => void;
  theme: ThemeMode;
  onClose: () => void;
}> = ({ opportunity, opportunities, onSelectOpportunity, theme, onClose }) => {
  if (!opportunity) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border p-5 shadow-2xl ${
          isDark
            ? 'bg-[#08111d] border-slate-700 text-slate-100'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <EvidenceToActionWorkspace
          opportunities={opportunities}
          selectedOpportunity={opportunity}
          onSelectOpportunity={onSelectOpportunity}
          theme={theme}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
