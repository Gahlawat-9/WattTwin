import { useEffect, useState } from "react";
import { loadEnergyData, EnergyRecord } from "./data/csvLoader";
import { calculateEnergyMetrics } from "./logic/energyEngine";
import { buildEnergyOpportunities } from "./logic/opportunityAdapter";
import {
  detectIdleEnergy,
  detectDowntimeEnergy,
  detectFaultEnergy,
  calculateOpportunityEnergy,
} from "./logic/anomalyEngine";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Cpu,
  FileSpreadsheet,
  FileText,
  GitFork,
  HelpCircle,
  Home,
  IndianRupee,
  Info,
  Layers,
  Lightbulb,
  Moon,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import {
  FACTORIES,
  FactoryId,
  NavSectionId,
  OpportunityItem,
  ProductionBatchRecord,
  ThemeMode,
} from './data/factoryData';
import { EnergyVsProductionChart } from './components/EnergyVsProductionChart';
import { EnergyFlowSankey } from './components/EnergyFlowSankey';
import {
  EnergyTwinView,
  MachinesView,
  ProductionDataView,
  ReportsView,
  SimulatorView,
} from './components/SecondaryViews';
import { EvidenceModal, EvidenceToActionWorkspace } from './components/EvidenceModal';
import { FactoryFloorMap } from './components/FactoryFloorMap';

export function App() {
  const [energyData, setEnergyData] = useState<EnergyRecord[]>([]);
  const energyMetrics = calculateEnergyMetrics(energyData);
  const idleEnergyEvents = detectIdleEnergy(energyData);

const downtimeEnergyEvents = detectDowntimeEnergy(energyData);

const faultEnergyEvents = detectFaultEnergy(energyData);

const detectedIdleEnergy =
  calculateOpportunityEnergy(idleEnergyEvents);

const detectedDowntimeEnergy =
  calculateOpportunityEnergy(downtimeEnergyEvents);

const detectedFaultEnergy =
  calculateOpportunityEnergy(faultEnergyEvents);

console.log("WattTwin Energy Opportunities:", {
  idleEvents: idleEnergyEvents,
  downtimeEvents: downtimeEnergyEvents,
  faultEvents: faultEnergyEvents,
  idleEnergy: detectedIdleEnergy,
  downtimeEnergy: detectedDowntimeEnergy,
  faultEnergy: detectedFaultEnergy,
});

const allEnergyEvents = [
  ...idleEnergyEvents,
  ...downtimeEnergyEvents,
  ...faultEnergyEvents,
];

const calculatedOpportunities =
  buildEnergyOpportunities(
    energyData,
    allEnergyEvents
  );

const totalOpportunityEnergy =
  detectedIdleEnergy +
  detectedDowntimeEnergy +
  detectedFaultEnergy;
  console.log(
  "Total flagged energy:",
  totalOpportunityEnergy
);

useEffect(() => {
  loadEnergyData()
    .then((data) => {
      console.log("WattTwin dataset loaded:", data);
      console.log("Number of records:", data.length);
      setEnergyData(data);
    })
    .catch((error) => {
      console.error("Failed to load WattTwin dataset:", error);
    });
}, []); 
console.log("WattTwin Energy Metrics:", energyMetrics);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [factoryId, setFactoryId] = useState<FactoryId>('factory-01');
  const [activeNav, setActiveNav] = useState<NavSectionId>('overview');
  const [timeRange, setTimeRange] = useState<'1D' | '7D' | '30D'>('1D');

  // Active opportunity index for the prominent Priority Opportunity hero card & Evidence-to-Action view
  const [priorityOppIndex, setPriorityOppIndex] = useState<number>(0);
  const [modalOpportunity, setModalOpportunity] = useState<OpportunityItem | null>(null);
  const [showAssumptionsEstimate, setShowAssumptionsEstimate] = useState<boolean>(false);
  const [showMethodologyDrawer, setShowMethodologyDrawer] = useState<boolean>(false);

  // Track validation statuses when user verifies an opportunity
  const [validationOverrides, setValidationOverrides] = useState<
    Record<string, OpportunityItem['validationStatus']>
  >({});

  // Local state for SME production batches
  const [customBatches, setCustomBatches] = useState<Record<FactoryId, ProductionBatchRecord[]>>({
    'factory-01': FACTORIES['factory-01'].productionBatches,
    'plant-a': FACTORIES['plant-a'].productionBatches,
  });

  const rawFactory = FACTORIES[factoryId];

/*
 * WattTwin data source:
 * - Before CSV loads: keep the original factory data as a temporary fallback.
 * - After CSV loads: use opportunities calculated from the WattTwin dataset.
 *
 * This lets the existing UI remain intact while the energy intelligence
 * becomes dataset-driven.
 */
const datasetOpportunities =
  calculatedOpportunities.length > 0
    ? calculatedOpportunities
    : rawFactory.opportunities;

const opportunitiesWithStatus = datasetOpportunities.map((opp) => ({
  ...opp,
  validationStatus:
    validationOverrides[opp.id] ?? opp.validationStatus,
}));

const factory = {
  ...rawFactory,
  opportunities: opportunitiesWithStatus,

  // Dataset-driven opportunity count
  kpis: {
    ...rawFactory.kpis,
    opportunitiesCount: opportunitiesWithStatus.length,
  },
};

  const isDark = theme === 'dark';
  const featuredOpp =
    factory.opportunities[priorityOppIndex] || factory.opportunities[0];

  const handleAddBatch = (newBatch: ProductionBatchRecord) => {
    setCustomBatches((prev) => ({
      ...prev,
      [factoryId]: [newBatch, ...prev[factoryId]],
    }));
  };

  const handleVerifyStatusChange = (
    oppId: string,
    newStatus: OpportunityItem['validationStatus']
  ) => {
    setValidationOverrides((prev) => ({ ...prev, [oppId]: newStatus }));
  };

  const openEvidenceViewFor = (opp: OpportunityItem) => {
    const idx = factory.opportunities.findIndex((o) => o.id === opp.id);
    if (idx >= 0) setPriorityOppIndex(idx);
    setActiveNav('evidence-action');
  };

  return (
    <div
      className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-200 ${
        isDark ? 'bg-[#060d16] text-slate-100' : 'bg-[#f5f7fb] text-slate-900'
      }`}
    >
      {/* ===================================================================== */}
      {/* LEFT SIDEBAR NAVIGATION                                               */}
      {/* ===================================================================== */}
      <aside
        className={`w-full lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r flex flex-col justify-between select-none ${
          isDark ? 'bg-[#08111d] border-slate-800/80' : 'bg-white border-slate-200/90'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-slate-800/80' : 'border-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveNav('overview')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isDark
                    ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                    : 'bg-sky-600 text-white shadow-xs'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="text-base font-bold tracking-tight leading-none uppercase">
                  WATTTWIN
                </div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                  Production-Aware Intelligence
                </div>
              </div>
            </button>
          </div>

          {/* Focused Navigation Sections */}
          <div className="p-3 space-y-5">
            {/* CORE STORY */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400">
                INTELLIGENCE
              </div>
              <nav className="space-y-1">
                {([
                  { id: 'overview', label: 'Overview', icon: Home },
                  {
                    id: 'evidence-action',
                    label: 'Evidence & Investigation',
                    icon: ClipboardCheck,
                    badge: factory.kpis.opportunitiesCount,
                  },
                ] as const).map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? isDark
                            ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400'
                            : 'bg-sky-50 text-sky-700 font-semibold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </span>
                      {'badge' in item && item.badge ? (
                        <span className="font-mono text-[11px] text-amber-400 font-semibold">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* DETAILED ANALYTICS */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400">
                ANALYSIS & TWIN
              </div>
              <nav className="space-y-1">
                {([
                  { id: 'production', label: 'Shifts & Batch Records', icon: FileSpreadsheet },
                  { id: 'machines', label: 'Equipment & SEC', icon: Cpu },
                  { id: 'energy-flow', label: 'Energy Flow (Sankey)', icon: GitFork },
                  { id: 'energy-twin', label: 'Production-Energy Twin', icon: Layers },
                ] as const).map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? isDark
                            ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400'
                            : 'bg-sky-50 text-sky-700 font-semibold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ACTION & VERIFICATION */}
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-400">
                ACTION & VERIFICATION
              </div>
              <nav className="space-y-1">
                {([
                  { id: 'simulator', label: 'What-if Simulator', icon: Sliders },
                  { id: 'reports', label: 'Verified Savings & Audit', icon: ShieldCheck },
                ] as const).map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? isDark
                            ? 'bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-400'
                            : 'bg-sky-50 text-sky-700 font-semibold'
                          : isDark
                          ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Data Provenance Footer */}
        <div
          className={`p-3 border-t space-y-2 ${
            isDark ? 'border-slate-800/80' : 'border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowMethodologyDrawer(!showMethodologyDrawer)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#0b1522] border-slate-800 text-slate-300 hover:border-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Methodology & Data</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN CONTENT VIEWPORT                                                 */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER BAR (Follows Top Bar Contract + Explicit Demo Provenance) */}
        <header
          className={`px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'bg-[#08111d]/90 border-slate-800/80' : 'bg-white border-slate-200/90'
          }`}
        >
          {/* Zone 1: Breadcrumb Context & Factory Selector */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-medium ${
                isDark
                  ? 'bg-[#0e1b2d] border-slate-700/80 text-slate-100'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                aria-label="Select Factory"
                value={factoryId}
                onChange={(e) => {
                  setFactoryId(e.target.value as FactoryId);
                  setPriorityOppIndex(0);
                }}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="factory-01" className="bg-slate-900 text-white">
                  Factory 01 – Pune
                </option>
                <option value="plant-a" className="bg-slate-900 text-white">
                  Plant A – Production Unit 01
                </option>
              </select>
            </div>

            
          </div>

         

          {/* Zone 3: Actions (Assumptions Drawer + Dark/Light Theme Switcher) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMethodologyDrawer(!showMethodologyDrawer)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isDark
                  ? 'bg-[#0b1522] border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {showMethodologyDrawer ? 'Hide Assumptions' : 'Assumptions & Baseline'}
            </button>

            <div
              className={`flex items-center gap-1 p-1 rounded-lg border text-xs ${
                isDark ? 'bg-[#0b1522] border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  !isDark
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </header>

        {/* Collapsible Methodology, Baseline & Tariff Assumptions Banner (Priority 3 & 4) */}
        {showMethodologyDrawer && (
          <div
            className={`px-6 py-4 border-b text-xs ${
              isDark
                ? 'bg-[#0b1929] border-slate-800 text-slate-300'
                : 'bg-sky-50/80 border-sky-200 text-slate-800'
            }`}
          >
            <div className="max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-semibold text-emerald-400 mb-1">
                  1. Data Origin & Demo Status
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Values shown are explicitly simulated time-series readings paired with shift production spreadsheet logs to demonstrate production-normalized baseline analysis.
                </p>
              </div>
              <div>
                <div className="font-semibold text-sky-400 mb-1">
                  2. Expected Baseline Definition (No Arbitrary Scores)
                </div>
                <p className="text-slate-400 leading-relaxed font-mono text-[11px]">
                  {factory.baselineDefinition}
                </p>
              </div>
              <div>
                <div className="font-semibold text-amber-400 mb-1">
                  3. Cost & Savings Epistemology
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {factory.tariffAssumptionText}. Savings are marked <strong>Awaiting Validation</strong> until post-intervention kWh/good-unit is verified.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MAIN WORKSPACE                                                      */}
        {/* =================================================================== */}
        <main className="flex-1 p-6 overflow-y-auto max-w-[1440px] w-full mx-auto space-y-6">
          {/* ----------------------------------------------------------------- */}
          {/* OVERVIEW SCREEN: Clear 5-Second Product Value & Narrative Hierarchy */}
          {/* WATTTWIN: Production-Aware Energy Intelligence                     */}
          {/* ----------------------------------------------------------------- */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* BRAND HEADER & VALUE STATEMENT */}
              <div className="flex flex-wrap items-end justify-between gap-4 pb-1">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    WATTTWIN
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                    Production-Aware Energy Intelligence
                  </h1>
                </div>
                
              </div>

              {/* CORE LOOP BANNER: Detect → Explain → Simulate → Verify */}
             

              {/* STEP 1: 3 PRIMARY METRICS + DATA SOURCES PREVIEW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Factory energy today */}
                <div
                  className={`rounded-xl border p-4.5 ${
                    isDark
                      ? 'bg-[#0b1522]/90 border-slate-800/80'
                      : 'bg-white border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="text-xs text-slate-400 font-medium">Factory energy today</div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1.5">
                    {energyMetrics.totalKWh.toFixed(1)}{' '}
                    <span className="text-sm font-normal text-slate-400">kWh</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    {factory.kpis.energyConsumedSubtext}
                  </div>
                </div>

                {/* Metric 2: Energy intensity */}
                <div
                  className={`rounded-xl border p-4.5 ${
                    isDark
                      ? 'bg-[#0b1522]/90 border-slate-800/80'
                      : 'bg-white border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="text-xs text-slate-400 font-medium">Energy intensity</div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1.5 text-sky-400">
                    {energyMetrics.energyIntensity.toFixed(3)}{' '}
                    <span className="text-sm font-normal text-slate-400">kWh/unit</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    Normalised by output · baseline {factory.kpis.baselineIntensity}
                  </div>
                </div>

                {/* Metric 3: Expected vs actual */}
                <div
                  className={`rounded-xl border p-4.5 ${
                    isDark
                      ? 'bg-[#0b1522]/90 border-slate-800/80'
                      : 'bg-white border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div className="text-xs text-slate-400 font-medium">Expected vs actual</div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1.5 text-emerald-400">
                    {factory.kpis.expectedVsActualDelta}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    {factory.kpis.energyIntensityDelta} lower than un-optimized baseline
                  </div>
                </div>

                {/* Metric 4 / Data Sources Indicator (Judge Credibility) */}
                <div
                  className={`rounded-xl border p-4.5 flex flex-col justify-between ${
                    isDark
                      ? 'bg-[#0b1522]/90 border-slate-800/80'
                      : 'bg-white border-slate-200/90 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase font-mono tracking-wider flex items-center justify-between">
                      <span>DATA SOURCES</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">SME Ready</span>
                    </div>
                    <div className="mt-2.5 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="font-bold">✓</span>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Production Excel</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="font-bold">✓</span>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Shift records</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="font-bold">✓</span>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Electricity consumption</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-slate-500 font-bold">○</span>
                        <span>Machine meters — not connected</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-yello-400 mt-2 font-mono ">
                    Zero-IoT required to begin
                  </div>
                </div>
              </div>

              {/* STEP 2: PRIORITY ENERGY OPPORTUNITY HERO CARD */}
              <div
                className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                  isDark
                    ? 'bg-[#0d1b2a] border-amber-500/40 shadow-lg'
                    : 'bg-amber-50/60 border-amber-300 shadow-sm'
                }`}
              >
                {/* Header Kicker Row & Opportunity Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold font-mono tracking-wide flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      PRIORITY ENERGY OPPORTUNITY
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400 font-mono">
                      Status: {featuredOpp.validationStatus}
                    </span>
                  </div>

                  {/* Selector to cycle through the 3 detected opportunities */}
                  
                </div>

                {/* Main Finding & Action Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-center">
                  {/* Left 7 cols: Machine, Finding, and Flow Sequence */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {featuredOpp.machine}
                      </h2>
                      <div className="text-base sm:text-lg font-semibold text-rose-400 mt-0.5">
                        {featuredOpp.issue}
                      </div>
                    </div>

                    <p
                      className={`text-xs sm:text-sm leading-relaxed max-w-xl ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {featuredOpp.observationSummary}
                    </p>

                    {/* Step-by-Step Flow Progression: Evidence → Investigate → Simulate → Verify */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => openEvidenceViewFor(featuredOpp)}
                        className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-sky-500/15 border-sky-500/35 text-sky-300 hover:bg-sky-500/25'
                            : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                        }`}
                      >
                        <span>Evidence</span>
                      </button>
                      <span className="text-slate-500 font-sans">→</span>
                      <button
                        type="button"
                        onClick={() => openEvidenceViewFor(featuredOpp)}
                        className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <span>Investigate</span>
                      </button>
                      <span className="text-slate-500 font-sans">→</span>
                      <button
                        type="button"
                        onClick={() => setActiveNav('simulator')}
                        className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <span>Simulate</span>
                      </button>
                      <span className="text-slate-500 font-sans">→</span>
                      <button
                        type="button"
                        onClick={() => setActiveNav('reports')}
                        className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                          isDark
                            ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-300 hover:bg-indigo-500/25'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <span>Verify</span>
                      </button>
                    </div>
                  </div>

                  {/* Right 5 cols: Potential Avoidable Energy & Primary CTA */}
                  <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                    {/* Box 1: Potential Avoidable Energy & Scenario Estimate */}
                    <div
                      className={`rounded-xl border p-4 flex flex-col justify-between ${
                        isDark
                          ? 'bg-[#08111d] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-400">Potential avoidable energy</div>
                        <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 text-emerald-400">
                          ~{featuredOpp.savingKwhMonth} kWh
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {featuredOpp.validationStatus === 'Verified Saving'
                            ? 'Verified post-change'
                            : showAssumptionsEstimate
                            ? `Scenario estimate: ₹${featuredOpp.savingPerMonthINR.toLocaleString()}/mo`
                            : 'Awaiting validated estimate'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAssumptionsEstimate(!showAssumptionsEstimate)}
                        className="mt-2 text-left text-[11px] text-sky-400 hover:underline cursor-pointer"
                      >
                        {showAssumptionsEstimate
                          ? 'Hide scenario estimate'
                          : 'Show scenario estimate (₹) →'}
                      </button>
                    </div>

                    {/* Box 2: Primary CTA to Open Evidence-to-Action Workflow */}
                    <div className="flex flex-col justify-center">
                      <button
                        type="button"
                        onClick={() => openEvidenceViewFor(featuredOpp)}
                        className="w-full h-full min-h-[96px] px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm text-center"
                      >
                        <span className="flex items-center gap-1.5 font-bold">
                          <span>Investigate opportunity</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                        <span className="text-[11px] font-normal text-slate-900 leading-snug">
                          Inspect machine evidence & rule out alternative explanations
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: Energy vs Production (Left 8 cols) + Next Actions & Deployment Maturity (Right 4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-6">
                  <EnergyVsProductionChart
                    data={energyData}
                    theme={theme}
                    defaultMode={isDark ? 'area' : 'combo'}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                  />

                  {/* Simplified Factory Floor Energy Map (Schematic Layout) */}
                  
                </div>

                {/* Right 4 cols: Current Deployment / Data Sources + Next Actions */}
                <div className="lg:col-span-4 space-y-5">
                  {/* DATA SOURCES & DEPLOYMENT MATURITY CARD (Priority 5) */}
                  

                  {/* Next Actions Column */}
                  <div
                    className={`rounded-xl border p-5 ${
                      isDark
                        ? 'bg-[#0b1522]/90 border-slate-800/80'
                        : 'bg-white border-slate-200/90 shadow-xs'
                    }`}
                  >
                    <h3 className="text-base font-semibold tracking-tight mb-1">
                      Next actions
                    </h3>
                    

                    <div className="space-y-3">
                      {/* Action 1: Compare shifts and production batches */}
                      <button
                        type="button"
                        onClick={() => setActiveNav('production')}
                        className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer group ${
                          isDark
                            ? 'bg-[#0e1b2d]/90 border-slate-800 hover:border-emerald-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-400 transition-colors">
                            1. Compare shifts and batches
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </button>

                      {/* Action 2: Simulate a proposed change */}
                      <button
                        type="button"
                        onClick={() => setActiveNav('simulator')}
                        className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer group ${
                          isDark
                            ? 'bg-[#0e1b2d]/90 border-slate-800 hover:border-emerald-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-400 transition-colors">
                            2. Simulate a proposed change
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </button>

                      {/* Action 3: Verify realised savings */}
                      <button
                        type="button"
                        onClick={() => setActiveNav('reports')}
                        className={`w-full text-left rounded-xl border p-3.5 transition-all cursor-pointer group ${
                          isDark
                            ? 'bg-[#0e1b2d]/90 border-slate-800 hover:border-emerald-500/50'
                            : 'bg-slate-50 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold group-hover:text-emerald-400 transition-colors">
                            3. Verify realised savings
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* DEDICATED 6-STEP EVIDENCE-TO-ACTION SCREEN (Section 4)            */}
          {/* ----------------------------------------------------------------- */}
          {activeNav === 'evidence-action' && (
            <EvidenceToActionWorkspace
  opportunities={calculatedOpportunities}
  selectedOpportunity={
    calculatedOpportunities[0] ?? featuredOpp
  }
  onSelectOpportunity={(opp) => {
    const idx = calculatedOpportunities.findIndex(
      (o) => o.id === opp.id
    );

    if (idx >= 0) {
      setPriorityOppIndex(idx);
    }
  }}
  theme={theme}
  onClose={() => setActiveNav("overview")}
  onVerifyStatusChange={handleVerifyStatusChange}
/>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* DEDICATED SECONDARY SCREENS                                       */}
          {/* ----------------------------------------------------------------- */}
          {activeNav === 'machines' && (
            <MachinesView
              factory={factory}
              theme={theme}
              onSelectOpportunity={(opp) => openEvidenceViewFor(opp)}
            />
          )}

          {activeNav === 'energy-flow' && (
            <div className="space-y-6">
              <EnergyFlowSankey  data={energyData} theme={theme} expanded />
              <MachinesView
                factory={factory}
                theme={theme}
                onSelectOpportunity={(opp) => openEvidenceViewFor(opp)}
              />
            </div>
          )}

          {activeNav === 'energy-twin' && (
            <EnergyTwinView
              factory={factory}
              theme={theme}
              onNavigateSimulator={() => setActiveNav('simulator')}
            />
          )}

          {activeNav === 'simulator' && <SimulatorView factory={factory} theme={theme} />}

          {activeNav === 'production' && (
            <ProductionDataView
              factory={factory}
              theme={theme}
              batches={customBatches[factoryId]}
              onAddBatch={handleAddBatch}
            />
          )}

          {activeNav === 'reports' && <ReportsView factory={factory} theme={theme} />}
        </main>
      </div>

      {/* Quick Readings Modal when clicking "View readings" */}
      <EvidenceModal
        opportunity={modalOpportunity}
        opportunities={factory.opportunities}
        onSelectOpportunity={(opp) => setModalOpportunity(opp)}
        theme={theme}
        onClose={() => setModalOpportunity(null)}
      />
    </div>
  );
}

export default App;
