export interface EnergyRecord {
  timestamp: string;
  process: string;
  machine: string;
  kW: number;
  kWh: number;
  productionUnits: number;
  operatingState: string;
}

export async function loadEnergyData(): Promise<EnergyRecord[]> {
  const response = await fetch("/src/data/WattTwin_factory_dataset.csv");

  if (!response.ok) {
    throw new Error("Could not load WattTwin dataset");
  }

  const csvText = await response.text();

  const lines = csvText.trim().split(/\r?\n/);

  const headers = lines[0].split(",").map((header) => header.trim());

  const records: EnergyRecord[] = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());

    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return {
      timestamp: row["Timestamp"],
      process: row["Process"],
      machine: row["Machine"],
      kW: Number(row["kW"]),
      kWh: Number(row["kWh"]),
      productionUnits: Number(row["Production Units"]),
      operatingState: row["Operating State"],
    };
  });

  return records.filter(
    (record) =>
      record.machine &&
      !Number.isNaN(record.kWh) &&
      !Number.isNaN(record.productionUnits)
  );
}