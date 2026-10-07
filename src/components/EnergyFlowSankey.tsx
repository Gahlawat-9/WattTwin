import React, { useMemo, useState } from 'react';
import {
  Factory,
  Flame,
  Cpu,
  Gauge,
  Wind,
  Zap,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { EnergyRecord } from '../data/csvLoader';
import { ThemeMode } from '../data/factoryData';

interface EnergyFlowSankeyProps {
  data: EnergyRecord[];
  theme: ThemeMode;
  onViewDetails?: () => void;
  expanded?: boolean;
}

interface SankeyNode {
  name: string;
  process: string;
  kwh: number;
  expectedKwh: number;
  pct: number;
}

export const EnergyFlowSankey: React.FC<
  EnergyFlowSankeyProps
> = ({
  data,
  theme,
  onViewDetails,
  expanded = false,
}) => {
  const [selectedNode, setSelectedNode] =
    useState<string | null>(null);

  const isDark = theme === 'dark';

  /*
   * ---------------------------------------------------------
   * Calculate Sankey data from the real CSV dataset
   * ---------------------------------------------------------
   */
  const sankey = useMemo(() => {
    if (data.length === 0) {
      return {
        totalGridKwh: 0,
        productionKwh: 0,
        auxiliaryKwh: 0,
        productionPct: 0,
        auxiliaryPct: 0,
        productionNodes: [] as SankeyNode[],
        auxiliaryNodes: [] as SankeyNode[],
      };
    }

    /*
     * Total energy entering the factory dataset.
     */
    const totalGridKwh = data.reduce(
      (sum, record) => sum + record.kWh,
      0
    );

    /*
     * Current representative dataset contains
     * production processes only.
     *
     * We therefore do NOT invent auxiliary energy.
     */
    const productionRecords = data;

    const productionKwh = productionRecords.reduce(
      (sum, record) => sum + record.kWh,
      0
    );

    const auxiliaryKwh = 0;

    const productionPct =
      totalGridKwh > 0
        ? Math.round(
            (productionKwh / totalGridKwh) * 100
          )
        : 0;

    const auxiliaryPct =
      totalGridKwh > 0
        ? Math.round(
            (auxiliaryKwh / totalGridKwh) * 100
          )
        : 0;

    /*
     * Group energy by machine.
     */
    const machineMap = new Map<
      string,
      {
        process: string;
        kwh: number;
        production: number;
        productionEnergy: number;
      }
    >();

    data.forEach((record) => {
      const existing =
        machineMap.get(record.machine);

      if (existing) {
        existing.kwh += record.kWh;
        existing.production +=
          record.productionUnits;

        if (
          record.operatingState === 'Running' &&
          record.productionUnits > 0
        ) {
          existing.productionEnergy +=
            record.kWh;
        }
      } else {
        machineMap.set(record.machine, {
          process: record.process,
          kwh: record.kWh,
          production:
            record.productionUnits,
          productionEnergy:
            record.operatingState === 'Running' &&
            record.productionUnits > 0
              ? record.kWh
              : 0,
        });
      }
    });

    /*
     * Create consumer nodes.
     *
     * Expected energy is based on the machine's
     * productive SEC.
     */
    const productionNodes: SankeyNode[] =
      Array.from(machineMap.entries()).map(
        ([machine, machineData]) => {
          const runningRecords =
            data.filter(
              (record) =>
                record.machine === machine &&
                record.operatingState ===
                  'Running' &&
                record.productionUnits > 0
            );

          const runningEnergy =
            runningRecords.reduce(
              (sum, record) =>
                sum + record.kWh,
              0
            );

          const runningProduction =
            runningRecords.reduce(
              (sum, record) =>
                sum +
                record.productionUnits,
              0
            );

          const machineSEC =
            runningProduction > 0
              ? runningEnergy /
                runningProduction
              : 0;

          const expectedKwh =
            machineData.production *
            machineSEC;

          const pct =
            productionKwh > 0
              ? Math.round(
                  (machineData.kwh /
                    productionKwh) *
                    100
                )
              : 0;

          return {
            name: machine,
            process: machineData.process,
            kwh: Number(
              machineData.kwh.toFixed(1)
            ),
            expectedKwh: Number(
              expectedKwh.toFixed(1)
            ),
            pct,
          };
        }
      );

    return {
      totalGridKwh: Number(
        totalGridKwh.toFixed(1)
      ),
      productionKwh: Number(
        productionKwh.toFixed(1)
      ),
      auxiliaryKwh: Number(
        auxiliaryKwh.toFixed(1)
      ),
      productionPct,
      auxiliaryPct,
      productionNodes,
      auxiliaryNodes: [] as SankeyNode[],
    };
  }, [data]);

  /*
   * ---------------------------------------------------------
   * Consumer nodes
   * ---------------------------------------------------------
   */
  const allEndNodes = [
    ...sankey.productionNodes,
    ...sankey.auxiliaryNodes,
  ];

  const inspected =
    allEndNodes.find(
      (node) => node.name === selectedNode
    ) ||
    allEndNodes[0];

  /*
   * ---------------------------------------------------------
   * Icons
   * ---------------------------------------------------------
   */
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();

    if (
      lower.includes('cnc') ||
      lower.includes('line')
    ) {
      return (
        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
      );
    }

    if (
      lower.includes('furnace') ||
      lower.includes('motor')
    ) {
      return (
        <Flame className="w-3.5 h-3.5 text-sky-400" />
      );
    }

    if (lower.includes('press')) {
      return (
        <Gauge className="w-3.5 h-3.5 text-blue-400" />
      );
    }

    if (
      lower.includes('hvac') ||
      lower.includes('other')
    ) {
      return (
        <Wind className="w-3.5 h-3.5 text-violet-400" />
      );
    }

    return (
      <Settings className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  /*
   * ---------------------------------------------------------
   * Empty/loading state
   * ---------------------------------------------------------
   */
  if (data.length === 0 || !inspected) {
    return (
      <div
        className={`rounded-xl border p-4 ${
          isDark
            ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
        }`}
      >
        <div className="text-sm font-semibold">
          Energy Flow
        </div>

        <div className="text-xs text-slate-400 mt-2">
          Loading energy data...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isDark
          ? 'bg-[#0b1522]/90 border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Energy Flow
          </h3>

         
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sankey Diagram */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[540px] relative py-2">

          {/* SVG Connecting Ribbons */}
          <svg
            viewBox="0 0 600 245"
            className="w-full h-[245px] select-none pointer-events-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="ribbonProd"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#0ea5e9"
                  stopOpacity={
                    isDark ? 0.45 : 0.32
                  }
                />

                <stop
                  offset="100%"
                  stopColor="#10b981"
                  stopOpacity={
                    isDark ? 0.55 : 0.38
                  }
                />
              </linearGradient>

              <linearGradient
                id="ribbonAux"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#3b82f6"
                  stopOpacity={
                    isDark ? 0.4 : 0.28
                  }
                />

                <stop
                  offset="100%"
                  stopColor="#6366f1"
                  stopOpacity={
                    isDark ? 0.5 : 0.35
                  }
                />
              </linearGradient>

              <linearGradient
                id="ribbonLeaf1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#10b981"
                  stopOpacity={
                    isDark ? 0.55 : 0.35
                  }
                />

                <stop
                  offset="100%"
                  stopColor="#059669"
                  stopOpacity={
                    isDark ? 0.35 : 0.25
                  }
                />
              </linearGradient>

              <linearGradient
                id="ribbonLeaf2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#06b6d4"
                  stopOpacity={
                    isDark ? 0.55 : 0.35
                  }
                />

                <stop
                  offset="100%"
                  stopColor="#0284c7"
                  stopOpacity={
                    isDark ? 0.35 : 0.25
                  }
                />
              </linearGradient>

              <linearGradient
                id="ribbonLeaf3"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor="#6366f1"
                  stopOpacity={
                    isDark ? 0.55 : 0.35
                  }
                />

                <stop
                  offset="100%"
                  stopColor="#8b5cf6"
                  stopOpacity={
                    isDark ? 0.35 : 0.25
                  }
                />
              </linearGradient>
            </defs>

            {/* Grid → Production */}
            <path
              d="M 110 105 C 155 105, 155 72, 200 72"
              fill="none"
              stroke="url(#ribbonProd)"
              strokeWidth="34"
            />

            {/* Grid → Auxiliary */}
            <path
              d="M 110 142 C 155 142, 155 182, 200 182"
              fill="none"
              stroke="url(#ribbonAux)"
              strokeWidth="24"
              opacity={
                sankey.auxiliaryKwh > 0
                  ? 1
                  : 0.12
              }
            />

            {/* Production → Consumers */}
            <path
              d="M 340 60 C 385 60, 385 26, 425 26"
              fill="none"
              stroke="url(#ribbonLeaf1)"
              strokeWidth="15"
            />

            <path
              d="M 340 73 C 385 73, 385 75, 425 75"
              fill="none"
              stroke="url(#ribbonLeaf2)"
              strokeWidth="22"
            />

            <path
              d="M 340 86 C 385 86, 385 124, 425 124"
              fill="none"
              stroke="url(#ribbonLeaf2)"
              strokeWidth="15"
            />

            {/* Auxiliary → Consumers */}
            <path
              d="M 340 175 C 385 175, 385 173, 425 173"
              fill="none"
              stroke="url(#ribbonLeaf3)"
              strokeWidth="12"
              opacity={
                sankey.auxiliaryKwh > 0
                  ? 1
                  : 0.08
              }
            />

            <path
              d="M 340 189 C 385 189, 385 220, 425 220"
              fill="none"
              stroke="url(#ribbonLeaf3)"
              strokeWidth="16"
              opacity={
                sankey.auxiliaryKwh > 0
                  ? 1
                  : 0.08
              }
            />
          </svg>

          {/* Overlay Nodes */}
          <div className="absolute inset-0 grid grid-cols-12 items-center pointer-events-auto">

            {/* Grid */}
            <div className="col-span-3 pr-3 flex items-center">
              <div
                className={`w-full rounded-xl border p-3 ${
                  isDark
                    ? 'bg-[#0e1b2d] border-slate-700/80 shadow-inner'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4 text-sky-400" />
                </div>

                <div className="text-xs text-slate-400">
                  Grid
                </div>

                <div className="text-sm font-bold font-mono tabular-nums mt-0.5">
                  {sankey.totalGridKwh.toLocaleString()}{' '}
                  <span className="text-xs font-normal">
                    kWh
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  100%
                </div>
              </div>
            </div>

            {/* Production / Auxiliary */}
            <div className="col-span-4 px-3 flex flex-col justify-between h-[205px]">

              {/* Production */}
              <div
                className={`rounded-xl border px-3 py-2.5 flex items-center gap-2.5 ${
                  isDark
                    ? 'bg-[#0d2329] border-emerald-500/35'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Factory className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">
                    Production
                  </div>

                  <div className="text-xs font-mono tabular-nums text-emerald-400 font-semibold">
                    {sankey.productionKwh} kWh (
                    {sankey.productionPct}%)
                  </div>
                </div>
              </div>

              {/* Auxiliary */}
              <div
                className={`rounded-xl border px-3 py-2.5 flex items-center gap-2.5 ${
                  isDark
                    ? 'bg-[#151936] border-indigo-500/35'
                    : 'bg-indigo-50/70 border-indigo-200'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">
                    Auxiliary
                  </div>

                  <div className="text-xs font-mono tabular-nums text-indigo-400 font-semibold">
                    {sankey.auxiliaryKwh} kWh (
                    {sankey.auxiliaryPct}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Consumer Nodes */}
            <div className="col-span-5 pl-3 flex flex-col justify-between h-[236px]">

              {allEndNodes.map((node) => {
                const isSelected =
                  inspected.name === node.name;

                const diffPct =
                  node.expectedKwh > 0
                    ? Math.round(
                        ((node.kwh -
                          node.expectedKwh) /
                          node.expectedKwh) *
                          100
                      )
                    : 0;

                return (
                  <button
                    key={node.name}
                    type="button"
                    onClick={() =>
                      setSelectedNode(node.name)
                    }
                    className={`w-full text-left rounded-lg border px-2.5 py-1.5 flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isDark
                        ? isSelected
                          ? 'bg-[#13283c] border-emerald-500/50'
                          : 'bg-[#0e1b2d]/90 border-slate-800 hover:border-slate-700'
                        : isSelected
                          ? 'bg-sky-50 border-sky-300'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-md bg-slate-800/60 flex items-center justify-center shrink-0">
                        {getIcon(node.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">
                          {node.name}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {node.kwh} kWh (
                          {node.pct}%)
                        </div>
                      </div>
                    </div>

                    {expanded && (
                      <span
                        className={`text-[11px] font-mono tabular-nums ${
                          diffPct > 5
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {diffPct > 0
                          ? `+${diffPct}%`
                          : `${diffPct}%`}{' '}
                        vs base
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`mt-2 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
          isDark
            ? 'border-slate-800/80 text-slate-400'
            : 'border-slate-100 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">
            {inspected.name}
          </span>

          <span>·</span>

          <span>{inspected.process}</span>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span>
            Actual:{' '}
            <strong
              className={
                isDark
                  ? 'text-slate-200'
                  : 'text-slate-800'
              }
            >
              {inspected.kwh} kWh
            </strong>
          </span>

          <span>·</span>

          <span>
            Expected Baseline:{' '}
            <strong className="text-emerald-400">
              {inspected.expectedKwh} kWh
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};