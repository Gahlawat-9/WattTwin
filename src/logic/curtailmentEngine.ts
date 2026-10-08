import { EnergyRecord } from "../data/csvLoader";

export type CurtailmentStatus =
  | "Curtailment Eligible"
  | "Curtailment Deferred"
  | "No Curtailment Required"
  | "Energy Optimization Recommended"
  | "Manual Review Required";

export interface CurtailmentAnalysis {
  machine: string;
  operatingState: string;
  status: CurtailmentStatus;
  currentEnergy: number;
  productionUnits: number;
  reason: string;
  recommendedAction: string;
  safeToCurtail: boolean;
}

export function analyseCurtailment(
  data: EnergyRecord[]
): CurtailmentAnalysis[] {
  const machines = [...new Set(data.map((record) => record.machine))];

  return machines.map((machine) => {
    const machineRecords = data.filter(
      (record) => record.machine === machine
    );

    const latestRecord = machineRecords[machineRecords.length - 1];

    if (!latestRecord) {
      return {
        machine,
        operatingState: "Unknown",
        status: "Manual Review Required",
        currentEnergy: 0,
        productionUnits: 0,
        reason: "No machine data is available.",
        recommendedAction: "Review machine data manually.",
        safeToCurtail: false,
      };
    }

    const {
      operatingState,
      kWh,
      productionUnits,
    } = latestRecord;

    if (operatingState === "Running") {
      return {
        machine,
        operatingState,
        status: "No Curtailment Required",
        currentEnergy: kWh,
        productionUnits,
        reason:
          "Machine is currently running and may be contributing to production.",
        recommendedAction:
          "Continue operation and monitor energy performance.",
        safeToCurtail: false,
      };
    }

    if (operatingState === "Fault") {
      return {
        machine,
        operatingState,
        status: "Manual Review Required",
        currentEnergy: kWh,
        productionUnits,
        reason:
          "Machine is in a fault condition. Automatic curtailment could interfere with fault handling.",
        recommendedAction:
          "Escalate for operator or maintenance review.",
        safeToCurtail: false,
      };
    }

    if (operatingState === "Downtime") {
      return {
        machine,
        operatingState,
        status: "Curtailment Deferred",
        currentEnergy: kWh,
        productionUnits,
        reason:
          "Machine is in downtime, but the reason for downtime is not known from energy data alone.",
        recommendedAction:
          "Verify machine dependency before applying any energy reduction action.",
        safeToCurtail: false,
      };
    }

    if (operatingState === "Idle") {
      return {
        machine,
        operatingState,
        status: "Curtailment Eligible",
        currentEnergy: kWh,
        productionUnits,
        reason:
          "Machine is idle and consuming energy without recorded production.",
        recommendedAction:
          "Enter an authorized simulated low-power state if no active dependency exists.",
        safeToCurtail: true,
      };
    }

    return {
      machine,
      operatingState,
      status: "Manual Review Required",
      currentEnergy: kWh,
      productionUnits,
      reason: "Machine state is not recognized by the curtailment rules.",
      recommendedAction: "Review machine state before taking action.",
      safeToCurtail: false,
    };
  });
}