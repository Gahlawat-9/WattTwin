import { EnergyRecord } from "../data/csvLoader";

export type MaintenanceStatus =
  | "Normal"
  | "Watch"
  | "Maintenance Recommended"
  | "Insufficient Data";

export interface MachineMaintenanceAnalysis {
  machine: string;

  baselineEnergyPerUnit: number;
  recentEnergyPerUnit: number;

  deviationPercent: number;
  trendPercent: number;

  recentRecords: number;
  risingIntervals: number;

  abnormalStateRecords: number;

  status: MaintenanceStatus;

  reason: string;
  evidence: string[];
}

/*
 * These are configurable V1 decision thresholds.
 *
 * They are NOT universal industrial limits.
 * They simply provide a transparent starting point
 * for distinguishing normal variation from a meaningful trend.
 */
export const MAINTENANCE_THRESHOLDS = {
  normalDeviationPercent: 10,
  watchDeviationPercent: 20,
  minimumRecords: 4,
  minimumRecentRecords: 3,
} as const;


/**
 * Calculate production-normalised energy intensity.
 *
 * This prevents WattTwin from treating:
 *
 *   40 kWh → 41 kWh
 *
 * as automatically problematic when production also changed.
 */
function calculateEnergyPerUnit(records: EnergyRecord[]): number {
  const productiveRecords = records.filter(
    (record) =>
      record.productionUnits > 0 &&
      record.operatingState === "Running"
  );

  if (productiveRecords.length === 0) {
    return 0;
  }

  const totalEnergy = productiveRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const totalProduction = productiveRecords.reduce(
    (sum, record) => sum + record.productionUnits,
    0
  );

  if (totalProduction <= 0) {
    return 0;
  }

  return totalEnergy / totalProduction;
}


/**
 * Analyse one machine for a persistent energy-consumption trend.
 *
 * The machine's chronological history is divided into:
 *
 *   earlier records → baseline behaviour
 *   recent records  → current behaviour
 *
 * We then compare production-normalised energy intensity.
 */
function analyseMachineMaintenance(
  machineRecords: EnergyRecord[]
): MachineMaintenanceAnalysis | null {
  if (machineRecords.length < MAINTENANCE_THRESHOLDS.minimumRecords) {
    return null;
  }

  const sortedRecords = [...machineRecords].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  );

  const splitIndex = Math.floor(sortedRecords.length * 0.6);

  const baselineRecords = sortedRecords.slice(0, splitIndex);
  const recentRecords = sortedRecords.slice(splitIndex);

  if (
    baselineRecords.length === 0 ||
    recentRecords.length <
      MAINTENANCE_THRESHOLDS.minimumRecentRecords
  ) {
    return null;
  }

  const baselineEnergyPerUnit =
    calculateEnergyPerUnit(baselineRecords);

  const recentEnergyPerUnit =
    calculateEnergyPerUnit(recentRecords);

  /*
   * If either period does not contain enough productive
   * data, we cannot make a meaningful maintenance judgement.
   */
  if (
    baselineEnergyPerUnit <= 0 ||
    recentEnergyPerUnit <= 0
  ) {
    return {
      machine: machineRecords[0].machine,
      baselineEnergyPerUnit,
      recentEnergyPerUnit,
      deviationPercent: 0,
      trendPercent: 0,
      recentRecords: recentRecords.length,
      risingIntervals: 0,
      abnormalStateRecords: 0,
      status: "Insufficient Data",
      reason:
        "Not enough productive energy data to establish a reliable maintenance trend.",
      evidence: [
        "Insufficient production-normalised energy data.",
      ],
    };
  }

  const deviationPercent =
    ((recentEnergyPerUnit - baselineEnergyPerUnit) /
      baselineEnergyPerUnit) *
    100;

  /*
   * Count whether energy intensity is repeatedly increasing
   * across consecutive productive observations.
   */
  const productiveRecentRecords = recentRecords.filter(
    (record) =>
      record.productionUnits > 0 &&
      record.operatingState === "Running"
  );

  let risingIntervals = 0;

  for (
    let i = 1;
    i < productiveRecentRecords.length;
    i++
  ) {
    const previous = productiveRecentRecords[i - 1];
    const current = productiveRecentRecords[i];

    const previousIntensity =
      previous.kWh / previous.productionUnits;

    const currentIntensity =
      current.kWh / current.productionUnits;

    if (currentIntensity > previousIntensity) {
      risingIntervals++;
    }
  }

  /*
   * Count abnormal operating-state observations.
   *
   * These are evidence signals, NOT proof of machine failure.
   */
  const abnormalStateRecords = recentRecords.filter(
    (record) =>
      record.operatingState === "Idle" ||
      record.operatingState === "Downtime" ||
      record.operatingState === "Fault"
  ).length;

  /*
   * Overall trend is based on the change from baseline
   * intensity to recent intensity.
   */
  const trendPercent = deviationPercent;

  let status: MaintenanceStatus;
  let reason: string;

  if (
    Math.abs(deviationPercent) <
    MAINTENANCE_THRESHOLDS.normalDeviationPercent
  ) {
    status = "Normal";

    reason =
      "Recent energy intensity remains within the normal variation range.";
  } else if (
    deviationPercent >=
      MAINTENANCE_THRESHOLDS.watchDeviationPercent &&
    risingIntervals >= 1
  ) {
    status = "Maintenance Recommended";

    reason =
      "Energy intensity has increased meaningfully and shows a repeated upward pattern.";
  } else {
    status = "Watch";

    reason =
      "Energy intensity has changed from the earlier baseline and should be observed for persistence.";
  }

  const evidence: string[] = [];

  evidence.push(
    `Baseline energy intensity: ${baselineEnergyPerUnit.toFixed(
      3
    )} kWh/unit.`
  );

  evidence.push(
    `Recent energy intensity: ${recentEnergyPerUnit.toFixed(
      3
    )} kWh/unit.`
  );

  evidence.push(
    `Recent intensity is ${deviationPercent >= 0 ? "+" : ""}${deviationPercent.toFixed(
      1
    )}% versus the earlier baseline.`
  );

  if (risingIntervals > 0) {
    evidence.push(
      `Energy intensity increased across ${risingIntervals} recent productive interval(s).`
    );
  }

  if (abnormalStateRecords > 0) {
    evidence.push(
      `${abnormalStateRecords} recent record(s) were observed in Idle, Downtime, or Fault state.`
    );
  }

  if (status === "Normal") {
    evidence.push(
      "No maintenance escalation is recommended from the current energy trend alone."
    );
  }

  if (status === "Watch") {
    evidence.push(
      "Continue monitoring before escalating to maintenance."
    );
  }

  if (status === "Maintenance Recommended") {
    evidence.push(
      "Maintenance inspection is recommended because the increase is persistent rather than a single small change."
    );
  }

  return {
    machine: machineRecords[0].machine,
    baselineEnergyPerUnit,
    recentEnergyPerUnit,
    deviationPercent,
    trendPercent,
    recentRecords: recentRecords.length,
    risingIntervals,
    abnormalStateRecords,
    status,
    reason,
    evidence,
  };
}


/**
 * Analyse every machine in the factory.
 */
export function analyseMaintenanceTrends(
  data: EnergyRecord[]
): MachineMaintenanceAnalysis[] {
  if (data.length === 0) {
    return [];
  }

  const machines = Array.from(
    new Set(data.map((record) => record.machine))
  );

  return machines
    .map((machine) => {
      const machineRecords = data.filter(
        (record) => record.machine === machine
      );

      return analyseMachineMaintenance(machineRecords);
    })
    .filter(
      (
        analysis
      ): analysis is MachineMaintenanceAnalysis =>
        analysis !== null
    )
    .sort(
      (a, b) =>
        b.deviationPercent - a.deviationPercent
    );
}