export interface SpeciesData {
  type: string;
  thermoneutrality: string;
  refTemp: number;
  idealRH: string;
  refRH: number;
  notes: string;
}

export const SPECIES_DATA: SpeciesData[] = [
  {
    type: "Bovine da Latte",
    thermoneutrality: "5 – 20",
    refTemp: 15,
    idealRH: "50 – 75",
    refRH: 65,
    notes: "Resistenti al freddo; soffrono molto l'afa e lo stress da calore."
  },
  {
    type: "Vitelli (0-3 sett.)",
    thermoneutrality: "15 – 25",
    refTemp: 20,
    idealRH: "60 – 70",
    refRH: 60,
    notes: "Critici: Molto sensibili al freddo; sotto i 10°C serve energia extra."
  },
  {
    type: "Vitelloni (> 6 mesi)",
    thermoneutrality: "5 – 15",
    refTemp: 12,
    idealRH: "50 – 75",
    refRH: 65,
    notes: "Ottima resistenza se l'ambiente è ben ventilato e asciutto."
  },
  {
    type: "Suini Ingrasso",
    thermoneutrality: "15 – 22",
    refTemp: 18,
    idealRH: "50 – 70",
    refRH: 65,
    notes: "Sensibili alle correnti d'aria e alle brusche variazioni termiche."
  },
  {
    type: "Scrofe (Parto)",
    thermoneutrality: "18 – 22",
    refTemp: 18,
    idealRH: "50 – 70",
    refRH: 60,
    notes: "Compromesso termico necessario tra scrofa (fresco) e nidiata (caldo)."
  },
  {
    type: "Scrofe (Gestazione)",
    thermoneutrality: "15 – 20",
    refTemp: 18,
    idealRH: "50 – 75",
    refRH: 65,
    notes: "Sotto i 15°C il fabbisogno energetico di mantenimento aumenta molto."
  },
  {
    type: "Suinetti (Post-svezz. < 25kg)",
    thermoneutrality: "22 – 27",
    refTemp: 22,
    idealRH: "60 – 70",
    refRH: 60,
    notes: "Molto sensibili: richiedono calore costante per evitare diarree e blocchi."
  },
  {
    type: "Polli da Carne",
    thermoneutrality: "18 – 24",
    refTemp: 18,
    idealRH: "50 – 70",
    refRH: 60,
    notes: "Monitorare la lettiera; l'umidità eccessiva causa problemi podali."
  },
  {
    type: "Galline Ovaiole",
    thermoneutrality: "18 – 24",
    refTemp: 18,
    idealRH: "50 – 70",
    refRH: 60,
    notes: "Sotto i 10°C cala la deposizione; sotto i 0°C rischio congelamento creste."
  },
  {
    type: "Caprini",
    thermoneutrality: "10 – 18",
    refTemp: 14,
    idealRH: "50 – 70",
    refRH: 65,
    notes: "Temono l'umidità eccessiva e gli ambienti chiusi senza ricambio d'aria."
  },
  {
    type: "Ovini",
    thermoneutrality: "8 – 15",
    refTemp: 12,
    idealRH: "50 – 70",
    refRH: 65,
    notes: "La lana protegge bene dal freddo, ma soffrono molto se il vello è bagnato."
  },
  {
    type: "Equini",
    thermoneutrality: "5 – 15",
    refTemp: 12,
    idealRH: "40 – 70",
    refRH: 55,
    notes: "Tollerano bene il freddo se hanno fieno a volontà per produrre calore."
  },
  {
    type: "Conigli",
    thermoneutrality: "15 – 20",
    refTemp: 18,
    idealRH: "60 – 75",
    refRH: 60,
    notes: "Molto sensibili a UR > 80% (rischio shock termico e malattie respiratorie)."
  },
  {
    type: "Cani (Taglia media)",
    thermoneutrality: "15 – 22",
    refTemp: 18,
    idealRH: "45 – 65",
    refRH: 55,
    notes: "I valori variano significativamente in base alla razza e alla tipologia di pelo."
  },
  {
    type: "Gatti",
    thermoneutrality: "18 – 25",
    refTemp: 20,
    idealRH: "45 – 65",
    refRH: 55,
    notes: "Cercano attivamente zone calde; hanno una ZNT più alta rispetto ai cani."
  }
];
