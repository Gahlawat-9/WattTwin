import { EnergyRecord } from "../data/csvLoader";
import {
  MachineEnergyAnalysis,
} from "./rootCauseEngine";
import {
  MachineMaintenanceAnalysis,
} from "./maintenanceEngine";

export type ActionPriority =
  | "Low"
  | "Medium"
  | "High";

export interface ActionRecommendation {
  machine: string;
  action: string;
  reason: string;
  priority: ActionPriority;
  evidence: string[];
}


/**
 * Generate an operational recommendation from the
 * observed energy and maintenance evidence.
 *
 * This does NOT diagnose machine failure.
 * It only recommends the next inspection/action
 * supported by the available dataset evidence.
 */
function generateMachineRecommendation(
  rootCause: MachineEnergyAnalysis,
  maintenance: MachineMaintenanceAnalysis | undefined
): ActionRecommendation {
  const evidence: string[] = [];

  /*
   * Fault-related excess energy gets the highest
   * operational priority because the dataset explicitly
   * contains Fault operating-state observations.
   */
  if (rootCause.faultEnergy > 0) {
    evidence.push(
      `${rootCause.faultEnergy.toFixed(
        1
      )} kWh was consumed during Fault conditions.`
    );

    return {
      machine: rootCause.machine,
      action:
        "Inspect the machine and investigate the fault-related energy consumption.",
      reason:
        "Energy consumption was observed while the machine was in a Fault state.",
      priority: "High",
      evidence,
    };
  }

  /*
   * Downtime-related excess energy indicates that energy
   * was consumed without productive output.
   */
  if (rootCause.downtimeEnergy > 0) {
    evidence.push(
      `${rootCause.downtimeEnergy.toFixed(
        1
      )} kWh was consumed during Downtime.`
    );

    if (
      maintenance?.status === "Maintenance Recommended"
    ) {
      evidence.push(
        "The recent energy trend also shows a persistent increase."
      );

      return {
        machine: rootCause.machine,
        action:
          "Schedule a maintenance inspection and review downtime behaviour.",
        reason:
          "Downtime energy is present alongside a persistent increase in recent energy intensity.",
        priority: "High",
        evidence,
      };
    }

    return {
      machine: rootCause.machine,
      action:
        "Review downtime periods and check whether the machine can be safely stopped when production is not active.",
      reason:
        "Energy consumption was observed during non-productive downtime.",
      priority: "Medium",
      evidence,
    };
  }

  /*
   * Idle energy suggests avoidable consumption while
   * the machine is not actively producing.
   */
  if (rootCause.idleEnergy > 0) {
    evidence.push(
      `${rootCause.idleEnergy.toFixed(
        1
      )} kWh was consumed during Idle state.`
    );

    return {
      machine: rootCause.machine,
      action:
        "Review idle periods and reduce unnecessary machine runtime where operationally safe.",
      reason:
        "Energy consumption was observed during Idle operation.",
      priority: "Medium",
      evidence,
    };
  }

  /*
   * If there is a maintenance trend but no abnormal
   * operating-state energy contributor, recommend inspection.
   */
  if (
    maintenance?.status === "Maintenance Recommended"
  ) {
    evidence.push(
      `Recent energy intensity increased by ${maintenance.deviationPercent.toFixed(
        1
      )}% versus the earlier baseline.`
    );

    return {
      machine: rootCause.machine,
      action:
        "Schedule a maintenance inspection to investigate the persistent energy-intensity increase.",
      reason:
        "Recent energy behaviour shows a meaningful persistent increase.",
      priority: "Medium",
      evidence,
    };
  }

  /*
   * If no strong action signal exists, do not overreact.
   */
  evidence.push(
    "No strong maintenance or abnormal operating-state signal was identified."
  );

  return {
    machine: rootCause.machine,
    action:
      "Continue monitoring machine energy behaviour.",
    reason:
      "Current evidence does not justify immediate maintenance escalation.",
    priority: "Low",
    evidence,
  };
}


/**
 * Generate recommendations for all machines with
 * detected excess energy.
 */
export function generateActionRecommendations(
  data: EnergyRecord[],
  rootCauseAnalyses: MachineEnergyAnalysis[],
  maintenanceAnalyses: MachineMaintenanceAnalysis[]
): ActionRecommendation[] {
  if (
    data.length === 0 ||
    rootCauseAnalyses.length === 0
  ) {
    return [];
  }

  return rootCauseAnalyses.map((rootCause) => {
    const maintenance = maintenanceAnalyses.find(
      (analysis) =>
        analysis.machine === rootCause.machine
    );

    return generateMachineRecommendation(
      rootCause,
      maintenance
    );
  });
}