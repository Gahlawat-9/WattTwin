import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { EnergyRecord } from '../data/csvLoader';
import { ThemeMode } from '../data/factoryData';

interface ChartPoint {
  time: string;
  shift: string;
  energyKwh: number;
  expectedEnergyKwh: number;
  productionUnits: number;
  anomalyFlag: boolean;
  anomalyNote: string;
}

interface EnergyVsProductionChartProps {
  data: EnergyRecord[];
  theme: ThemeMode;
  defaultMode?: 'area' | 'combo';
  timeRange: '1D' | '7D' | '30D';
  onTimeRangeChange: (range: '1D' | '7D' | '30D') => void;
}

export const EnergyVsProductionChart: React.FC<
  EnergyVsProductionChartProps
> = ({
  data,
  theme,
  defaultMode = 'area',
  timeRange,
  onTimeRangeChange,
}) => {
  const [chartStyle, setChartStyle] = useState<'area' | 'combo'>(
    defaultMode
  );

  const [showProductionLine, setShowProductionLine] =
    useState<boolean>(true);

  const [hoverIdx, setHoverIdx] = useState<number>(0);

  React.useEffect(() => {
    setChartStyle(defaultMode);
  }, [defaultMode]);

  /*
   * ---------------------------------------------------------
   * 1. Calculate reference SEC from productive records
   * ---------------------------------------------------------
   *
   * SEC = kWh / production units
   *
   * Only Running records with production are used for the
   * reference baseline.
   */
  const referenceSEC = useMemo(() => {
    const producingRecords = data.filter(
      (record) =>
        record.productionUnits > 0 &&
        record.operatingState === 'Running'
    );

    if (producingRecords.length === 0) {
      return 0;
    }

    const totalEnergy = producingRecords.reduce(
      (sum, record) => sum + record.kWh,
      0
    );

    const totalProduction = producingRecords.reduce(
      (sum, record) => sum + record.productionUnits,
      0
    );

    if (totalProduction === 0) {
      return 0;
    }

    return totalEnergy / totalProduction;
  }, [data]);

  /*
   * ---------------------------------------------------------
   * 2. Convert raw EnergyRecord[] into chart data
   * ---------------------------------------------------------
   */
  const chartData = useMemo<ChartPoint[]>(() => {
    return data.map((record) => {
      const expectedEnergyKwh =
        record.productionUnits * referenceSEC;

      const anomalyFlag =
        record.productionUnits === 0 && record.kWh > 0;

      let anomalyNote = '';

      if (record.operatingState === 'Idle') {
        anomalyNote =
          'Energy consumption detected while production output was zero.';
      } else if (record.operatingState === 'Downtime') {
        anomalyNote =
          'Energy consumption detected during downtime with zero production output.';
      } else if (record.operatingState === 'Fault') {
        anomalyNote =
          'Energy consumption detected during a fault condition with zero production output.';
      }

      return {
        time: record.timestamp,
        shift: '09:00–18:00',
        energyKwh: record.kWh,
        expectedEnergyKwh,
        productionUnits: record.productionUnits,
        anomalyFlag,
        anomalyNote,
      };
    });
  }, [data, referenceSEC]);

  /*
   * ---------------------------------------------------------
   * 3. Empty-data protection
   * ---------------------------------------------------------
   */
  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 p-5 text-sm text-slate-400">
        Loading energy data...
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * 4. Scale according to selected time range
   * ---------------------------------------------------------
   */
  const multiplier =
    timeRange === '1D'
      ? 1
      : timeRange === '7D'
        ? 6.8
        : 28.5;

  const scaledData = chartData.map((d) => ({
    ...d,
    energyKwh: d.energyKwh * multiplier,
    expectedEnergyKwh:
      d.expectedEnergyKwh * multiplier,
    productionUnits:
      d.productionUnits * multiplier,
  }));

  /*
   * ---------------------------------------------------------
   * 5. Chart dimensions
   * ---------------------------------------------------------
   */
  const maxEnergy =
    Math.max(
      ...scaledData.map((d) =>
        Math.max(
          d.energyKwh,
          d.expectedEnergyKwh
        )
      )
    ) * 1.22 || 1;

  const maxUnits =
    Math.max(
      ...scaledData.map(
        (d) => d.productionUnits
      )
    ) * 1.25 || 1;

  const svgWidth = 680;
  const svgHeight = 235;

  const padLeft = 46;
  const padRight = 46;
  const padTop = 24;
  const padBottom = 30;

  const plotW =
    svgWidth - padLeft - padRight;

  const plotH =
    svgHeight - padTop - padBottom;

  /*
   * ---------------------------------------------------------
   * 6. Coordinate helpers
   * ---------------------------------------------------------
   */
  const getX = (index: number) => {
    if (scaledData.length <= 1) {
      return padLeft;
    }

    return (
      padLeft +
      (index / (scaledData.length - 1)) *
        plotW
    );
  };

  const getYEnergy = (value: number) =>
    padTop +
    plotH -
    (value / maxEnergy) * plotH;

  const getYUnits = (value: number) =>
    padTop +
    plotH -
    (value / maxUnits) * plotH;

  /*
   * ---------------------------------------------------------
   * 7. Smooth SVG path
   * ---------------------------------------------------------
   */
  const buildSmoothPath = (
    points: { x: number; y: number }[]
  ) => {
    if (points.length === 0) {
      return '';
    }

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    let path =
      `M ${points[0].x} ${points[0].y}`;

    for (
      let i = 0;
      i < points.length - 1;
      i++
    ) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const cpx1 =
        p0.x +
        (p1.x - p0.x) * 0.45;

      const cpy1 = p0.y;

      const cpx2 =
        p0.x +
        (p1.x - p0.x) * 0.55;

      const cpy2 = p1.y;

      path +=
        ` C ${cpx1} ${cpy1}, ` +
        `${cpx2} ${cpy2}, ` +
        `${p1.x} ${p1.y}`;
    }

    return path;
  };

  /*
   * ---------------------------------------------------------
   * 8. Build chart paths
   * ---------------------------------------------------------
   */
  const energyPoints = scaledData.map(
    (d, i) => ({
      x: getX(i),
      y: getYEnergy(d.energyKwh),
    })
  );

  const baselinePoints =
    scaledData.map((d, i) => ({
      x: getX(i),
      y: getYEnergy(
        d.expectedEnergyKwh
      ),
    }));

  const unitPoints = scaledData.map(
    (d, i) => ({
      x: getX(i),
      y: getYUnits(
        d.productionUnits
      ),
    })
  );

  const energyPath =
    buildSmoothPath(energyPoints);

  const baselinePath =
    buildSmoothPath(baselinePoints);

  const unitsPath =
    buildSmoothPath(unitPoints);

  const energyAreaPath =
    energyPoints.length > 0
      ? `${energyPath} L ${
          energyPoints[
            energyPoints.length - 1
          ].x
        } ${padTop + plotH} L ${
          energyPoints[0].x
        } ${padTop + plotH} Z`
      : '';

  /*
   * ---------------------------------------------------------
   * 9. Active tooltip point
   * ---------------------------------------------------------
   */
  const activeIndex = Math.min(
    Math.max(hoverIdx, 0),
    scaledData.length - 1
  );

  const activePoint =
    scaledData[activeIndex];

  const activeX =
    getX(activeIndex);

  const activeEnergyY =
    getYEnergy(
      activePoint.energyKwh
    );

  const activeBaselineY =
    getYEnergy(
      activePoint.expectedEnergyKwh
    );

  const yTicks = [
    0,
    0.25,
    0.5,
    0.75,
    1,
  ];

  const isDark = theme === 'dark';

  /*
   * ---------------------------------------------------------
   * 10. UI
   * ---------------------------------------------------------
   */
  return (
    <div
      className={
        isDark
          ? 'relative w-full'
          : 'relative w-full'
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className={
                isDark
                  ? 'text-sm font-semibold text-white'
                  : 'text-sm font-semibold text-slate-900'
              }
            >
              Energy vs Production
            </h3>

            <Info
              size={14}
              className={
                isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }
            />
          </div>

          <p
            className={
              isDark
                ? 'text-[11px] text-slate-500 mt-1'
                : 'text-[11px] text-slate-500 mt-1'
            }
          >
            Actual energy compared with
            production-normalized reference
          </p>
        </div>

        {/* Chart style */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setChartStyle('area')
            }
            className={`px-2 py-1 rounded text-[10px] ${
              chartStyle === 'area'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500'
            }`}
          >
            Area
          </button>

          <button
            type="button"
            onClick={() =>
              setChartStyle('combo')
            }
            className={`px-2 py-1 rounded text-[10px] ${
              chartStyle === 'combo'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500'
            }`}
          >
            Combo
          </button>
        </div>
      </div>

      {/* Time range */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {(['1D', '7D', '30D'] as const).map(
            (range) => (
              <button
                key={range}
                type="button"
                onClick={() =>
                  onTimeRangeChange(range)
                }
                className={`px-2 py-1 rounded text-[10px] ${
                  timeRange === range
                    ? 'bg-sky-500/15 text-sky-400'
                    : 'text-slate-500'
                }`}
              >
                {range}
              </button>
            )
          )}
        </div>

        <label className="flex items-center gap-2 text-[10px] text-slate-400">
          <input
            type="checkbox"
            checked={showProductionLine}
            onChange={(e) =>
              setShowProductionLine(
                e.target.checked
              )
            }
          />
          Production
        </label>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto"
          onMouseLeave={() =>
            setHoverIdx(0)
          }
        >
          {/* Grid */}
          {yTicks.map((tick) => {
            const y =
              padTop +
              plotH -
              tick * plotH;

            return (
              <line
                key={tick}
                x1={padLeft}
                x2={svgWidth - padRight}
                y1={y}
                y2={y}
                stroke={
                  isDark
                    ? '#334155'
                    : '#e2e8f0'
                }
                strokeDasharray="3 4"
                opacity="0.5"
              />
            );
          })}

          {/* Energy area */}
          {chartStyle === 'area' &&
            energyAreaPath && (
              <path
                d={energyAreaPath}
                fill="currentColor"
                className="text-sky-500/10"
              />
            )}

          {/* Expected baseline */}
          <path
            d={baselinePath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {/* Actual energy */}
          <path
            d={energyPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />

          {/* Production */}
          {showProductionLine &&
            chartStyle === 'combo' && (
              <path
                d={unitsPath}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
              />
            )}

          {/* Hover line */}
          <line
            x1={activeX}
            x2={activeX}
            y1={padTop}
            y2={padTop + plotH}
            stroke="#64748b"
            strokeDasharray="3 3"
            opacity="0.7"
          />

          {/* Actual point */}
          <circle
            cx={activeX}
            cy={activeEnergyY}
            r="4"
            fill="#38bdf8"
          />

          {/* Baseline point */}
          <circle
            cx={activeX}
            cy={activeBaselineY}
            r="3"
            fill="#94a3b8"
          />

          {/* Hover zones */}
          {scaledData.map((_, index) => {
            const x = getX(index);

            return (
              <rect
                key={index}
                x={
                  x -
                  plotW /
                    Math.max(
                      scaledData.length,
                      1
                    ) /
                    2
                }
                y={padTop}
                width={
                  plotW /
                  Math.max(
                    scaledData.length,
                    1
                  )
                }
                height={plotH}
                fill="transparent"
                onMouseEnter={() =>
                  setHoverIdx(index)
                }
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        <div className="absolute top-2 right-2 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-lg">
          <div className="flex items-center justify-between gap-3 font-mono font-semibold text-[11px] text-slate-300 mb-1">
            <span>
              {activePoint.time}
            </span>

            <span>
              {activePoint.shift}
            </span>
          </div>

          <div className="space-y-0.5 font-mono tabular-nums">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">
                Actual energy:
              </span>

              <span className="text-sky-400 font-semibold">
                {activePoint.energyKwh.toFixed(
                  1
                )}{' '}
                kWh
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">
                Expected energy:
              </span>

              <span className="text-slate-400 font-semibold">
                {activePoint.expectedEnergyKwh.toFixed(
                  1
                )}{' '}
                kWh
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">
                Production:
              </span>

              <span className="text-emerald-400 font-semibold">
                {activePoint.productionUnits.toFixed(
                  0
                )}{' '}
                units
              </span>
            </div>

            {activePoint.anomalyFlag && (
              <div className="mt-1 pt-1 border-t border-slate-700 text-amber-300 text-[10px]">
                {activePoint.anomalyNote}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-sky-400" />
          Actual energy
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-400" />
          Reference energy
        </div>

        {showProductionLine &&
          chartStyle === 'combo' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400" />
              Production
            </div>
          )}

        <div className="ml-auto text-slate-500">
          Reference SEC:{' '}
          {referenceSEC.toFixed(3)} kWh/unit
        </div>
      </div>
    </div>
  );
};