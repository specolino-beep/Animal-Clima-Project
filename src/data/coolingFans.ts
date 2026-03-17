export interface CoolingFan {
  id: string;
  diameter: number; // m
  airflow: number;  // m3/h
  power: number;    // kW
  type: 'horizontal' | 'vertical';
}

export const COOLING_FANS: CoolingFan[] = [
  { id: 'h1', diameter: 0.8, airflow: 15000, power: 0.35, type: 'horizontal' },
  { id: 'h2', diameter: 1.0, airflow: 20000, power: 0.45, type: 'horizontal' },
  { id: 'h3', diameter: 1.2, airflow: 30000, power: 0.50, type: 'horizontal' },
  { id: 'h4', diameter: 1.4, airflow: 40000, power: 0.55, type: 'horizontal' },
  
  { id: 'v1', diameter: 2.0, airflow: 80000, power: 0.70, type: 'vertical' },
  { id: 'v2', diameter: 3.0, airflow: 130000, power: 0.725, type: 'vertical' },
  { id: 'v3', diameter: 4.0, airflow: 180000, power: 0.75, type: 'vertical' },
  { id: 'v4', diameter: 5.0, airflow: 260000, power: 1.1125, type: 'vertical' },
  { id: 'v5', diameter: 6.0, airflow: 340000, power: 1.475, type: 'vertical' },
  { id: 'v6', diameter: 7.0, airflow: 420000, power: 1.8375, type: 'vertical' },
  { id: 'v7', diameter: 8.0, airflow: 500000, power: 2.20, type: 'vertical' },
  { id: 'v8', diameter: 9.0, airflow: 725000, power: 2.25, type: 'vertical' },
  { id: 'v9', diameter: 10.0, airflow: 950000, power: 2.30, type: 'vertical' },
];
