import { EnergyRecord } from "../data/csvLoader";

export function calculateEnergyMetrics(data: EnergyRecord[]) {
  const totalKWh = data.reduce((sum, record) => {
    return sum + record.kWh;
  }, 0);

  const totalProduction = data.reduce((sum, record) => {
    return sum + record.productionUnits;
  }, 0);

  const energyIntensity =
    totalProduction > 0 ? totalKWh / totalProduction : 0;

  const runningEnergy = data
    .filter((record) => record.operatingState === "Running")
    .reduce((sum, record) => sum + record.kWh, 0);

  const idleEnergy = data
    .filter((record) => record.operatingState === "Idle")
    .reduce((sum, record) => sum + record.kWh, 0);

  const downtimeEnergy = data
    .filter((record) => record.operatingState === "Downtime")
    .reduce((sum, record) => sum + record.kWh, 0);

  const faultEnergy = data
    .filter((record) => record.operatingState === "Fault")
    .reduce((sum, record) => sum + record.kWh, 0);

  return {
    totalKWh,
    totalProduction,
    energyIntensity,
    runningEnergy,
    idleEnergy,
    downtimeEnergy,
    faultEnergy,
  };
}