import { EnergyRecord } from "../data/csvLoader";
import {
  EnergyOpportunity,
  calculateOpportunityEnergy,
} from "./anomalyEngine";

export interface OpportunityItem {
  id: string;

  priority: "High Priority" | "Medium Priority" | "Low Priority";
  priorityLevel: "high" | "medium" | "low";

  machine: string;
  machineZoneId: string;

  title: string;

  process:
    | "Compression"
    | "Drilling"
    | "Pressing"
    | "Welding"
    | "Painting"
    | "Assembly"
    | "Testing"
    | "Thermal";

  issue: string;
  observationSummary: string;

  validationStatus:
    | "Awaiting Validation"
    | "Estimated (Unverified)"
    | "Verified Saving";

  savingPerMonthINR: number;
  savingKwhMonth: number;

  baselineKwhPerUnit: number;
  actualKwhPerUnit: number;
  deviationPercent: number;

  shift: string;
  baselineMethod: string;

  assumptions: {
    idlePowerKw: number;
    avoidableMinutesPerDay: number;
    operatingDaysPerMonth: number;
    tariffINRPerKwh: number;
  };

  alternativeExplanations: {
    id: string;
    label: string;
    detail: string;
    status:
      | "Plausible — Check On Floor"
      | "Ruled Out"
      | "Confirmed Root Cause";
  }[];

  evidenceTimeline: {
    time: string;
    actualKw: number;
    expectedKw: number;
    unitsProduced: number;
    machineState:
      | "Producing"
      | "Idle — Drawing Power"
      | "Standby";
  }[];

  proposedAction: string;
  assignedRole: string;
  verificationNote: string;

  postInterventionSec?: number;
}

function mapProcess(
  process: string
): OpportunityItem["process"] {
  const mapping: Record<string, OpportunityItem["process"]> = {
    Pressing: "Pressing",
    Welding: "Welding",
    Cutting: "Testing",
    Assembly: "Assembly",
  };

  return mapping[process] ?? "Testing";
}

function buildEvidenceTimeline(
  event: EnergyOpportunity,
  data: EnergyRecord[]
): OpportunityItem["evidenceTimeline"] {
  const machineData = data.filter(
    (record) => record.machine === event.machine
  );

  return machineData.slice(-5).map((record) => ({
    time: record.timestamp,
    actualKw: record.kW,
    expectedKw:
      record.productionUnits > 0
        ? record.kW
        : Math.max(record.kW * 0.15, 1),
    unitsProduced: record.productionUnits,
    machineState:
      record.productionUnits === 0
        ? "Idle — Drawing Power"
        : "Producing",
  }));
}

function buildOpportunity(
  event: EnergyOpportunity,
  data: EnergyRecord[],
  index: number
): OpportunityItem {
  const machineData = data.filter(
    (record) => record.machine === event.machine
  );

  const productionRecords = machineData.filter(
    (record) => record.productionUnits > 0
  );

  const totalProduction = productionRecords.reduce(
    (sum, record) => sum + record.productionUnits,
    0
  );

  const totalEnergy = productionRecords.reduce(
    (sum, record) => sum + record.kWh,
    0
  );

  const actualKwhPerUnit =
    totalProduction > 0
      ? totalEnergy / totalProduction
      : 0;

  const baselineKwhPerUnit =
    actualKwhPerUnit > 0
      ? actualKwhPerUnit
      : 0;

  const deviationPercent = 0;

  const process = mapProcess(event.process);

  const priority =
    event.operatingState === "Idle"
      ? "High Priority"
      : event.operatingState === "Downtime"
      ? "Medium Priority"
      : "Low Priority";

  const priorityLevel =
    priority === "High Priority"
      ? "high"
      : priority === "Medium Priority"
      ? "medium"
      : "low";

  const idlePowerKw = event.kWh / 0.25;

  const tariff = 8;

  const estimatedMonthlyKwh =
    event.operatingState === "Idle"
      ? event.kWh * 20
      : 0;

  const estimatedMonthlyINR =
    Math.round(estimatedMonthlyKwh * tariff);

  return {
    id: `csv-energy-${index}`,

    priority,
    priorityLevel,

    machine: event.machine,
    machineZoneId: event.machine.toLowerCase().replace(/\s+/g, "-"),

    title:
      event.operatingState === "Idle"
        ? `${event.machine} consuming energy while idle`
        : event.operatingState === "Downtime"
        ? `${event.machine} consuming energy during downtime`
        : `${event.machine} consuming energy during fault`,

    process,

    issue: event.reason,

    observationSummary:
      `${event.kWh.toFixed(1)} kWh was recorded during a ` +
      `${event.operatingState.toLowerCase()} interval with zero production output.`,

    validationStatus: "Awaiting Validation",

    savingPerMonthINR: estimatedMonthlyINR,
    savingKwhMonth: Number(estimatedMonthlyKwh.toFixed(1)),

    baselineKwhPerUnit:
      Number(baselineKwhPerUnit.toFixed(3)),

    actualKwhPerUnit:
      Number(actualKwhPerUnit.toFixed(3)),

    deviationPercent,

    shift: "09:00–18:00",

    baselineMethod:
      "Calculated from the representative dataset; floor validation required before claiming savings.",

    assumptions: {
      idlePowerKw: Number(idlePowerKw.toFixed(1)),
      avoidableMinutesPerDay: 15,
      operatingDaysPerMonth: 20,
      tariffINRPerKwh: tariff,
    },

    alternativeExplanations: [
      {
        id: "alt-1",
        label: "Normal machine standby requirement",
        detail:
          "The machine may intentionally remain energized between production cycles.",
        status: "Plausible — Check On Floor",
      },
      {
        id: "alt-2",
        label: "Production or operating-state logging mismatch",
        detail:
          "Zero recorded production may not necessarily mean the machine was fully inactive.",
        status: "Plausible — Check On Floor",
      },
      {
        id: "alt-3",
        label: "Unnecessary energy consumption",
        detail:
          "Potential opportunity if the energy draw can be reduced without affecting production or equipment requirements.",
        status: "Plausible — Check On Floor",
      },
    ],

    evidenceTimeline: buildEvidenceTimeline(
      event,
      data
    ),

    proposedAction:
      "Validate the operating condition with the shop-floor team, then assess whether the machine can safely reduce energy draw during zero-output periods.",

    assignedRole:
      "Production / Energy Engineer",

    verificationNote:
      "Do not classify this as verified savings until the intervention is tested and post-change energy performance is measured.",

    postInterventionSec: actualKwhPerUnit,
  };
}

export function buildEnergyOpportunities(
  data: EnergyRecord[],
  events: EnergyOpportunity[]
): OpportunityItem[] {
  return events.map((event, index) =>
    buildOpportunity(event, data, index)
  );
}