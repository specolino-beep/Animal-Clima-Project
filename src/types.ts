import { MaterialEntry } from './data/materials';

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

export type View = 'home' | 'animals' | 'climate' | 'ventilation' | 'structure' | 'results';
