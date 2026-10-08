import { EnergyRecord } from "../data/csvLoader";

export type VerificationStatus =
  | "Awaiting Post-Action Data"
  | "Improved"
  | "No Significant Change"
  | "Worsened"
  | "Insufficient Data";

export interface MachineVerificationAnalysis {
  machine: string;

  beforeEnergyPerUnit: number;
  afterEnergyPerUnit: number;

  changePercent: number;

  beforeRecords: number;
  afterRecords: number;

  status: VerificationStatus;

  explanation: string;
}

/**
 * Compare earlier and later productive energy behaviour
 * for a machine to determine whether an intervention
 * appears to have improved energy efficiency.
 *
 * This does NOT claim verified savings unless post-action
 * data is actually available.
 */
export function analyseVerification(
  data: EnergyRecord[],
  machine: string
): MachineVerificationAnalysis {
  const machineData = data
    .filter((record) => record.machine === machine)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );

  if (machineData.length < 6) {
    return {
      machine,
      beforeEnergyPerUnit: 0,
      afterEnergyPerUnit: 0,
      changePercent: 0,
      beforeRecords: 0,
      afterRecords: 0,
      status: "Insufficient Data",
      explanation:
        "Not enough machine records are available to establish a reliable before-and-after comparison.",
    };
  }

  const productiveRecords = machineData.filter(
    (record) =>
      record.productionUnits > 0 &&
      record.operatingState === "Running"
  );

  if (productiveRecords.length < 6) {
    return {
      machine,
      beforeEnergyPerUnit: 0,
      afterEnergyPerUnit: 0,
      changePercent: 0,
      beforeRecords: 0,
      afterRecords: 0,
      status: "Awaiting Post-Action Data",
      explanation:
        "The available data does not contain enough productive observations for a reliable post-action verification.",
    };
  }

  const splitIndex = Math.floor(
    productiveRecords.length / 2
  );

  const beforeRecords = productiveRecords.slice(
    0,
    splitIndex
  );

  const afterRecords = productiveRecords.slice(
    splitIndex
  );

  const calculateEnergyPerUnit = (
    records: EnergyRecord[]
  ): number => {
    const totalEnergy = records.reduce(
      (sum, record) => sum + record.kWh,
      0
    );

    const totalProduction = records.reduce(
      (sum, record) => sum + record.productionUnits,
      0
    );

    return totalProduction > 0
      ? totalEnergy / totalProduction
      : 0;
  };

  const beforeEnergyPerUnit =
    calculateEnergyPerUnit(beforeRecords);

  const afterEnergyPerUnit =
    calculateEnergyPerUnit(afterRecords);

  if (beforeEnergyPerUnit <= 0) {
    return {
      machine,
      beforeEnergyPerUnit: 0,
      afterEnergyPerUnit,
      changePercent: 0,
      beforeRecords: beforeRecords.length,
      afterRecords: afterRecords.length,
      status: "Insufficient Data",
      explanation:
        "A valid baseline could not be established from the available productive records.",
    };
  }

  const changePercent =
    ((afterEnergyPerUnit - beforeEnergyPerUnit) /
      beforeEnergyPerUnit) *
    100;

  let status: VerificationStatus;

  if (changePercent <= -10) {
    status = "Improved";
  } else if (changePercent >= 10) {
    status = "Worsened";
  } else {
    status = "No Significant Change";
  }

  const direction =
    changePercent < 0
      ? "decreased"
      : changePercent > 0
        ? "increased"
        : "remained stable";

  return {
    machine,
    beforeEnergyPerUnit,
    afterEnergyPerUnit,
    changePercent,
    beforeRecords: beforeRecords.length,
    afterRecords: afterRecords.length,
    status,
    explanation:
      `Energy intensity ${direction} by ${Math.abs(
        changePercent
      ).toFixed(1)}% between the earlier and later productive observations.`,
  };
}

export interface PostActionVerification {
  machine: string;

  beforeNonProductiveEnergy: number;
  afterNonProductiveEnergy: number;

  reductionKwh: number;
  reductionPercent: number;

  estimatedSavingsINR: number;
  monthlySavingsINR: number;
  annualSavingsINR: number;

  status:
    | "Improved"
    | "No Significant Change"
    | "Worsened";

  explanation: string;
}

/**
 * Compare non-productive energy before and after
 * a recommended intervention.
 *
 * The caller may provide a simulated/scenario dataset
 * when demonstrating the closed-loop workflow.
 */
export function analysePostActionVerification(
  beforeData: EnergyRecord[],
  afterData: EnergyRecord[],
  machine: string
): PostActionVerification {
  const calculateNonProductiveEnergy = (
    records: EnergyRecord[]
  ): number => {
    return records
      .filter(
        (record) =>
          record.machine === machine &&
          record.productionUnits === 0 &&
          (
            record.operatingState === "Idle" ||
            record.operatingState === "Downtime" ||
            record.operatingState === "Fault"
          )
      )
      .reduce(
        (sum, record) => sum + record.kWh,
        0
      );
  };

  const beforeNonProductiveEnergy =
    calculateNonProductiveEnergy(beforeData);

  const afterNonProductiveEnergy =
    calculateNonProductiveEnergy(afterData);

  const reductionKwh =
    beforeNonProductiveEnergy -
    afterNonProductiveEnergy;

  const reductionPercent =
    beforeNonProductiveEnergy > 0
      ? (reductionKwh / beforeNonProductiveEnergy) * 100
      : 0;

  /*
   * Energy cost assumptions
   */
  const ELECTRICITY_RATE_INR_PER_KWH = 8.12;
  const OPERATING_DAYS_PER_MONTH = 26;
  const MONTHS_PER_YEAR = 12;

  /*
   * Immediate cost impact represented by the
   * demonstrated energy reduction.
   */
  const estimatedSavingsINR =
    Math.max(0, reductionKwh) *
    ELECTRICITY_RATE_INR_PER_KWH;

  /*
   * Annualisation is based on the operating-day
   * assumption used for the scenario.
   */
  const monthlySavingsINR =
    estimatedSavingsINR *
    OPERATING_DAYS_PER_MONTH;

  const annualSavingsINR =
    monthlySavingsINR *
    MONTHS_PER_YEAR;

  let status:
    | "Improved"
    | "No Significant Change"
    | "Worsened";

  if (reductionPercent >= 10) {
    status = "Improved";
  } else if (reductionPercent <= -10) {
    status = "Worsened";
  } else {
    status = "No Significant Change";
  }

  return {
    machine,

    beforeNonProductiveEnergy,
    afterNonProductiveEnergy,

    reductionKwh,
    reductionPercent,

    estimatedSavingsINR,
    monthlySavingsINR,
    annualSavingsINR,

    status,

    explanation:
      reductionPercent >= 10
        ? `Non-productive energy decreased by ${reductionPercent.toFixed(
            1
          )}% after the recommended intervention.`
        : reductionPercent <= -10
          ? `Non-productive energy increased by ${Math.abs(
              reductionPercent
            ).toFixed(1)}% after the intervention.`
          : "Non-productive energy showed no significant change.",
  };
}