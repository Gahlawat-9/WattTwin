import { EnergyRecord } from "../data/csvLoader";

export interface EnergyOpportunity {
  machine: string;
  process: string;
  timestamp: string;
  operatingState: string;
  kWh: number;
  productionUnits: number;
  reason: string;
}

/**
 * Detect energy consumed while a machine is idle
 * and producing zero units.
 */
export function detectIdleEnergy(
  data: EnergyRecord[]
): EnergyOpportunity[] {
  return data
    .filter(
      (record) =>
        record.productionUnits === 0 &&
        record.operatingState === "Idle"
    )
    .map((record) => ({
      machine: record.machine,
      process: record.process,
      timestamp: record.timestamp,
      operatingState: record.operatingState,
      kWh: record.kWh,
      productionUnits: record.productionUnits,
      reason:
        "Energy consumption detected while the machine was idle with zero production output.",
    }));
}

/**
 * Detect energy consumed during downtime
 * while production output is zero.
 */
export function detectDowntimeEnergy(
  data: EnergyRecord[]
): EnergyOpportunity[] {
  return data
    .filter(
      (record) =>
        record.productionUnits === 0 &&
        record.operatingState === "Downtime"
    )
    .map((record) => ({
      machine: record.machine,
      process: record.process,
      timestamp: record.timestamp,
      operatingState: record.operatingState,
      kWh: record.kWh,
      productionUnits: record.productionUnits,
      reason:
        "Energy consumption detected during downtime with zero production output.",
    }));
}

/**
 * Detect energy consumed during machine faults.
 *
 * This is an observation, NOT automatically classified as waste.
 */
export function detectFaultEnergy(
  data: EnergyRecord[]
): EnergyOpportunity[] {
  return data
    .filter(
      (record) =>
        record.productionUnits === 0 &&
        record.operatingState === "Fault"
    )
    .map((record) => ({
      machine: record.machine,
      process: record.process,
      timestamp: record.timestamp,
      operatingState: record.operatingState,
      kWh: record.kWh,
      productionUnits: record.productionUnits,
      reason:
        "Energy consumption detected during a fault condition with zero production output.",
    }));
}

/**
 * Calculate total energy for a set of opportunities.
 */
export function calculateOpportunityEnergy(
  opportunities: EnergyOpportunity[]
): number {
  return opportunities.reduce(
    (sum, opportunity) => sum + opportunity.kWh,
    0
  );
}