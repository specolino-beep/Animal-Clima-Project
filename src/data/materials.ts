export interface MaterialEntry {
  name: string;
  category: string;
  lambda?: number; // W/m*K
  rho?: number;    // kg/m3
  rValue?: number; // m2*K/W
}

export const MATERIAL_DATABASE: MaterialEntry[] = [
  // PARETI
  { name: "Muratura in pietra", category: "PARETI", lambda: 2.3, rho: 2600 },
  { name: "Mattone pieno", category: "PARETI", lambda: 0.5, rho: 1600 },
  { name: "Mattone forato", category: "PARETI", lambda: 0.3, rho: 1200 },
  { name: "Calcestruzzo normale", category: "PARETI", lambda: 0.93, rho: 2000 },
  { name: "Calcestruzzo leggero con argilla espansa", category: "PARETI", lambda: 0.3, rho: 1000 },
  { name: "Calcestruzzo medio-leggero con argilla espansa", category: "PARETI", lambda: 0.7, rho: 1700 },
  { name: "Blocchi LECA normali", category: "PARETI", lambda: 1, rho: 1600 },
  { name: "Blocchi LECA clima", category: "PARETI", lambda: 0.25, rho: 1000 },
  { name: "Blocchi con argilla espansa", category: "PARETI", lambda: 0.18, rho: 800 },
  { name: "Pannelli autoportanti isolati (sandwich alluminio)", category: "PARETI", lambda: 0.03, rho: 200 },
  { name: "Intercapedine d'aria", category: "PARETI", rValue: 0.18 },

  // INTONACI
  { name: "Intonaco di cemento", category: "INTONACI", lambda: 1.4, rho: 2200 },
  { name: "Intonaco di calce e cemento", category: "INTONACI", lambda: 0.9, rho: 1400 },
  { name: "Intonaco di gesso", category: "INTONACI", lambda: 0.35 },
  { name: "Intonaco calce e gesso (interno)", category: "INTONACI", lambda: 0.7, rho: 1400 },
  { name: "Intonaco termoisolante", category: "INTONACI", lambda: 0.13, rho: 450 },

  // TETTO
  { name: "Pannelli in fibrocemento", category: "TETTO", lambda: 0.6, rho: 2000 },
  { name: "Tavelloni 80 mm", category: "TETTO", lambda: 0.3, rho: 1200 },
  { name: "Lastre isolate autoportanti (sandwich alluminio) 60 mm", category: "TETTO", lambda: 0.03, rho: 150 },
  { name: "Lastre isolate autoportanti (sandwich alluminio) 80 mm", category: "TETTO", lambda: 0.03, rho: 150 },
  { name: "Guaine di polietilene, bitume, ecc", category: "TETTO", lambda: 0.26, rho: 1700 },

  // FINESTRE E SERRAMENTI
  { name: "Vetro", category: "FINESTRE E SERRAMENTI", lambda: 1, rho: 2500 },
  { name: "Vetrocamera", category: "FINESTRE E SERRAMENTI", rValue: 0.37 },
  { name: "Vetro acrilico (plexiglas)", category: "FINESTRE E SERRAMENTI", lambda: 0.19, rho: 1180 },
  { name: "Policarbonato", category: "FINESTRE E SERRAMENTI", rValue: 0.48 },

  // ISOLANTI
  { name: "Argilla espansa", category: "ISOLANTI", lambda: 0.09, rho: 350 },
  { name: "Polietilene espanso in lastre 30 Kg/m³", category: "ISOLANTI", lambda: 0.04, rho: 30 },
  { name: "Lana di vetro", category: "ISOLANTI", lambda: 0.04, rho: 20 },
  { name: "Pannelli in fibra di legno 190 Kg/m³", category: "ISOLANTI", lambda: 0.045, rho: 190 },
  { name: "Perlite espansa", category: "ISOLANTI", lambda: 0.05, rho: 90 },
  { name: "Poliuretano in lastre o schiuma", category: "ISOLANTI", lambda: 0.03, rho: 30 },
  { name: "Lana di Roccia", category: "ISOLANTI", lambda: 0.04, rho: 30 },

  // METALLI
  { name: "Acciaio", category: "METALLI", lambda: 60, rho: 7800 },
  { name: "Rame", category: "METALLI", lambda: 380, rho: 8900 },
  { name: "Alluminio", category: "METALLI", lambda: 200, rho: 2800 },
  { name: "Acciaio Ni-Cr Inossidabile", category: "METALLI", lambda: 13, rho: 7700 },

  // LEGNI
  { name: "Legno di conifere, flusso trasversale alla fibra", category: "LEGNI", lambda: 0.14, rho: 600 },
  { name: "Legno di Latifoglie", category: "LEGNI", lambda: 0.18, rho: 800 }
];
