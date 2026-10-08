import React, { useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Cpu,
  Gauge,
  MapPin,
  Thermometer,
  UserRound,
  Zap,
} from 'lucide-react';
import { EquipmentStatusRow, OpportunityItem, ThemeMode } from '../data/factoryData';

interface FactoryFloorMapProps {
  equipmentList: EquipmentStatusRow[];
  opportunities: OpportunityItem[];
  factoryName: string;
  theme: ThemeMode;
  onSelectOpportunity: (opp: OpportunityItem) => void;
}

const statusStyles: Record<EquipmentStatusRow['status'], { dot: string; text: string }> = {
  Normal: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  Warning: { dot: 'bg-amber-400', text: 'text-amber-400' },
  Alert: { dot: 'bg-rose-500', text: 'text-rose-400' },
  Idle: { dot: 'bg-slate-400', text: 'text-slate-400' },
};

export const FactoryFloorMap: React.FC<FactoryFloorMapProps> = ({
  equipmentList,
  opportunities,
  factoryName,
  theme,
  onSelectOpportunity,
}) => {
  const isDark = theme === 'dark';
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentList[0]?.id ?? '');
  const selectedEquipment =
    equipmentList.find((equipment) => equipment.id === selectedEquipmentId) ?? equipmentList[0];
  const zones = Array.from(
    equipmentList.reduce((grouped, equipment) => {
      const zoneEquipment = grouped.get(equipment.zoneCode) ?? [];
      zoneEquipment.push(equipment);
      grouped.set(equipment.zoneCode, zoneEquipment);
      return grouped;
    }, new Map<string, EquipmentStatusRow[]>())
  ).sort(([zoneA], [zoneB]) => zoneA.localeCompare(zoneB, undefined, { numeric: true }));
  const alertCount = equipmentList.filter(
    (equipment) => equipment.status === 'Alert' || equipment.status === 'Warning'
  ).length;
  const selectedOpportunity = selectedEquipment
    ? opportunities.find((opportunity) =>
        opportunity.machine.toLowerCase().includes(selectedEquipment.name.toLowerCase())
      ) ?? opportunities.find((opportunity) =>
        selectedEquipment.name.toLowerCase().includes(opportunity.machine.toLowerCase())
      )
    : undefined;
  const cardClass = isDark
    ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const insetClass = isDark
    ? 'bg-[#070e17] border-slate-800/90'
    : 'bg-slate-50 border-slate-200';

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${cardClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <MapPin className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Digital factory map</span>
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{factoryName}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Select any machine on the floor to inspect live operating and energy details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-lg border px-3 py-2 ${insetClass}`}>
            <span className="font-mono font-semibold">{equipmentList.length}</span>
            <span className="ml-1.5 text-slate-400">machines</span>
          </span>
          <span className={`rounded-lg border px-3 py-2 ${insetClass}`}>
            <span className="font-mono font-semibold">{zones.length}</span>
            <span className="ml-1.5 text-slate-400">zones</span>
          </span>
          <span className={`rounded-lg border px-3 py-2 ${insetClass}`}>
            <span className={`font-mono font-semibold ${alertCount ? 'text-amber-400' : 'text-emerald-400'}`}>
              {alertCount}
            </span>
            <span className="ml-1.5 text-slate-400">need attention</span>
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className={`rounded-xl border p-3 sm:p-4 xl:col-span-8 ${insetClass}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Shop-floor layout</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Equipment grouped by its recorded zone
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400" aria-label="Machine status legend">
              {(['Normal', 'Warning', 'Alert', 'Idle'] as const).map((status) => (
                <span key={status} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${statusStyles[status].dot}`} />
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div className={`mb-4 rounded-lg border p-3 ${isDark ? 'border-slate-800 bg-[#0b1522]' : 'border-slate-200 bg-white'}`}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2">
                <Zap className="h-4 w-4 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold">Incoming supply</div>
                  <div className="text-[10px] text-slate-400">Factory power</div>
                </div>
              </div>
              <ArrowRight className="hidden h-4 w-4 text-slate-500 sm:block" aria-hidden="true" />
              <ArrowDown className="h-4 w-4 text-slate-500 sm:hidden" aria-hidden="true" />
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold">Distribution board</div>
                  <div className="text-[10px] text-slate-400">Monitored zone feeds</div>
                </div>
              </div>
              <ArrowRight className="hidden h-4 w-4 text-slate-500 sm:block" aria-hidden="true" />
              <ArrowDown className="h-4 w-4 text-slate-500 sm:hidden" aria-hidden="true" />
              <div className="flex min-w-0 flex-wrap justify-center gap-1.5">
                {zones.map(([zoneCode]) => (
                  <span
                    key={zoneCode}
                    className="rounded-md border border-slate-700/60 bg-slate-800/40 px-2 py-1 font-mono text-[10px] text-slate-300"
                  >
                    {zoneCode}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-500">
              Illustrative power-distribution links; verify physical wiring against site drawings.
            </p>
          </div>

          {equipmentList.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {zones.map(([zoneCode, equipment]) => (
                <section
                  key={zoneCode}
                  aria-label={`${zoneCode} machines`}
                  className={`rounded-lg border p-3 ${
                    isDark ? 'border-slate-800 bg-[#0b1522]/80' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-slate-800/50 pb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <h3 className="font-mono text-xs font-semibold">{zoneCode}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {equipment.length} {equipment.length === 1 ? 'machine' : 'machines'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {equipment.map((machine) => {
                      const isSelected = selectedEquipment?.id === machine.id;
                      const statusStyle = statusStyles[machine.status];
                      return (
                        <button
                          key={machine.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelectedEquipmentId(machine.id)}
                          className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                            isSelected
                              ? 'border-emerald-500/70 bg-emerald-500/10'
                              : isDark
                              ? 'border-slate-800 bg-[#070e17] hover:border-slate-600'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold">{machine.name}</div>
                              <div className="mt-1 text-[10px] text-slate-400">{machine.process}</div>
                            </div>
                            <span className={`inline-flex shrink-0 items-center gap-1.5 text-[10px] ${statusStyle.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                              {machine.status}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[10px] tabular-nums">
                            <span className="text-slate-400">{machine.powerKw} kW</span>
                            <span className={machine.deviationPercent > 5 ? 'text-rose-400' : machine.deviationPercent < 0 ? 'text-emerald-400' : 'text-amber-400'}>
                              {machine.deviationPercent > 0 ? '+' : ''}{machine.deviationPercent}% SEC
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
              No machine records are available for this factory.
            </div>
          )}
        </section>

        <aside className={`rounded-xl border p-4 xl:col-span-4 ${cardClass}`} aria-live="polite">
          {selectedEquipment ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <Cpu className="h-3.5 w-3.5" />
                    {selectedEquipment.zoneCode} · {selectedEquipment.process}
                  </div>
                  <h2 className="mt-1 text-base font-semibold">{selectedEquipment.name}</h2>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2 py-1 text-[10px] ${statusStyles[selectedEquipment.status].text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[selectedEquipment.status].dot}`} />
                  {selectedEquipment.status}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Active power', value: `${selectedEquipment.powerKw} kW`, icon: Zap },
                  { label: 'Machine load', value: `${selectedEquipment.loadPercent}%`, icon: Gauge },
                  { label: 'Expected SEC', value: `${selectedEquipment.expectedKwhPerUnit} kWh/u`, icon: Activity },
                  { label: 'Actual SEC', value: `${selectedEquipment.actualKwhPerUnit} kWh/u`, icon: Activity },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className={`rounded-lg border p-3 ${insetClass}`}>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Icon className="h-3 w-3" />
                      {label}
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold tabular-nums">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">SEC deviation</span>
                  <span className={`font-mono font-semibold ${selectedEquipment.deviationPercent > 5 ? 'text-rose-400' : selectedEquipment.deviationPercent < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedEquipment.deviationPercent > 0 ? '+' : ''}{selectedEquipment.deviationPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-400"><Activity className="h-3 w-3" />Units today</span>
                  <span className="font-mono tabular-nums">{selectedEquipment.unitsToday}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-400"><UserRound className="h-3 w-3" />Operator</span>
                  <span>{selectedEquipment.operator}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-slate-400"><Thermometer className="h-3 w-3" />Temperature</span>
                  <span className="font-mono tabular-nums">
                    {selectedEquipment.temperatureC === undefined ? 'Not recorded' : `${selectedEquipment.temperatureC}°C`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Shift</span>
                  <span>{selectedEquipment.shift}</span>
                </div>
              </div>

              {selectedOpportunity && (
                <button
                  type="button"
                  onClick={() => onSelectOpportunity(selectedOpportunity)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  Investigate machine opportunity
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex min-h-48 items-center justify-center text-center text-sm text-slate-400">
              Select a machine on the map to see its details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
