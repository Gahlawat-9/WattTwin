export type ThemeMode = 'dark' | 'light';
export type FactoryId = 'factory-01' | 'plant-a';
export type NavSectionId =
  | 'overview'
  | 'evidence-action'
  | 'machines'
  | 'energy-flow'
  | 'energy-twin'
  | 'simulator'
  | 'production'
  | 'reports';

export interface HourlyDataPoint {
  time: string;
  energyKwh: number;
  expectedEnergyKwh: number;
  productionUnits: number;
  shift: 'Shift A' | 'Shift B' | 'Shift C';
  anomalyFlag?: boolean;
  anomalyNote?: string;
}

export interface AlternativeExplanation {
  id: string;
  label: string;
  detail: string;
  status: 'Ruled Out' | 'Plausible — Check On Floor' | 'Confirmed Root Cause';
}

export interface OpportunityItem {
  id: string;
  priority: 'High Priority' | 'Medium Priority' | 'Low Priority';
  priorityLevel: 'high' | 'medium' | 'low';
  machine: string;
  machineZoneId: string;
  title: string;
  process: 'Compression' | 'Drilling' | 'Pressing' | 'Welding' | 'Painting' | 'Assembly' | 'Testing' | 'Thermal';
  issue: string;
  observationSummary: string;
  validationStatus: 'Awaiting Validation' | 'Estimated (Unverified)' | 'Verified Saving';
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
  alternativeExplanations: AlternativeExplanation[];
  evidenceTimeline: {
    time: string;
    actualKw: number;
    expectedKw: number;
    unitsProduced: number;
    machineState: 'Producing' | 'Idle — Drawing Power' | 'Standby';
  }[];
  proposedAction: string;
  assignedRole: string;
  verificationNote: string;
  postInterventionSec?: number;
}

export interface RecommendationItem {
  id: string;
  impactLabel: 'High Impact' | 'Medium Impact' | 'Quick Win';
  impactLevel: 'high' | 'medium' | 'quick';
  title: string;
  estSavingText: string;
  savingINRMonth: number;
  savingKwhMonth: number;
  confidence: number;
  ctaLabel: 'View Evidence' | 'Simulate';
  process: string;
  status: 'Identified' | 'In Trial' | 'Implemented' | 'Verified';
  verifiedSavingINR?: number;
  verificationMethod: string;
  beforeSec: number;
  afterSec: number;
  description: string;
}

export interface EquipmentStatusRow {
  id: string;
  name: string;
  zoneCode: string;
  process: 'Welding' | 'Pressing' | 'Drilling' | 'Painting' | 'Compression' | 'Assembly' | 'Testing' | 'Machining' | 'Thermal';
  status: 'Normal' | 'Alert' | 'Warning' | 'Idle';
  loadPercent: number;
  deviationPercent: number;
  powerKw: number;
  expectedKwhPerUnit: number;
  actualKwhPerUnit: number;
  unitsToday: number;
  shift: string;
  operator: string;
  temperatureC?: number;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  relativeTime: string;
  severity: 'High' | 'Medium' | 'Info' | 'Resolved';
  machine: string;
  process: string;
  acknowledged: boolean;
}

export interface ProductionBatchRecord {
  id: string;
  date: string;
  shift: 'Shift A (06:00-14:00)' | 'Shift B (14:00-22:00)' | 'Shift C (22:00-06:00)';
  productSku: string;
  process: 'Welding' | 'Pressing' | 'Drilling' | 'Painting' | 'Compression' | 'Assembly' | 'Testing';
  machineId: string;
  unitsProduced: number;
  expectedKwh: number;
  actualKwh: number;
  secActual: number;
  secExpected: number;
  deviationPercent: number;
  source: 'Excel Upload' | 'Smart Meter + Log' | 'Manual Sheet';
  notes: string;
}

export interface FactoryProfile {
  id: FactoryId;
  name: string;
  shortName: string;
  subtitle: string;
  location: string;
  dataEnvironmentLabel: string;
  demoPitchNote: string;
  baselineDefinition: string;
  tariffAssumptionText: string;
  userGreetingName: string;
  userName: string;
  userRole: string;
  userInitials: string;
  totalLoadMw: number;
  capacityUtilisation: number;
  devicesOnline: number;
  deploymentMaturity: {
    productionRecords: { name: string; status: 'connected'; detail: string };
    electricityBills: { name: string; status: 'connected'; detail: string };
    shiftRecords: { name: string; status: 'connected'; detail: string };
    machineMeters: { name: string; status: 'optional'; detail: string };
    liveIoTTelemetry: { name: string; status: 'future'; detail: string };
  };
  kpis: {
    energyConsumedKwh: number;
    energyConsumedSubtext: string;
    energyConsumedDelta: string;
    energyIntensity: number;
    baselineIntensity: number;
    energyIntensitySubtext: string;
    energyIntensityDelta: string;
    expectedVsActualDelta: string;
    energyCostINR: number;
    energyCostSubtext: string;
    energyCostDelta: string;
    opportunitiesCount: number;
    opportunitiesSubtext: string;
    carbonFootprintTco2: number;
  };
  potentialMonthlySavingINR: number;
  hourlySeries: HourlyDataPoint[];
  intensityTrend: { date: string; value: number; baseline: number }[];
  sankey: {
    totalGridKwh: number;
    productionKwh: number;
    productionPct: number;
    auxiliaryKwh: number;
    auxiliaryPct: number;
    productionNodes: { name: string; process: string; kwh: number; pct: number; expectedKwh: number; color: string }[];
    auxiliaryNodes: { name: string; process: string; kwh: number; pct: number; expectedKwh: number; color: string }[];
  };
  topConsumers: { name: string; sharePct: number; kwh: number; status: 'normal' | 'alert' | 'other' }[];
  opportunities: OpportunityItem[];
  recommendations: RecommendationItem[];
  equipmentList: EquipmentStatusRow[];
  alerts: AlertItem[];
  productionBatches: ProductionBatchRecord[];
}

export const FACTORIES: Record<FactoryId, FactoryProfile> = {
  'factory-01': {
    id: 'factory-01',
    name: 'Factory 01 – Pune',
    shortName: 'Factory 01',
    subtitle: 'Precision Auto & Stamping Division',
    location: 'Chakan MIDC, Pune',
    dataEnvironmentLabel: '',
    demoPitchNote: '',
    baselineDefinition: 'Expected kWh = Standby Base Load + (Good Units × Historical SKU SEC over 14 reference shifts)',
    tariffAssumptionText: 'Illustrative industrial tariff @ ₹7.98/kWh flat energy charge (excludes demand penalty)',
    userGreetingName: 'Factory 01',
    userName: 'Priyanshi P.',
    userRole: 'Energy Lead',
    userInitials: 'PP',
    totalLoadMw: 1.2,
    capacityUtilisation: 68,
    devicesOnline: 14,
    deploymentMaturity: {
      productionRecords: { name: 'Production records', status: 'connected', detail: 'Excel / ERP batch logs' },
      electricityBills: { name: 'Electricity bills', status: 'connected', detail: 'Utility tariff & monthly bills' },
      shiftRecords: { name: 'Shift records', status: 'connected', detail: 'Handover & downtime sheets' },
      machineMeters: { name: 'Machine-level meters', status: 'optional', detail: 'Optional · partial demo meters' },
      liveIoTTelemetry: { name: 'Live IoT telemetry', status: 'future', detail: 'Future · not required on day one' },
    },
    kpis: {
      energyConsumedKwh: 2848,
      energyConsumedSubtext: 'Daily total · simulated demo data',
      energyConsumedDelta: '4.8%',
      energyIntensity: 2.78,
      baselineIntensity: 2.91,
      energyIntensitySubtext: 'Normalised by output',
      energyIntensityDelta: '4.5%',
      expectedVsActualDelta: '+4.5% vs baseline',
      energyCostINR: 22720,
      energyCostSubtext: 'Illustrative tariff calculation (@ ₹7.98/kWh)',
      energyCostDelta: '3.2%',
      opportunitiesCount: 3,
      opportunitiesSubtext: 'Pending investigation · 2 unvalidated, 1 verified',
      carbonFootprintTco2: 2.25,
    },
    potentialMonthlySavingINR: 4280,
    hourlySeries: [
      { time: '00:00', energyKwh: 190, expectedEnergyKwh: 198, productionUnits: 72, shift: 'Shift C' },
      { time: '02:00', energyKwh: 210, expectedEnergyKwh: 215, productionUnits: 80, shift: 'Shift C' },
      { time: '04:00', energyKwh: 225, expectedEnergyKwh: 222, productionUnits: 84, shift: 'Shift C' },
      { time: '06:00', energyKwh: 240, expectedEnergyKwh: 235, productionUnits: 88, shift: 'Shift A' },
      {
        time: '08:00',
        energyKwh: 295,
        expectedEnergyKwh: 242,
        productionUnits: 85,
        shift: 'Shift A',
        anomalyFlag: true,
        anomalyNote: 'Compressor C1 drew 19.8 kW during 42-min zero-production window',
      },
      {
        time: '10:00',
        energyKwh: 340,
        expectedEnergyKwh: 292,
        productionUnits: 105,
        shift: 'Shift A',
        anomalyFlag: true,
        anomalyNote: 'CNC Machine 02 specific energy +24% above baseline on SKU-AX204',
      },
      { time: '12:00', energyKwh: 265, expectedEnergyKwh: 260, productionUnits: 95, shift: 'Shift A' },
      { time: '14:00', energyKwh: 270, expectedEnergyKwh: 275, productionUnits: 100, shift: 'Shift B' },
      { time: '16:00', energyKwh: 280, expectedEnergyKwh: 288, productionUnits: 104, shift: 'Shift B' },
      { time: '18:00', energyKwh: 258, expectedEnergyKwh: 268, productionUnits: 98, shift: 'Shift B' },
      { time: '20:00', energyKwh: 275, expectedEnergyKwh: 282, productionUnits: 103, shift: 'Shift B' },
    ],
    intensityTrend: [
      { date: '24 Sep', value: 3.05, baseline: 2.91 },
      { date: '25 Sep', value: 2.98, baseline: 2.91 },
      { date: '26 Sep', value: 2.92, baseline: 2.91 },
      { date: '27 Sep', value: 2.89, baseline: 2.91 },
      { date: '28 Sep', value: 2.86, baseline: 2.91 },
      { date: '29 Sep', value: 2.81, baseline: 2.91 },
      { date: '30 Sep', value: 2.78, baseline: 2.91 },
    ],
    sankey: {
      totalGridKwh: 2848,
      productionKwh: 1822,
      productionPct: 64,
      auxiliaryKwh: 1026,
      auxiliaryPct: 36,
      productionNodes: [
        { name: 'CNC Machines', process: 'Drilling & Machining', kwh: 456, pct: 16, expectedKwh: 390, color: '#10b981' },
        { name: 'Furnace F-01', process: 'Thermal & Welding', kwh: 911, pct: 32, expectedKwh: 855, color: '#06b6d4' },
        { name: 'Hydraulic Press', process: 'Stamping & Pressing', kwh: 455, pct: 16, expectedKwh: 465, color: '#3b82f6' },
      ],
      auxiliaryNodes: [
        { name: 'Compressor C1/C2', process: 'Pneumatic Ring Main', kwh: 626, pct: 22, expectedKwh: 510, color: '#6366f1' },
        { name: 'HVAC & Paint Aux', process: 'Ventilation & Cure', kwh: 400, pct: 14, expectedKwh: 395, color: '#8b5cf6' },
      ],
    },
    topConsumers: [
      { name: 'Furnace F-01 (Thermal)', sharePct: 32, kwh: 911, status: 'normal' },
      { name: 'Compressor C1/C2 (Air)', sharePct: 22, kwh: 626, status: 'alert' },
      { name: 'CNC Machines (01-04)', sharePct: 16, kwh: 456, status: 'alert' },
      { name: 'Hydraulic Press P1', sharePct: 16, kwh: 455, status: 'normal' },
      { name: 'HVAC & Assembly/Test', sharePct: 14, kwh: 400, status: 'other' },
    ],
    opportunities: [
      {
        id: 'opp-1',
        priority: 'High Priority',
        priorityLevel: 'high',
        machine: 'Compressor C1',
        machineZoneId: 'zone-comp',
        title: 'Compressor C1',
        process: 'Compression',
        issue: 'Energy use is 35% above baseline',
        observationSummary:
          'Illustrative finding: energy draw continues during periods with no recorded production. Confirm whether this is necessary standby operation.',
        validationStatus: 'Awaiting Validation',
        savingPerMonthINR: 1240,
        savingKwhMonth: 155,
        baselineKwhPerUnit: 0.23,
        actualKwhPerUnit: 0.31,
        deviationPercent: 34.8,
        shift: 'Shift A (08:45 – 09:27 AM)',
        baselineMethod: 'Time-aligned sub-meter kW vs Press Line optical stroke counter & shift Excel sheet',
        assumptions: {
          idlePowerKw: 19.8,
          avoidableMinutesPerDay: 30,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'alt-exp-1',
            label: 'Necessary standby / receiver pressure maintenance',
            detail: 'Air receiver tank may require pressure maintenance for downstream safety valves or paint booth purge.',
            status: 'Plausible — Check On Floor',
          },
          {
            id: 'alt-exp-2',
            label: 'Missing or delayed production records in Excel sheet',
            detail: 'Operator may have produced trial stampings during die setup that were not logged in the Shift A sheet.',
            status: 'Ruled Out',
          },
          {
            id: 'alt-exp-3',
            label: 'Pneumatic ring-main leak keeping compressor loaded',
            detail: 'Background leak in stamping manifold causing compressor to cycle under load during break.',
            status: 'Plausible — Check On Floor',
          },
          {
            id: 'alt-exp-4',
            label: 'Avoidable idle operation during shift handover / tea break',
            detail: 'Compressor auto-unload timer is currently set to 45 min instead of 10 min.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '08:30', actualKw: 22.4, expectedKw: 22.0, unitsProduced: 45, machineState: 'Producing' },
          { time: '08:45', actualKw: 19.8, expectedKw: 3.5, unitsProduced: 0, machineState: 'Idle — Drawing Power' },
          { time: '09:00', actualKw: 19.6, expectedKw: 3.5, unitsProduced: 0, machineState: 'Idle — Drawing Power' },
          { time: '09:15', actualKw: 19.9, expectedKw: 3.5, unitsProduced: 0, machineState: 'Idle — Drawing Power' },
          { time: '09:30', actualKw: 23.1, expectedKw: 22.5, unitsProduced: 48, machineState: 'Producing' },
        ],
        proposedAction:
          'Inspect Compressor C1 unload timer with the utility engineer and test reducing auto-standby delay from 45 min to 10 min during Shift A die changeovers.',
        assignedRole: 'Utility & Maintenance Engineer',
        verificationNote:
          'Compare compressor kWh per good stamped unit over 5 shifts post-timer adjustment against the Sep 1–23 baseline (0.23 kWh/unit).',
      },
      {
        id: 'opp-2',
        priority: 'Medium Priority',
        priorityLevel: 'medium',
        machine: 'CNC Machine 02',
        machineZoneId: 'zone-cnc',
        title: 'CNC Machine 02 — 24% above baseline energy per unit',
        process: 'Drilling',
        issue: '0.52 kWh/unit actual vs 0.42 kWh/unit SKU baseline',
        observationSummary:
          'During Batch SKU-AX204 (Axle Flange Drilling), CNC-02 consumed 24% more electricity per good part than the historical baseline for the same SKU.',
        validationStatus: 'Estimated (Unverified)',
        savingPerMonthINR: 860,
        savingKwhMonth: 108,
        baselineKwhPerUnit: 0.42,
        actualKwhPerUnit: 0.52,
        deviationPercent: 24.0,
        shift: 'Shift A (09:30 – 11:30 AM)',
        baselineMethod: 'SKU-specific linear regression (SKU-AX204 across 12 prior batches, R² = 0.89)',
        assumptions: {
          idlePowerKw: 14.2,
          avoidableMinutesPerDay: 25,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'cnc-exp-1',
            label: 'Harder raw forging batch material hardness',
            detail: 'Supplier batch #F-882 may have higher Brinell hardness requiring higher spindle torque.',
            status: 'Plausible — Check On Floor',
          },
          {
            id: 'cnc-exp-2',
            label: 'Rework or scrap units excluded from good output count',
            detail: 'If 18 rejected units were drilled but omitted from good count, apparent SEC rises.',
            status: 'Ruled Out',
          },
          {
            id: 'cnc-exp-3',
            label: 'Worn carbide drill insert (>1,100 holes)',
            detail: 'Spindle current rose progressively after tool life counter passed 1,100 cycles.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '09:00', actualKw: 14.2, expectedKw: 13.8, unitsProduced: 32, machineState: 'Producing' },
          { time: '09:30', actualKw: 17.4, expectedKw: 14.0, unitsProduced: 33, machineState: 'Producing' },
          { time: '10:00', actualKw: 18.1, expectedKw: 14.4, unitsProduced: 34, machineState: 'Producing' },
          { time: '10:30', actualKw: 18.5, expectedKw: 14.2, unitsProduced: 33, machineState: 'Producing' },
          { time: '11:00', actualKw: 17.9, expectedKw: 14.0, unitsProduced: 32, machineState: 'Producing' },
        ],
        proposedAction:
          'Verify tool insert wear log on CNC-02 with the machine shop supervisor and cap insert life at 1,000 cycles for SKU-AX204.',
        assignedRole: 'Machine Shop Supervisor',
        verificationNote:
          'Measure kWh/good flange on the next 200-unit batch of SKU-AX204 following tool replacement.',
      },
      {
        id: 'opp-3',
        priority: 'Low Priority',
        priorityLevel: 'low',
        machine: 'Furnace F-01',
        machineZoneId: 'zone-furnace',
        title: 'Furnace F-01 — holding temperature above SKU recipe',
        process: 'Thermal',
        issue: 'Running at 845°C vs 815°C specification for light-gauge batch',
        observationSummary:
          'Holding zone temperature remained at 845°C after transitioning from heavy-gauge to light-gauge brackets (SKU-CH110), increasing thermal standby losses by ~10.9%.',
        validationStatus: 'Verified Saving',
        savingPerMonthINR: 640,
        savingKwhMonth: 80,
        baselineKwhPerUnit: 0.64,
        actualKwhPerUnit: 0.71,
        deviationPercent: 10.9,
        shift: 'Shift A & B Continuous',
        baselineMethod: 'Thermocouple log + batch weight normalization (kWh per kg heat-treated)',
        assumptions: {
          idlePowerKw: 12.0,
          avoidableMinutesPerDay: 20,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'fur-exp-1',
            label: 'Intentional pre-heat for upcoming heavy batch',
            detail: 'Operator may have kept furnace at 845°C anticipating a heavy-gauge batch in Shift B.',
            status: 'Ruled Out',
          },
          {
            id: 'fur-exp-2',
            label: 'Manual setpoint not updated at SKU changeover',
            detail: 'Furnace HMI setpoint requires manual adjustment when switching bracket thickness.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '07:00', actualKw: 46.0, expectedKw: 41.5, unitsProduced: 62, machineState: 'Producing' },
          { time: '08:00', actualKw: 46.8, expectedKw: 42.0, unitsProduced: 64, machineState: 'Producing' },
          { time: '09:00', actualKw: 47.2, expectedKw: 42.2, unitsProduced: 65, machineState: 'Producing' },
          { time: '10:00', actualKw: 46.5, expectedKw: 41.8, unitsProduced: 63, machineState: 'Producing' },
          { time: '11:00', actualKw: 41.9, expectedKw: 41.5, unitsProduced: 62, machineState: 'Producing' },
        ],
        proposedAction:
          'Attach SKU temperature lookup card to Furnace F-01 control panel and log setpoint at each batch start.',
        assignedRole: 'Heat Treat Operator',
        verificationNote:
          'Verified post-adjustment: SEC returned from 0.71 to 0.64 kWh/unit after 10:45 AM setpoint correction.',
        postInterventionSec: 0.64,
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        impactLabel: 'High Impact',
        impactLevel: 'high',
        title: 'Investigate Compressor C1 idle runtime during shift handover',
        estSavingText: '₹1,240/month (Est.)',
        savingINRMonth: 1240,
        savingKwhMonth: 155,
        confidence: 87,
        ctaLabel: 'View Evidence',
        process: 'Compression',
        status: 'Identified',
        verificationMethod: 'Baseline SEC Regression vs Shift Handover Meter Log',
        beforeSec: 0.31,
        afterSec: 0.23,
        description: 'Compressor C1 draws 19.8 kW during 42-minute zero-production window. Requires engineer check to rule out downstream air purge requirements.',
      },
      {
        id: 'rec-2',
        impactLabel: 'Medium Impact',
        impactLevel: 'medium',
        title: 'Inspect CNC-02 drill insert wear on SKU-AX204',
        estSavingText: '₹860/month (Est.)',
        savingINRMonth: 860,
        savingKwhMonth: 108,
        confidence: 78,
        ctaLabel: 'View Evidence',
        process: 'Drilling',
        status: 'In Trial',
        verificationMethod: 'SKU-AX204 Batch SEC Comparison',
        beforeSec: 0.52,
        afterSec: 0.42,
        description: 'Specific energy rose 24% above SKU baseline after 1,100 holes.',
      },
      {
        id: 'rec-3',
        impactLabel: 'Quick Win',
        impactLevel: 'quick',
        title: 'Align Furnace F-01 holding temperature to SKU gauge',
        estSavingText: '₹640/month (Verified)',
        savingINRMonth: 640,
        savingKwhMonth: 80,
        confidence: 92,
        ctaLabel: 'Simulate',
        process: 'Thermal / Welding',
        status: 'Verified',
        verifiedSavingINR: 640,
        verificationMethod: 'Before/After Batch SEC Normalization',
        beforeSec: 0.71,
        afterSec: 0.64,
        description: 'Lowering holding zone from 845°C to 815°C on light-gauge batches reduced consumption to 0.64 kWh/unit.',
      },
    ],
    equipmentList: [
      { id: 'eq-3', name: 'Compressor C1', zoneCode: 'Z-01', process: 'Compression', status: 'Alert', loadPercent: 68, deviationPercent: 35, powerKw: 19.8, expectedKwhPerUnit: 0.23, actualKwhPerUnit: 0.31, unitsToday: 600, shift: 'Shift A', operator: 'Auto-PLC', temperatureC: 72 },
      { id: 'eq-2', name: 'CNC Machine 02', zoneCode: 'Z-02', process: 'Drilling', status: 'Alert', loadPercent: 78, deviationPercent: 24, powerKw: 18.1, expectedKwhPerUnit: 0.42, actualKwhPerUnit: 0.52, unitsToday: 162, shift: 'Shift A', operator: 'S. Kulkarni', temperatureC: 58 },
      { id: 'eq-4', name: 'Furnace F-01', zoneCode: 'Z-03', process: 'Thermal', status: 'Warning', loadPercent: 82, deviationPercent: 11, powerKw: 46.5, expectedKwhPerUnit: 0.64, actualKwhPerUnit: 0.71, unitsToday: 310, shift: 'Shift A', operator: 'M. Patil', temperatureC: 845 },
      { id: 'eq-1', name: 'CNC Machine 01', zoneCode: 'Z-02', process: 'Drilling', status: 'Normal', loadPercent: 64, deviationPercent: -2, powerKw: 13.8, expectedKwhPerUnit: 0.42, actualKwhPerUnit: 0.41, unitsToday: 185, shift: 'Shift A', operator: 'R. Deshmukh', temperatureC: 44 },
      { id: 'eq-5', name: 'Hydraulic Press P1', zoneCode: 'Z-04', process: 'Pressing', status: 'Normal', loadPercent: 71, deviationPercent: -3, powerKw: 24.2, expectedKwhPerUnit: 0.34, actualKwhPerUnit: 0.33, unitsToday: 290, shift: 'Shift A', operator: 'A. Jadhav', temperatureC: 49 },
      { id: 'eq-6', name: 'Spot Welder W-04', zoneCode: 'Z-05', process: 'Welding', status: 'Normal', loadPercent: 58, deviationPercent: -1, powerKw: 16.4, expectedKwhPerUnit: 0.28, actualKwhPerUnit: 0.28, unitsToday: 240, shift: 'Shift A', operator: 'V. Shinde', temperatureC: 52 },
      { id: 'eq-7', name: 'Paint Cure Booth', zoneCode: 'Z-06', process: 'Painting', status: 'Normal', loadPercent: 62, deviationPercent: -4, powerKw: 15.0, expectedKwhPerUnit: 0.19, actualKwhPerUnit: 0.18, unitsToday: 300, shift: 'Shift A', operator: 'K. More', temperatureC: 65 },
      { id: 'eq-8', name: 'Assembly & EOL Rig', zoneCode: 'Z-07', process: 'Assembly', status: 'Normal', loadPercent: 54, deviationPercent: -2, powerKw: 8.4, expectedKwhPerUnit: 0.14, actualKwhPerUnit: 0.14, unitsToday: 600, shift: 'Shift A', operator: 'P. Pawar', temperatureC: 36 },
    ],
    alerts: [
      {
        id: 'alt-1',
        title: 'Compressor C1 power draw during zero production',
        description: '19.8 kW load recorded for 42 min while Press Line output was 0 units.',
        time: '09:15 AM',
        relativeTime: '1h ago',
        severity: 'High',
        machine: 'Compressor C1',
        process: 'Compression',
        acknowledged: false,
      },
      {
        id: 'alt-2',
        title: 'CNC-02 energy intensity +24% vs SKU baseline',
        description: '0.52 kWh/unit vs 0.42 expected during Flange Drilling batch SKU-AX204.',
        time: '10:42 AM',
        relativeTime: '25m ago',
        severity: 'Medium',
        machine: 'CNC Machine 02',
        process: 'Drilling',
        acknowledged: false,
      },
      {
        id: 'alt-3',
        title: 'Furnace F-01 setpoint verified & resolved',
        description: 'Setpoint lowered from 845°C to 815°C; SEC returned to 0.64 kWh/unit.',
        time: '10:50 AM',
        relativeTime: '15m ago',
        severity: 'Resolved',
        machine: 'Furnace F-01',
        process: 'Thermal',
        acknowledged: true,
      },
    ],
    productionBatches: [
      {
        id: 'batch-102',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-CH110 (Chassis Bracket)',
        process: 'Compression',
        machineId: 'Compressor C1',
        unitsProduced: 600,
        expectedKwh: 138.0,
        actualKwh: 186.0,
        secActual: 0.31,
        secExpected: 0.23,
        deviationPercent: 34.8,
        source: 'Smart Meter + Log',
        notes: '42 min power draw during zero-production window',
      },
      {
        id: 'batch-101',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-AX204 (Axle Flange)',
        process: 'Drilling',
        machineId: 'CNC Machine 02',
        unitsProduced: 162,
        expectedKwh: 68.0,
        actualKwh: 84.2,
        secActual: 0.52,
        secExpected: 0.42,
        deviationPercent: 24.0,
        source: 'Excel Upload',
        notes: 'Higher spindle torque after 1,100 holes',
      },
      {
        id: 'batch-103',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-CH110 (Chassis Bracket)',
        process: 'Pressing',
        machineId: 'Hydraulic Press P1',
        unitsProduced: 290,
        expectedKwh: 98.6,
        actualKwh: 95.7,
        secActual: 0.33,
        secExpected: 0.34,
        deviationPercent: -2.9,
        source: 'Excel Upload',
        notes: 'Contiguous batch run — within expected baseline',
      },
      {
        id: 'batch-104',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-WD309 (Subframe Assy)',
        process: 'Welding',
        machineId: 'Spot Welder W-04',
        unitsProduced: 240,
        expectedKwh: 67.2,
        actualKwh: 66.5,
        secActual: 0.28,
        secExpected: 0.28,
        deviationPercent: -1.0,
        source: 'Manual Sheet',
        notes: 'Within expected baseline band',
      },
      {
        id: 'batch-105',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-PT502 (Powder Coat Frame)',
        process: 'Painting',
        machineId: 'Paint Cure Booth',
        unitsProduced: 300,
        expectedKwh: 57.0,
        actualKwh: 54.0,
        secActual: 0.18,
        secExpected: 0.19,
        deviationPercent: -5.3,
        source: 'Excel Upload',
        notes: 'Batch hanger density increased by 12%',
      },
      {
        id: 'batch-106',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-AS900 (Final Gear Housing)',
        process: 'Assembly',
        machineId: 'Assembly & EOL Rig',
        unitsProduced: 600,
        expectedKwh: 84.0,
        actualKwh: 82.8,
        secActual: 0.14,
        secExpected: 0.14,
        deviationPercent: -1.4,
        source: 'Excel Upload',
        notes: 'Includes automated pressure leak testing',
      },
    ],
  },

  'plant-a': {
    id: 'plant-a',
    name: 'Plant A – Production Unit 01',
    shortName: 'Plant A',
    subtitle: 'Production Unit 01 · Heavy Machining',
    location: 'Pimpri Industrial Belt, Pune',
    dataEnvironmentLabel: '',
    demoPitchNote: '',
    baselineDefinition: 'Expected kWh = Line Standby + (Units × SKU Baseline SEC over 30-day rolling window)',
    tariffAssumptionText: 'Illustrative tariff @ ₹8.00/kWh flat industrial energy rate',
    userGreetingName: 'John',
    userName: 'John Doe',
    userRole: 'Plant Manager',
    userInitials: 'JD',
    totalLoadMw: 2.4,
    capacityUtilisation: 74,
    devicesOnline: 22,
    deploymentMaturity: {
      productionRecords: { name: 'Production records', status: 'connected', detail: 'Excel / ERP batch logs' },
      electricityBills: { name: 'Electricity bills', status: 'connected', detail: 'Monthly utility bills' },
      shiftRecords: { name: 'Shift records', status: 'connected', detail: 'Digital shift logbooks' },
      machineMeters: { name: 'Machine-level meters', status: 'optional', detail: 'Optional · partial demo meters' },
      liveIoTTelemetry: { name: 'Live IoT telemetry', status: 'future', detail: 'Future · not required on day one' },
    },
    kpis: {
      energyConsumedKwh: 2840,
      energyConsumedSubtext: 'Daily total · simulated demo data',
      energyConsumedDelta: '4.8%',
      energyIntensity: 2.78,
      baselineIntensity: 2.91,
      energyIntensitySubtext: 'Normalised by output',
      energyIntensityDelta: '4.5%',
      expectedVsActualDelta: '+4.5% vs baseline',
      energyCostINR: 22720,
      energyCostSubtext: 'Illustrative tariff calculation (@ ₹8.00/kWh)',
      energyCostDelta: '3.2%',
      opportunitiesCount: 3,
      opportunitiesSubtext: 'Pending investigation · 2 unvalidated, 1 verified',
      carbonFootprintTco2: 2.24,
    },
    potentialMonthlySavingINR: 6840,
    hourlySeries: [
      { time: '00:00', energyKwh: 192, expectedEnergyKwh: 201, productionUnits: 86, shift: 'Shift C' },
      { time: '02:00', energyKwh: 205, expectedEnergyKwh: 212, productionUnits: 87, shift: 'Shift C' },
      { time: '04:00', energyKwh: 239, expectedEnergyKwh: 248, productionUnits: 106, shift: 'Shift C' },
      { time: '06:00', energyKwh: 268, expectedEnergyKwh: 278, productionUnits: 121, shift: 'Shift A' },
      {
        time: '08:00',
        energyKwh: 312,
        expectedEnergyKwh: 254,
        productionUnits: 92,
        shift: 'Shift A',
        anomalyFlag: true,
        anomalyNote: 'M-07 Motor 23% above expected range during coil feed pause',
      },
      {
        time: '10:00',
        energyKwh: 288,
        expectedEnergyKwh: 259,
        productionUnits: 102,
        shift: 'Shift A',
        anomalyFlag: true,
        anomalyNote: 'Line 02 SEC +9.2% above baseline for current batch size',
      },
    ],
    intensityTrend: [
      { date: '24 Sep', value: 3.12, baseline: 2.91 },
      { date: '25 Sep', value: 3.04, baseline: 2.91 },
      { date: '26 Sep', value: 2.96, baseline: 2.91 },
      { date: '27 Sep', value: 2.94, baseline: 2.91 },
      { date: '28 Sep', value: 2.95, baseline: 2.91 },
      { date: '29 Sep', value: 2.84, baseline: 2.91 },
      { date: '30 Sep', value: 2.78, baseline: 2.91 },
    ],
    sankey: {
      totalGridKwh: 2840,
      productionKwh: 1960,
      productionPct: 69,
      auxiliaryKwh: 880,
      auxiliaryPct: 31,
      productionNodes: [
        { name: 'M-07 (Motor)', process: 'Heavy Pressing & Drive', kwh: 682, pct: 24, expectedKwh: 563, color: '#10b981' },
        { name: 'Line 02', process: 'Welding & Drilling', kwh: 511, pct: 18, expectedKwh: 468, color: '#06b6d4' },
        { name: 'Line 01', process: 'Precision Assembly', kwh: 341, pct: 12, expectedKwh: 355, color: '#3b82f6' },
      ],
      auxiliaryNodes: [
        { name: 'Compressor 1', process: 'Pneumatic Ring Main', kwh: 426, pct: 15, expectedKwh: 440, color: '#6366f1' },
        { name: 'Others (HVAC/Test)', process: 'Paint, Testing & Aux', kwh: 880, pct: 31, expectedKwh: 890, color: '#8b5cf6' },
      ],
    },
    topConsumers: [
      { name: 'M-07 (Motor)', sharePct: 24, kwh: 682, status: 'alert' },
      { name: 'Line 02', sharePct: 18, kwh: 511, status: 'normal' },
      { name: 'Compressor 1', sharePct: 15, kwh: 426, status: 'normal' },
      { name: 'Line 01', sharePct: 12, kwh: 341, status: 'normal' },
      { name: 'Others', sharePct: 31, kwh: 880, status: 'other' },
    ],
    opportunities: [
      {
        id: 'pa-opp-1',
        priority: 'High Priority',
        priorityLevel: 'high',
        machine: 'M-07 (Motor)',
        machineZoneId: 'zone-comp',
        title: 'M-07 (Motor)',
        process: 'Pressing',
        issue: 'Energy use is 21% above baseline',
        observationSummary:
          'Illustrative finding: energy draw continues during periods with no recorded production. Confirm whether flywheel idle rotation is required.',
        validationStatus: 'Awaiting Validation',
        savingPerMonthINR: 3120,
        savingKwhMonth: 390,
        baselineKwhPerUnit: 0.54,
        actualKwhPerUnit: 0.66,
        deviationPercent: 21.0,
        shift: 'Shift A (07:30 – 10:30 AM)',
        baselineMethod: 'Sub-meter kW vs Stamping Counter Log (15-min intervals)',
        assumptions: {
          idlePowerKw: 32.0,
          avoidableMinutesPerDay: 35,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'pa-exp-1',
            label: 'Flywheel momentum retention required between coils',
            detail: 'Stopping main drive during <5 min pauses may cause higher restart inrush.',
            status: 'Plausible — Check On Floor',
          },
          {
            id: 'pa-exp-2',
            label: 'Unlogged trial stampings during die alignment',
            detail: 'Check with operator K. Joshi if test strokes occurred between 08:00 and 08:45.',
            status: 'Ruled Out',
          },
          {
            id: 'pa-exp-3',
            label: 'VFD sleep timer disabled after maintenance reset',
            detail: 'Drive stayed at 100% RPM during 28-minute crane wait for steel coil.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '07:30', actualKw: 48.0, expectedKw: 39.5, unitsProduced: 72, machineState: 'Producing' },
          { time: '08:00', actualKw: 49.2, expectedKw: 12.0, unitsProduced: 0, machineState: 'Idle — Drawing Power' },
          { time: '08:30', actualKw: 47.8, expectedKw: 12.0, unitsProduced: 0, machineState: 'Idle — Drawing Power' },
          { time: '09:00', actualKw: 50.1, expectedKw: 40.5, unitsProduced: 75, machineState: 'Producing' },
          { time: '09:30', actualKw: 48.9, expectedKw: 39.8, unitsProduced: 73, machineState: 'Producing' },
        ],
        proposedAction:
          'Review M-07 VFD sleep parameter with plant electrical engineer; set auto-standby after 5 minutes of zero press strokes.',
        assignedRole: 'Plant Electrical Engineer',
        verificationNote:
          'Compare M-07 kWh per good stamping across 7 shifts post-parameter change.',
      },
      {
        id: 'pa-opp-2',
        priority: 'Medium Priority',
        priorityLevel: 'medium',
        machine: 'Line 02',
        machineZoneId: 'zone-cnc',
        title: 'Line 02 — 9.2% higher energy intensity than Line 01',
        process: 'Welding',
        issue: '0.96 kWh/unit vs 0.88 expected baseline',
        observationSummary:
          'Line 02 is operating 9.2% above expected energy per unit for current batch volume compared to parallel Line 01.',
        validationStatus: 'Estimated (Unverified)',
        savingPerMonthINR: 2180,
        savingKwhMonth: 272,
        baselineKwhPerUnit: 0.88,
        actualKwhPerUnit: 0.96,
        deviationPercent: 9.2,
        shift: 'Shift A (06:00 – 10:42 AM)',
        baselineMethod: 'Parallel Line SEC Comparison for identical SKU-WL400',
        assumptions: {
          idlePowerKw: 18.5,
          avoidableMinutesPerDay: 30,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'l2-exp-1',
            label: 'Smaller sub-batch size causing frequent fixture warm-ups',
            detail: 'Line 02 ran 4 short batches vs 1 continuous batch on Line 01.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '06:30', actualKw: 62.0, expectedKw: 57.0, unitsProduced: 64, machineState: 'Producing' },
          { time: '07:30', actualKw: 64.5, expectedKw: 58.8, unitsProduced: 67, machineState: 'Producing' },
          { time: '08:30', actualKw: 63.8, expectedKw: 58.2, unitsProduced: 66, machineState: 'Producing' },
          { time: '09:30', actualKw: 65.1, expectedKw: 59.5, unitsProduced: 68, machineState: 'Producing' },
        ],
        proposedAction: 'Consolidate short SKU-WL400 batches onto Line 01 to save ~84 kWh/day.',
        assignedRole: 'Production Planner',
        verificationNote: 'Track combined Line 01 + Line 02 SEC per good weldment.',
      },
      {
        id: 'pa-opp-3',
        priority: 'Low Priority',
        priorityLevel: 'low',
        machine: 'Compressor 1',
        machineZoneId: 'zone-furnace',
        title: 'Compressor 1 — Verified leak repair savings holding steady',
        process: 'Compression',
        issue: '4% below baseline after coupler replacement',
        observationSummary:
          'Following pneumatic quick-coupler replacement last week, Compressor 1 specific energy dropped from 0.38 to 0.36 kWh/unit.',
        validationStatus: 'Verified Saving',
        savingPerMonthINR: 1540,
        savingKwhMonth: 192,
        baselineKwhPerUnit: 0.38,
        actualKwhPerUnit: 0.36,
        deviationPercent: -4.0,
        shift: 'All Shifts',
        baselineMethod: 'IPMVP Option C Baseline-Adjusted SEC Verification',
        assumptions: {
          idlePowerKw: 11.0,
          avoidableMinutesPerDay: 35,
          operatingDaysPerMonth: 26,
          tariffINRPerKwh: 8.0,
        },
        alternativeExplanations: [
          {
            id: 'c1-exp-1',
            label: 'Verified reduction in ring-main pressure drop',
            detail: 'Confirmed by night-shift static pressure decay test.',
            status: 'Confirmed Root Cause',
          },
        ],
        evidenceTimeline: [
          { time: '06:00', actualKw: 38.0, expectedKw: 39.5, unitsProduced: 105, machineState: 'Producing' },
          { time: '08:00', actualKw: 40.1, expectedKw: 41.8, unitsProduced: 112, machineState: 'Producing' },
          { time: '10:00', actualKw: 37.5, expectedKw: 39.0, unitsProduced: 104, machineState: 'Producing' },
        ],
        proposedAction: 'Maintain monthly ultrasonic leak check across stamping drops.',
        assignedRole: 'Utility Lead',
        verificationNote: 'Verified -4% SEC improvement sustained over 7 consecutive days.',
        postInterventionSec: 0.36,
      },
    ],
    recommendations: [
      {
        id: 'pa-rec-1',
        impactLabel: 'High Impact',
        impactLevel: 'high',
        title: 'Investigate M-07 idle motor draw during coil pauses',
        estSavingText: '₹3,120/month (Est.)',
        savingINRMonth: 3120,
        savingKwhMonth: 390,
        confidence: 91,
        ctaLabel: 'View Evidence',
        process: 'Pressing & Drive (M-07)',
        status: 'Identified',
        verificationMethod: 'Motor Load vs Unit Counter Correlation',
        beforeSec: 0.66,
        afterSec: 0.54,
        description: 'Consumption on M-07 is 23% above expected range for the last 3 hours.',
      },
      {
        id: 'pa-rec-2',
        impactLabel: 'Quick Win',
        impactLevel: 'quick',
        title: 'Shift 100 units from Line 02 to Line 01',
        estSavingText: '₹2,180/month (Est.)',
        savingINRMonth: 2180,
        savingKwhMonth: 272,
        confidence: 88,
        ctaLabel: 'Simulate',
        process: 'Welding & Assembly',
        status: 'In Trial',
        verificationMethod: 'Parallel Line SEC Comparison Model',
        beforeSec: 0.96,
        afterSec: 0.85,
        description: 'Line 01 operates at 12% lower kWh/unit for SKU-WL400.',
      },
      {
        id: 'pa-rec-3',
        impactLabel: 'Medium Impact',
        impactLevel: 'medium',
        title: 'Ring-main pneumatic leak sealing on Compressor 1',
        estSavingText: '₹1,540/month (Verified)',
        savingINRMonth: 1540,
        savingKwhMonth: 192,
        confidence: 94,
        ctaLabel: 'View Evidence',
        process: 'Compression',
        status: 'Verified',
        verifiedSavingINR: 1540,
        verificationMethod: 'IPMVP Baseline Adjusted SEC Verification',
        beforeSec: 0.38,
        afterSec: 0.36,
        description: 'Consumption is now within expected range (-4% vs baseline) following coupler replacement.',
      },
    ],
    equipmentList: [
      { id: 'm-07', name: 'M-07 (Motor)', zoneCode: 'Z-01', process: 'Pressing', status: 'Alert', loadPercent: 42, deviationPercent: 21, powerKw: 49.2, expectedKwhPerUnit: 0.54, actualKwhPerUnit: 0.66, unitsToday: 145, shift: 'Shift A', operator: 'K. Joshi', temperatureC: 64 },
      { id: 'm-03', name: 'Line 02 (Weld)', zoneCode: 'Z-02', process: 'Welding', status: 'Warning', loadPercent: 62, deviationPercent: 9, powerKw: 28.1, expectedKwhPerUnit: 0.88, actualKwhPerUnit: 0.96, unitsToday: 230, shift: 'Shift A', operator: 'D. Nair', temperatureC: 47 },
      { id: 'm-01', name: 'M-01 (CNC)', zoneCode: 'Z-03', process: 'Machining', status: 'Normal', loadPercent: 56, deviationPercent: -2, powerKw: 22.4, expectedKwhPerUnit: 0.45, actualKwhPerUnit: 0.44, unitsToday: 210, shift: 'Shift A', operator: 'A. Sharma', temperatureC: 42 },
      { id: 'm-02', name: 'M-02 (Drill)', zoneCode: 'Z-04', process: 'Drilling', status: 'Normal', loadPercent: 48, deviationPercent: -3, powerKw: 18.6, expectedKwhPerUnit: 0.39, actualKwhPerUnit: 0.38, unitsToday: 195, shift: 'Shift A', operator: 'R. Verma', temperatureC: 40 },
      { id: 'm-08', name: 'Line 01 (Assy)', zoneCode: 'Z-05', process: 'Assembly', status: 'Normal', loadPercent: 74, deviationPercent: -2, powerKw: 31.0, expectedKwhPerUnit: 0.48, actualKwhPerUnit: 0.47, unitsToday: 260, shift: 'Shift A', operator: 'S. Iyer', temperatureC: 45 },
      { id: 'comp-1', name: 'Compressor 1', zoneCode: 'Z-06', process: 'Compression', status: 'Normal', loadPercent: 68, deviationPercent: -4, powerKw: 38.9, expectedKwhPerUnit: 0.38, actualKwhPerUnit: 0.36, unitsToday: 1020, shift: 'Shift A', operator: 'Auto-PLC', temperatureC: 68 },
    ],
    alerts: [
      {
        id: 'pa-alt-1',
        title: 'M-07 – High energy consumption',
        description: 'Consumption is 23% above expected range for the last 3 hours. Possible idle runtime.',
        time: '08:42 AM',
        relativeTime: '2h ago',
        severity: 'High',
        machine: 'M-07',
        process: 'Pressing',
        acknowledged: false,
      },
      {
        id: 'pa-alt-2',
        title: 'Line 02 – Energy intensity increase',
        description: '9.2% higher than expected for current production volume.',
        time: '06:45 AM',
        relativeTime: '4h ago',
        severity: 'Medium',
        machine: 'Line 02',
        process: 'Welding',
        acknowledged: false,
      },
      {
        id: 'pa-alt-3',
        title: 'Compressor 1 – Back to normal',
        description: 'Consumption is now within expected range (-4% vs baseline).',
        time: '04:40 AM',
        relativeTime: '6h ago',
        severity: 'Resolved',
        machine: 'Compressor 1',
        process: 'Compression',
        acknowledged: true,
      },
    ],
    productionBatches: [
      {
        id: 'pa-batch-1',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-HM700 (Stamping Housing)',
        process: 'Pressing',
        machineId: 'M-07',
        unitsProduced: 145,
        expectedKwh: 78.3,
        actualKwh: 95.7,
        secActual: 0.66,
        secExpected: 0.54,
        deviationPercent: 21.0,
        source: 'Excel Upload',
        notes: 'Idle motor draw between stamping coils',
      },
      {
        id: 'pa-batch-2',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-WL400 (Sub-Frame Weldment)',
        process: 'Welding',
        machineId: 'Line 02',
        unitsProduced: 310,
        expectedKwh: 272.8,
        actualKwh: 297.9,
        secActual: 0.96,
        secExpected: 0.88,
        deviationPercent: 9.2,
        source: 'Excel Upload',
        notes: 'Can shift 100 units to Line 01 to save 84 kWh',
      },
      {
        id: 'pa-batch-3',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-DR210 (Precision Hub)',
        process: 'Drilling',
        machineId: 'M-02',
        unitsProduced: 195,
        expectedKwh: 76.1,
        actualKwh: 74.1,
        secActual: 0.38,
        secExpected: 0.39,
        deviationPercent: -3.0,
        source: 'Excel Upload',
        notes: 'Normal operation',
      },
      {
        id: 'pa-batch-4',
        date: '2026-09-30',
        shift: 'Shift A (06:00-14:00)',
        productSku: 'SKU-PN110 (Air Main Supply)',
        process: 'Compression',
        machineId: 'Compressor 1',
        unitsProduced: 1020,
        expectedKwh: 387.6,
        actualKwh: 367.2,
        secActual: 0.36,
        secExpected: 0.38,
        deviationPercent: -4.0,
        source: 'Smart Meter + Log',
        notes: 'Verified leak repair savings holding steady',
      },
    ],
  },
};
