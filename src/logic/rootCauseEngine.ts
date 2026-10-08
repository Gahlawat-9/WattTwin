import { EnergyRecord } from "../data/csvLoader";

export interface MachineEnergyAnalysis {
  machine: string;
  process: string;

  expectedEnergy: number;
  actualEnergy: number;
  excessEnergy: number;
  deviationPercent: number;

  productionUnits: number;
  idleEnergy: number;
  downtimeEnergy: number;
  faultEnergy: number;

  primaryContributor: string;
  confidence: "High" | "Medium" | "Low" | "Insufficient Evidence";

  evidence: string[];
  explanation: string;
}

/**
 * Calculate the average energy consumption per production unit
 * for a machine during productive operation.
 */
function calculateBaselineKwhPerUnit(
  records: EnergyRecord[]
): number {
  const productiveRecords = records.filter(
    (record) =>
      record.productionUnits > 0 &&
      record.operatingState === "Running"
  );

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
 * Analyse one machine for excess energy and identify
 * the strongest observed contributing factor.
 *
 * This is deliberately rule-based and explainable.
 * It does NOT claim causal certainty.
 */
function analyseMachine(
  machineRecords: EnergyRecord[]
): MachineEnergyAnalysis | null {
  if (machineRecords.length === 0) {
    return null;
  }

  const machine = machineRecords[0].machine;
  const process = machineRecords[0].process;

  const actualEnergy = machineRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const productionUnits = machineRecords.reduce(
    (sum, record) => sum + record.productionUnits,
    0
  );

  const baselineKwhPerUnit =
    calculateBaselineKwhPerUnit(machineRecords);

  /*
   * If we cannot establish a production-based baseline,
   * we cannot responsibly calculate an energy deviation.
   */
  if (baselineKwhPerUnit <= 0 || productionUnits <= 0) {
    return null;
  }

  const expectedEnergy =
    baselineKwhPerUnit * productionUnits;

  const excessEnergy =
    actualEnergy - expectedEnergy;

  const deviationPercent =
    expectedEnergy > 0
      ? (excessEnergy / expectedEnergy) * 100
      : 0;

  /*
   * Analyse operating states.
   */
  const idleRecords = machineRecords.filter(
    (record) => record.operatingState === "Idle"
  );

  const downtimeRecords = machineRecords.filter(
    (record) => record.operatingState === "Downtime"
  );

  const faultRecords = machineRecords.filter(
    (record) => record.operatingState === "Fault"
  );

  const idleEnergy = idleRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const downtimeEnergy = downtimeRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const faultEnergy = faultRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  /*
   * Only use conditions that are actually observable
   * in the WattTwin dataset.
   */
  const candidates = [
    {
      cause: "Extended idle operation",
      energy: idleEnergy,
      records: idleRecords,
    },
    {
      cause: "Energy consumption during downtime",
      energy: downtimeEnergy,
      records: downtimeRecords,
    },
    {
      cause: "Energy consumption during fault conditions",
      energy: faultEnergy,
      records: faultRecords,
    },
  ];

  candidates.sort((a, b) => b.energy - a.energy);

  const strongestCandidate = candidates[0];

  let primaryContributor = "Insufficient evidence";

  let confidence:
    | "High"
    | "Medium"
    | "Low"
    | "Insufficient Evidence" =
    "Insufficient Evidence";

  const evidence: string[] = [];

  /*
   * Only identify a contributor when the dataset contains
   * actual evidence for that operating condition.
   */
  if (
    strongestCandidate &&
    strongestCandidate.records.length > 0 &&
    strongestCandidate.energy > 0
  ) {
    primaryContributor = strongestCandidate.cause;

    /*
     * Multiple observations provide stronger evidence,
     * but this is still an observed contributor rather
     * than proven causal inference.
     */
    if (strongestCandidate.records.length >= 2) {
      confidence = "Medium";
    } else {
      confidence = "Low";
    }

    evidence.push(
      `${strongestCandidate.records.length} record(s) show ${strongestCandidate.cause.toLowerCase()}.`
    );

    evidence.push(
      `Observed energy during this condition: ${strongestCandidate.energy.toFixed(
        2
      )} kWh.`
    );
  }

  if (idleRecords.length > 0) {
    evidence.push(
      `Idle operation occurred in ${idleRecords.length} recorded interval(s).`
    );
  }

  if (downtimeRecords.length > 0) {
    evidence.push(
      `Downtime occurred in ${downtimeRecords.length} recorded interval(s).`
    );
  }

  if (faultRecords.length > 0) {
    evidence.push(
      `Fault operation occurred in ${faultRecords.length} recorded interval(s).`
    );
  }

  if (productionUnits > 0) {
    evidence.push(
      `Total recorded production: ${productionUnits} units.`
    );
  }

  let explanation =
    "Insufficient evidence to determine the primary contributing factor.";

  if (primaryContributor !== "Insufficient evidence") {
    explanation =
      `${machine} is consuming ${Math.abs(
        deviationPercent
      ).toFixed(
        1
      )}% ${
        deviationPercent >= 0 ? "above" : "below"
      } the estimated production-based baseline. ` +
      `The strongest observed contributing factor is ${primaryContributor.toLowerCase()}. ` +
      `This conclusion is based on the operating-state and energy records available in the dataset.`;
  }

  return {
    machine,
    process,
    expectedEnergy,
    actualEnergy,
    excessEnergy,
    deviationPercent,
    productionUnits,
    idleEnergy,
    downtimeEnergy,
    faultEnergy,
    primaryContributor,
    confidence,
    evidence,
    explanation,
  };
}

/**
 * Analyse all machines and rank them by absolute excess energy.
 */

export function analyseRootCauses(
  data: EnergyRecord[]
): MachineEnergyAnalysis[] {
  const machines = Array.from(
    new Set(data.map((record) => record.machine))
  );

  const analyses = machines
    .map((machine) => {
      const machineRecords = data.filter(
        (record) => record.machine === machine
      );

      return analyseMachine(machineRecords);
    })
    .filter(
      (analysis): analysis is MachineEnergyAnalysis =>
        analysis !== null
    );

  /*
   * Rank by absolute excess energy,
   * not percentage deviation.
   */
  return analyses
    .filter((analysis) => analysis.excessEnergy > 0)
    .sort(
      (a, b) => b.excessEnergy - a.excessEnergy
    );
}


// PASTE THE NEW CODE BELOW THIS LINE

export interface FactoryEnergyAnalysis {
  expectedEnergy: number;
  actualEnergy: number;
  excessEnergy: number;
  deviationPercent: number;
  excessDetected: boolean;
}

export function analyseFactoryEnergy(
  data: EnergyRecord[],
  thresholdPercent: number = 10
): FactoryEnergyAnalysis {
  if (data.length === 0) {
    return {
      expectedEnergy: 0,
      actualEnergy: 0,
      excessEnergy: 0,
      deviationPercent: 0,
      excessDetected: false,
    };
  }

  const actualEnergy = data.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const machines = Array.from(
    new Set(data.map((record) => record.machine))
  );

  let expectedEnergy = 0;

  for (const machine of machines) {
    const machineRecords = data.filter(
      (record) => record.machine === machine
    );

    const productiveRecords = machineRecords.filter(
      (record) =>
        record.productionUnits > 0 &&
        record.operatingState === "Running"
    );

    const totalProduction = productiveRecords.reduce(
      (sum, record) => sum + record.productionUnits,
      0
    );

    const productiveEnergy = productiveRecords.reduce(
      (sum, record) => sum + record.kWh,
      0
    );

    if (totalProduction <= 0) {
      continue;
    }

    const baselineKwhPerUnit =
      productiveEnergy / totalProduction;

    const machineProduction = machineRecords.reduce(
      (sum, record) => sum + record.productionUnits,
      0
    );

    expectedEnergy +=
      baselineKwhPerUnit * machineProduction;
  }

  if (expectedEnergy <= 0) {
    return {
      expectedEnergy: 0,
      actualEnergy,
      excessEnergy: 0,
      deviationPercent: 0,
      excessDetected: false,
    };
  }

  const excessEnergy =
    actualEnergy - expectedEnergy;

  const deviationPercent =
    (excessEnergy / expectedEnergy) * 100;

  const excessDetected =
    deviationPercent >= thresholdPercent;

  return {
    expectedEnergy,
    actualEnergy,
    excessEnergy,
    deviationPercent,
    excessDetected,
  };
}