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
