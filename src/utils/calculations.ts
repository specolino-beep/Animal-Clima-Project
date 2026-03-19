import { BuildingElement, MaterialEntry, FuelEntry } from '../types';

/**
 * Calcola l'umidità specifica (g/m3) a partire dalla temperatura (°C) e dall'umidità relativa (%)
 * Basato sulla formula fornita dall'utente.
 */
export function calculateSpecificHumidity(temp: number, rh: number): number {
  const SA = temp;
  const URa = rh;

  // A4: Pressione di saturazione (correlata)
  const T_kelvin = SA + 273.16;
  const A4_inner = 
    (-7511.52 / T_kelvin) + 
    89.63121 + 
    (0.02399897 * T_kelvin) - 
    (0.000011654551 * Math.pow(T_kelvin, 2)) - 
    (0.000000012810336 * Math.pow(T_kelvin, 3)) + 
    (0.00000000002099845 * Math.pow(T_kelvin, 4)) - 
    (12.150799 * Math.log(T_kelvin));
  
  const A4 = Math.exp(A4_inner) * 7.5;

  // A5: Rapporto di mescolanza (kg/kg)
  const A5 = (0.62198 * URa * A4) / (76000 - (URa * A4));

  // A6: Entalpia (kcal/kg)
  const A6 = (A5 * (595 + 0.46 * SA)) + (0.24 * SA);

  // A7: Umidità specifica (g/kg - approssimata dalla formula)
  const A7 = (A6 - (0.2375 * SA)) / (0.595 + (0.00046 * SA));

  // A8: Densità dell'aria (kg/m3)
  const A8 = ((0.464 * 760) - (0.175 * ((URa / 100) * A4))) / T_kelvin;

  // A9: Umidità specifica (g/m3)
  const A9 = A7 * A8;

  return A9;
}

/**
 * Calcola la ventilazione invernale basata sulla CO2 (m3/h)
 */
export function calculateVentilationCO2(totalCO2: number, co2In: number, co2Out: number): number {
  if (co2In <= co2Out) return 0;
  return totalCO2 / ((co2In - co2Out) * 10);
}

/**
 * Calcola la ventilazione invernale basata sull'H2O (m3/h)
 */
export function calculateVentilationH2O(totalH2O: number, humidityIndoor: number, humidityWinter: number): number {
  const diff = humidityIndoor - humidityWinter;
  if (diff <= 0) return 0;
  return totalH2O / diff;
}

/**
 * Calcola la trasmittanza termica (U) e la resistenza totale (R) di un elemento edilizio
 */
export function calculateElementThermal(element: BuildingElement, materialDatabase: MaterialEntry[]) {
  let rTotal = element.rSi + (element.id === 'floor' ? (element.rGround || 0) : element.rSe);
  element.layers.forEach(layer => {
    const material = materialDatabase.find(m => m.name === layer.materialName);
    if (material) {
      if (material.rValue) {
        rTotal += material.rValue;
      } else if (material.lambda && layer.thickness > 0) {
        rTotal += layer.thickness / material.lambda;
      }
    }
  });
  const uValue = rTotal > 0 ? 1 / rTotal : 0;
  return { rTotal, uValue };
}

/**
 * Calcola lo spessore necessario di isolante per raggiungere il pareggio termico
 */
export function calculateRequiredInsulationThickness(
  heatBalance: number,
  elements: BuildingElement[],
  indoorTemp: number,
  winterTemp: number,
  selectedInsulationName: string,
  materialDatabase: MaterialEntry[]
): number | null {
  if (heatBalance >= 0) return 0;
  const roof = elements.find(el => el.id === 'roof');
  if (!roof || roof.surface <= 0) return null;

  const deltaT = indoorTemp - winterTemp;
  if (deltaT <= 0) return 0;

  const { uValue: currentURoof } = calculateElementThermal(roof, materialDatabase);
  const deficit = Math.abs(heatBalance);
  
  const targetURoof = currentURoof - (deficit / (roof.surface * deltaT));
  
  if (targetURoof <= 0) return null;

  const targetRRoof = 1 / targetURoof;
  const currentRRoof = 1 / currentURoof;
  const requiredRInsulation = targetRRoof - currentRRoof;

  const material = materialDatabase.find(m => m.name === selectedInsulationName);
  if (!material || !material.lambda) return null;

  return requiredRInsulation * material.lambda * 100; // in cm
}

/**
 * Calcola il consumo orario di combustibile per coprire il deficit termico
 */
export function calculateFuelConsumption(
  heatBalance: number,
  selectedFuelName: string,
  fuelDatabase: FuelEntry[]
): number {
  if (heatBalance >= 0) return 0;
  const fuel = fuelDatabase.find(f => f.name === selectedFuelName);
  if (!fuel) return 0;

  const deficitKW = Math.abs(heatBalance) / 1000;
  return deficitKW / (fuel.kwhPerKg * fuel.efficiency);
}

/**
 * Calcola la velocità dell'aria per effetto camino (m/s)
 */
export function calculateNaturalVentVelocity(hOut: number, hIn: number, tIn: number, tOut: number, hExtra: number = 0, alpha: number = 0.5): number {
  const G = 9.8;
  const deltaH = (hOut + hExtra) - hIn;
  const deltaT = tIn - tOut;

  if (deltaH <= 0 || deltaT <= 0) return 0;

  const inner = (2 * G * deltaH * deltaT) / (tOut + 273);
  return alpha * Math.sqrt(inner);
}

/**
 * Calcola la superficie totale necessaria per l'uscita dell'aria (m2)
 */
export function calculateRequiredOutletArea(requiredFlowRate: number, velocity: number): number {
  if (velocity <= 0) return 0;
  return requiredFlowRate / (velocity * 3600);
}

/**
 * Calcola l'ampiezza della fessura del cupolino (m)
 */
export function calculateCupolinoWidth(area: number, length: number): number {
  if (length <= 0) return 0;
  return area / length;
}

/**
 * Calcola il numero di camini necessari
 */
export function calculateChimneyCount(area: number, diameter: number): number {
  if (diameter <= 0) return 0;
  const chimneyArea = Math.PI * Math.pow(diameter / 2, 2);
  return Math.ceil(area / chimneyArea);
}

/**
 * Calcola il numero di ventilatori necessari per una determinata portata
 */
export function calculateFansNeeded(requiredFlow: number, fanFlow: number): number {
  if (fanFlow <= 0) return 0;
  return Math.ceil(requiredFlow / fanFlow);
}

/**
 * Calcola il consumo energetico della ventilazione forzata (kWh/giorno)
 */
export function calculateForcedVentEnergy(
  numFans: number,
  fanPower: number,
  hoursPerDay: number,
  minutesPerHour: number = 60,
  efficiency: number = 0.85,
  useInverter: boolean = false,
  modulationFactor: number = 1.0
): number {
  if (efficiency <= 0) efficiency = 1;
  
  // Potenza assorbita totale (kW)
  const totalPowerKW = (numFans * fanPower) / efficiency;
  
  // Se inverter, la potenza assorbita varia con il cubo della velocità (approssimazione)
  // ma qui usiamo un fattore di modulazione lineare o fornito per semplicità se non specificato altrimenti.
  // Tuttavia, il testo dice "modulare in modo continuo la portata".
  // Se usiamo inverter, potremmo non usare l'intermittenza (minuti/ora) ma la modulazione.
  
  const timeFactor = minutesPerHour / 60;
  const powerFactor = useInverter ? Math.pow(modulationFactor, 3) : 1.0;
  
  return totalPowerKW * powerFactor * hoursPerDay * timeFactor;
}

/**
 * Calcola la velocità dell'aria (m/s)
 */
export function calculateAirVelocity(flowRate: number, area: number): number {
  if (area <= 0) return 0;
  return flowRate / (area * 3600);
}

/**
 * Calcola la gittata utile di un ventilatore (m)
 */
export function calculateFanThrow(diameter: number, multiplier: number): number {
  return diameter * multiplier;
}

/**
 * Calcola il numero di ventilatori necessari per fila
 */
export function calculateFansPerRow(rowLength: number, throwDistance: number): number {
  if (throwDistance <= 0) return 0;
  return Math.max(1, Math.ceil(rowLength / throwDistance));
}

/**
 * Calcola il THI (Temperature Humidity Index) per diverse specie
 */
export function calculateTHI(temp: number, rh: number, species: string): number {
  const rhDecimal = rh / 100;
  const tF = (1.8 * temp) + 32;
  
  if (species.toLowerCase().includes('bovini') || species.toLowerCase().includes('vacche')) {
    // Formula NRC (1971) per bovini
    return (1.8 * temp + 32) - (0.55 - 0.0055 * rh) * (1.8 * temp - 26);
  } else if (species.toLowerCase().includes('avicoli') || species.toLowerCase().includes('polli') || species.toLowerCase().includes('galline')) {
    // Formula per avicoli
    return 0.8 * temp + rhDecimal * (temp - 14.4) + 46.4;
  } else if (species.toLowerCase().includes('conigli')) {
    // Formula per conigli (spesso simile a bovini o specifica)
    return temp - (0.55 - 0.0055 * rh) * (temp - 14.5);
  } else {
    // Formula standard (Thom, 1959)
    return (1.8 * temp + 32) - (0.55 - 0.0055 * rh) * (1.8 * temp - 26);
  }
}

/**
 * Calcola il THI corretto per la velocità dell'aria (Adjusted THI)
 */
export function calculateAdjustedTHI(thi: number, velocity: number): number {
  if (velocity <= 0.2) return thi;
  // Riduzione approssimativa del THI basata sulla velocità dell'aria (Wind Chill effect)
  // Per i bovini, 1 m/s può ridurre il THI percepito di circa 2-3 unità
  return thi - (1.5 * Math.sqrt(velocity));
}

/**
 * Calcola la temperatura a bulbo umido (°C) usando l'approssimazione di Stull
 */
export function calculateWetBulb(temp: number, rh: number): number {
  const T = temp;
  const RH = rh;
  
  const Tw = T * Math.atan(0.151977 * Math.pow(RH + 8.313659, 0.5)) + 
             Math.atan(T + RH) - 
             Math.atan(RH - 1.676331) + 
             0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 
             4.686035;
             
  return Tw;
}

/**
 * Calcola i risultati del raffrescamento adiabatico
 */
export function calculateAdiabaticCooling(temp: number, rh: number, efficiency: number) {
  const Tw = calculateWetBulb(temp, rh);
  const deltaT = (temp - Tw) * (efficiency / 100);
  const finalTemp = temp - deltaT;
  
  // In un processo adiabatico l'entalpia è costante.
  // Possiamo approssimare l'umidità finale sapendo che il bulbo umido rimane costante.
  // Per semplicità e stabilità, calcoliamo l'umidità relativa finale che corrisponderebbe 
  // alla stessa temperatura a bulbo umido.
  
  // Cerchiamo l'RH finale che con finalTemp dà Tw
  let finalRH = rh;
  let minDiff = 999;
  for (let r = rh; r <= 100; r += 0.1) {
    const testTw = calculateWetBulb(finalTemp, r);
    const diff = Math.abs(testTw - Tw);
    if (diff < minDiff) {
      minDiff = diff;
      finalRH = r;
    } else if (diff > minDiff) {
      break;
    }
  }

  return { finalTemp, finalRH, wetBulb: Tw };
}

/**
 * Calcola il consumo di acqua per evaporazione (L/h)
 */
export function calculatePadWaterConsumption(
  airflow: number, 
  tempIn: number, 
  rhIn: number, 
  tempOut: number, 
  rhOut: number
): number {
  // Densità aria approssimata
  const density = 1.2; 
  const massFlow = airflow * density; // kg/h
  
  // Calcolo rapporto di mescolanza (kg/kg)
  const getMixingRatio = (T: number, RH: number) => {
    const T_kelvin = T + 273.16;
    const inner = (-7511.52 / T_kelvin) + 89.63121 + (0.02399897 * T_kelvin) - (0.000011654551 * Math.pow(T_kelvin, 2)) - (0.000000012810336 * Math.pow(T_kelvin, 3)) + (0.00000000002099845 * Math.pow(T_kelvin, 4)) - (12.150799 * Math.log(T_kelvin));
    const Psat = Math.exp(inner) * 7.5;
    return (0.62198 * (RH / 100) * Psat) / (760 - ((RH / 100) * Psat));
  };

  const xIn = getMixingRatio(tempIn, rhIn);
  const xOut = getMixingRatio(tempOut, rhOut);
  
  const waterMass = massFlow * (xOut - xIn); // kg/h = L/h
  return Math.max(0, waterMass);
}

/**
 * Calcola il consumo energetico per il raffrescamento
 */
export function calculateCoolingEnergy(power: number, hours: number, days: number): number {
  return (power * hours * days) / 1000; // kWh
}
