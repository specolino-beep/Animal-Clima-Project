export interface AnimalEntry {
  name: string;
  weight: number;
  qtEstate: number;
  qtInverno: number;
  h2oEstate: number;
  h2oInverno: number;
  qsEstate: number;
  qsInverno: number;
  co2: number;
  vEstate: number;
}

export interface MaterialEntry {
  name: string;
  category: string;
  lambda?: number; // Thermal conductivity (W/mK)
  rho?: number;    // Density (kg/m3)
  rValue?: number; // Thermal resistance (m2K/W)
}

export interface FuelEntry {
  name: string;
  kjPerKg: number;
  kwhPerKg: number;
  efficiency: number;
}

export interface Layer {
  id: string;
  materialName: string;
  thickness: number; // in meters
}

export interface BuildingElement {
  id: string;
  name: string;
  surface: number; // in m2
  layers: Layer[];
  rSi: number; // internal surface resistance
  rSe: number; // external surface resistance
  rGround?: number; // ground resistance (for floor)
  tGroundwater?: number; // groundwater temperature (for floor)
}

export interface FanEntry {
  id: string;
  diameter: number; // mm
  power: number;    // kW
  airflow: number;  // m3/h
}

export interface ForcedVentParams {
  mode: 'preset' | 'manual';
  selectedFanId?: string;
  manualFan?: Omit<FanEntry, 'id'>;
  useInverter: boolean;
  inverterEfficiency: number; // 0-1
  
  // Inverno
  winterFansCount: number;
  
  // Geometria per velocità aria
  ventilationType: 'longitudinal' | 'transversal';
}

export interface BuildingDimensions {
  length: number;
  width: number;
  ridgeHeight: number;
  eaveHeight: number;
}

export type View = 'home' | 'animals' | 'climate' | 'ventilation' | 'structure' | 'results' | 'natural_vent' | 'forced_vent';

export interface NaturalVentParams {
  hOut: number; // Altezza al colmo / uscita (m)
  hIn: number;  // Quota media ingresso (m)
  ventType: 'cupolino' | 'camini';
  buildingLength: number; // Lunghezza edificio (m)
  chimneyDiameter: number; // Diametro camini (m)
}
