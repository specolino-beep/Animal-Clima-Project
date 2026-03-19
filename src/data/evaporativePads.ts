export interface PadEfficiencyRow {
  velocity: number;
  thickness50: number;
  thickness100: number;
  thickness150: number;
  thickness200: number;
}

export const PAD_EFFICIENCY_TABLE: PadEfficiencyRow[] = [
  { velocity: 0.50, thickness50: 65.0, thickness100: 82.5, thickness150: 94.0, thickness200: 98.0 },
  { velocity: 1.00, thickness50: 62.0, thickness100: 77.5, thickness150: 90.0, thickness200: 96.0 },
  { velocity: 1.50, thickness50: 60.0, thickness100: 74.5, thickness150: 86.5, thickness200: 94.0 },
  { velocity: 2.00, thickness50: 58.5, thickness100: 72.0, thickness150: 83.5, thickness200: 92.0 },
  { velocity: 2.50, thickness50: 56.5, thickness100: 70.5, thickness150: 81.0, thickness200: 90.5 },
  { velocity: 3.00, thickness50: 55.0, thickness100: 69.0, thickness150: 79.5, thickness200: 89.0 },
  { velocity: 3.50, thickness50: 54.0, thickness100: 67.5, thickness150: 78.0, thickness200: 87.0 },
  { velocity: 4.00, thickness50: 53.0, thickness100: 66.5, thickness150: 77.0, thickness200: 85.5 },
  { velocity: 4.50, thickness50: 52.5, thickness100: 65.5, thickness150: 76.0, thickness200: 84.8 },
  { velocity: 5.00, thickness50: 52.5, thickness100: 65.0, thickness150: 75.0, thickness200: 84.5 },
];

export function getPadEfficiency(velocity: number, thickness: number): number {
  // Find the closest velocity row
  const row = PAD_EFFICIENCY_TABLE.reduce((prev, curr) => {
    return Math.abs(curr.velocity - velocity) < Math.abs(prev.velocity - velocity) ? curr : prev;
  });

  switch (thickness) {
    case 50: return row.thickness50;
    case 100: return row.thickness100;
    case 150: return row.thickness150;
    case 200: return row.thickness200;
    default: return row.thickness100;
  }
}
