export interface FuelEntry {
  name: string;
  kjPerKg: number;
  kwhPerKg: number;
  efficiency: number;
}

export const FUELS_DATABASE: FuelEntry[] = [
  { name: "Legno", kjPerKg: 16000, kwhPerKg: 4.444444, efficiency: 0.75 },
  { name: "Carbone", kjPerKg: 33500, kwhPerKg: 9.305556, efficiency: 0.8 },
  { name: "Gasolio", kjPerKg: 44400, kwhPerKg: 12.33333, efficiency: 0.9 },
  { name: "GPL", kjPerKg: 46100, kwhPerKg: 12.80556, efficiency: 0.9 },
  { name: "Gas naturale", kjPerKg: 47700, kwhPerKg: 13.25, efficiency: 0.9 },
  { name: "Metano", kjPerKg: 50000, kwhPerKg: 13.88889, efficiency: 0.9 },
];
