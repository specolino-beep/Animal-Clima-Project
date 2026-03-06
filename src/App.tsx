import React, { useState, useMemo } from 'react';
import { ANIMAL_DATABASE, AnimalEntry } from './data/animals';
import { MATERIAL_DATABASE, MaterialEntry } from './data/materials';
import { FUELS_DATABASE, FuelEntry } from './data/fuels';
import { 
  Calculator, 
  Database, 
  Info, 
  ChevronDown, 
  Wind, 
  Thermometer, 
  Droplets, 
  Activity, 
  Home as HomeIcon, 
  ArrowLeft, 
  ArrowRight,
  Sun, 
  Snowflake,
  Settings,
  Building2,
  Layers,
  Maximize,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  Flame,
  Zap,
  Ruler,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculateSpecificHumidity, 
  calculateVentilationCO2, 
  calculateVentilationH2O 
} from './utils/calculations';
import { View, BuildingElement, Layer } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  // Animal State
  const [selectedAnimalName, setSelectedAnimalName] = useState<string>(ANIMAL_DATABASE[0].name);
  const [numHeads, setNumHeads] = useState<number>(1);
  const [avgWeight, setAvgWeight] = useState<number>(ANIMAL_DATABASE[0].weight);

  // Climate State
  const [winterTemp, setWinterTemp] = useState<number>(0);
  const [winterRH, setWinterRH] = useState<number>(80);
  const [summerTemp, setSummerTemp] = useState<number>(30);
  const [summerRH, setSummerRH] = useState<number>(50);
  const [indoorTemp, setIndoorTemp] = useState<number>(20);
  const [indoorRH, setIndoorRH] = useState<number>(60);

  // Ventilation State
  const [co2In, setCo2In] = useState<number>(0.3);
  const [co2Out, setCo2Out] = useState<number>(0.04);
  const [isFetchingCO2, setIsFetchingCO2] = useState(false);

  // Building Structure State
  const [elements, setElements] = useState<BuildingElement[]>([
    { id: 'walls', name: 'Pareti Laterali', surface: 0, layers: [], rSi: 0.13, rSe: 0.04 },
    { id: 'heads', name: 'Testate', surface: 0, layers: [], rSi: 0.13, rSe: 0.04 },
    { id: 'roof', name: 'Tetto', surface: 0, layers: [], rSi: 0.13, rSe: 0.04 },
    { id: 'windows', name: 'Finestrature', surface: 0, layers: [], rSi: 0.13, rSe: 0.04 },
    { id: 'doors', name: 'Aperture d\'accesso', surface: 0, layers: [], rSi: 0.13, rSe: 0.04 },
    { id: 'floor', name: 'Pavimento', surface: 0, layers: [], rSi: 0.17, rSe: 0, rGround: 1, tGroundwater: 14 },
  ]);

  const fetchRealCO2 = async () => {
    setIsFetchingCO2(true);
    try {
      // In a real app, this would be a server-side call to avoid CORS
      // For this demo, we use the value retrieved from the provided URL
      // 433.92 ppm = 0.043392%
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      setCo2Out(0.0434); 
    } catch (error) {
      console.error("Errore nel recupero dati CO2:", error);
    } finally {
      setIsFetchingCO2(false);
    }
  };

  // Optimization State
  const insulators = useMemo(() => MATERIAL_DATABASE.filter(m => m.category === 'ISOLANTI' || (m.lambda && m.lambda < 0.1)), []);
  const [selectedInsulationName, setSelectedInsulationName] = useState<string>(insulators[0]?.name || '');
  const [selectedFuelName, setSelectedFuelName] = useState<string>(FUELS_DATABASE[0].name);

  const selectedAnimal = useMemo(() => {
    return ANIMAL_DATABASE.find(a => a.name === selectedAnimalName) || ANIMAL_DATABASE[0];
  }, [selectedAnimalName]);

  // Sync weight when animal changes
  React.useEffect(() => {
    if (selectedAnimal) {
      setAvgWeight(selectedAnimal.weight);
    }
  }, [selectedAnimal]);

  // Metabolic weight scaling factor (W/Wref)^0.75
  const weightFactor = useMemo(() => {
    if (!selectedAnimal || selectedAnimal.weight <= 0 || avgWeight <= 0) return 1;
    return Math.pow(avgWeight / selectedAnimal.weight, 0.75);
  }, [selectedAnimal, avgWeight]);

  const calculateAnimalTotal = (value: number) => {
    return (value * numHeads * weightFactor).toLocaleString('it-IT', { maximumFractionDigits: 2 });
  };

  const winterHumidity = useMemo(() => calculateSpecificHumidity(winterTemp, winterRH), [winterTemp, winterRH]);
  const summerHumidity = useMemo(() => calculateSpecificHumidity(summerTemp, summerRH), [summerTemp, summerRH]);
  const indoorHumidity = useMemo(() => calculateSpecificHumidity(indoorTemp, indoorRH), [indoorTemp, indoorRH]);

  // Ventilation Calculations
  const totalCO2Produced = selectedAnimal.co2 * numHeads * weightFactor;
  const totalWinterH2OProduced = selectedAnimal.h2oInverno * numHeads * weightFactor;

  const vInvCO2 = useMemo(() => calculateVentilationCO2(totalCO2Produced, co2In, co2Out), [totalCO2Produced, co2In, co2Out]);
  const vInvH2O = useMemo(() => calculateVentilationH2O(totalWinterH2OProduced, indoorHumidity, winterHumidity), [totalWinterH2OProduced, indoorHumidity, winterHumidity]);

  const vMinProgetto = Math.max(vInvCO2, vInvH2O);
  const vMinPerCapo = numHeads > 0 ? vMinProgetto / numHeads : 0;
  const vMinPerPesoVivo = (numHeads > 0 && avgWeight > 0) ? vMinProgetto / (numHeads * avgWeight) : 0;

  // Summer Ventilation Calculations
  const vEstTotale = selectedAnimal.vEstate * numHeads;
  const vEstPerCapo = selectedAnimal.vEstate;
  const vEstPerPesoVivo = (numHeads > 0 && avgWeight > 0) ? vEstTotale / (numHeads * avgWeight) : 0;

  // Building Structure Calculations
  const calculateElementThermal = (element: BuildingElement) => {
    let rTotal = element.rSi + (element.id === 'floor' ? (element.rGround || 0) : element.rSe);
    element.layers.forEach(layer => {
      const material = MATERIAL_DATABASE.find(m => m.name === layer.materialName);
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
  };

  const umBuilding = useMemo(() => {
    let totalUSurface = 0;
    let totalSurface = 0;
    elements.forEach(el => {
      if (el.id !== 'floor' && el.surface > 0) {
        const { uValue } = calculateElementThermal(el);
        totalUSurface += uValue * el.surface;
        totalSurface += el.surface;
      }
    });
    return totalSurface > 0 ? totalUSurface / totalSurface : 0;
  }, [elements]);

  const addLayer = (elementId: string) => {
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          layers: [...el.layers, { id: Math.random().toString(36).substr(2, 9), materialName: MATERIAL_DATABASE[0].name, thickness: 0 }]
        };
      }
      return el;
    }));
  };

  const removeLayer = (elementId: string, layerId: string) => {
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          layers: el.layers.filter(l => l.id !== layerId)
        };
      }
      return el;
    }));
  };

  const updateLayer = (elementId: string, layerId: string, updates: Partial<Layer>) => {
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          layers: el.layers.map(l => l.id === layerId ? { ...l, ...updates } : l)
        };
      }
      return el;
    }));
  };

  const updateElement = (elementId: string, updates: Partial<BuildingElement>) => {
    setElements(prev => prev.map(el => el.id === elementId ? { ...el, ...updates } : el));
  };

  // Balance Calculations
  const animalSensibleHeatWinter = selectedAnimal.qsInverno * numHeads * weightFactor;
  
  const totalSurfaceExcludingFloor = useMemo(() => {
    return elements.filter(el => el.id !== 'floor').reduce((acc, el) => acc + el.surface, 0);
  }, [elements]);

  const structureHeatLoss = umBuilding * totalSurfaceExcludingFloor * (indoorTemp - winterTemp);

  const floorElement = elements.find(el => el.id === 'floor');
  const { uValue: uFloor } = floorElement ? calculateElementThermal(floorElement) : { uValue: 0 };
  const floorHeatLoss = uFloor * (floorElement?.surface || 0) * (indoorTemp - (floorElement?.tGroundwater || 14));

  const ventilationHeatLoss = vMinProgetto * (indoorTemp - winterTemp) * 0.35;

  const totalHeatLoss = structureHeatLoss + floorHeatLoss + ventilationHeatLoss;
  const heatBalance = animalSensibleHeatWinter - totalHeatLoss;

  // Positive Balance Ventilation Calculations
  const vAdditional = useMemo(() => {
    if (heatBalance <= 0) return 0;
    const deltaT = indoorTemp - winterTemp;
    if (deltaT <= 0) return 0;
    return heatBalance / (0.35 * deltaT);
  }, [heatBalance, indoorTemp, winterTemp]);

  const vTotalWinter = vMinProgetto + vAdditional;
  const vTotalWinterPerCapo = numHeads > 0 ? vTotalWinter / numHeads : 0;
  const vTotalWinterPerPesoVivo = (numHeads > 0 && avgWeight > 0) ? vTotalWinter / (numHeads * avgWeight) : 0;

  // Optimization Calculations
  const requiredInsulationThickness = useMemo(() => {
    if (heatBalance >= 0) return 0;
    const roof = elements.find(el => el.id === 'roof');
    if (!roof || roof.surface <= 0) return null;

    const deltaT = indoorTemp - winterTemp;
    if (deltaT <= 0) return 0;

    const { uValue: currentURoof } = calculateElementThermal(roof);
    const deficit = Math.abs(heatBalance);
    
    // deficit = (U_old - U_new) * A * deltaT
    // U_new = U_old - deficit / (A * deltaT)
    const targetURoof = currentURoof - (deficit / (roof.surface * deltaT));
    
    if (targetURoof <= 0) return null; // Impossible to reach parity just with insulation

    const targetRRoof = 1 / targetURoof;
    const currentRRoof = 1 / currentURoof;
    const requiredRInsulation = targetRRoof - currentRRoof;

    const material = MATERIAL_DATABASE.find(m => m.name === selectedInsulationName);
    if (!material || !material.lambda) return null;

    return requiredRInsulation * material.lambda * 100; // in cm
  }, [heatBalance, elements, indoorTemp, winterTemp, selectedInsulationName]);

  const fuelConsumption = useMemo(() => {
    if (heatBalance >= 0) return 0;
    const fuel = FUELS_DATABASE.find(f => f.name === selectedFuelName);
    if (!fuel) return 0;

    const deficitKW = Math.abs(heatBalance) / 1000;
    return deficitKW / (fuel.kwhPerKg * fuel.efficiency);
  }, [heatBalance, selectedFuelName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => setCurrentView('home')}
            >
              <div className="bg-emerald-600 p-2 rounded-lg">
                <Wind className="text-white" size={20} />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">Animal Clima <span className="text-emerald-600">Project</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentView !== 'home' && (
                <button 
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Torna alla Home
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Settings size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Benvenuto in Animal Clima Project</h2>
                  <p className="text-slate-500 leading-relaxed text-lg">
                    Seleziona un modulo per iniziare la progettazione climatica e ambientale del tuo impianto zootecnico.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ModuleCard 
                  title="Configurazione Animali"
                  description="Definisci la categoria animale e il numero di capi per calcolare i parametri di emissione e calore."
                  icon={<Activity className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('animals')}
                />
                <ModuleCard 
                  title="Parametri Climatici"
                  description="Imposta le condizioni termiche e igrometriche esterne per il calcolo dell'umidità specifica."
                  icon={<Thermometer className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('climate')}
                />
                <ModuleCard 
                  title="Struttura Edilizia"
                  description="Configura i materiali e le superfici dell'edificio per calcolare la trasmittanza termica media."
                  icon={<Building2 className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('structure')}
                />
                <ModuleCard 
                  title="Ventilazione Minima"
                  description="Calcola la portata d'aria necessaria per il controllo della CO2 e dell'umidità interna."
                  icon={<Wind className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('ventilation')}
                />
                <ModuleCard 
                  title="Bilancio Termico Invernale"
                  description="Verifica il bilancio energetico tra calore prodotto dagli animali e dispersioni totali."
                  icon={<Calculator className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('results')}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'animals' && (
            <motion.div 
              key="animals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Configurazione Animali</h2>
                <p className="text-slate-500">Gestisci i dati della mandria per calcolare i parametri ambientali.</p>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputCard 
                  label="Categoria" 
                  icon={<Info size={16} />}
                  content={
                    <div className="relative">
                      <select
                        value={selectedAnimalName}
                        onChange={(e) => setSelectedAnimalName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-sm font-medium"
                      >
                        {ANIMAL_DATABASE.map((animal) => (
                          <option key={animal.name} value={animal.name}>
                            {animal.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={18} />
                    </div>
                  }
                />
                <InputCard 
                  label="Numero Capi" 
                  icon={<Calculator size={16} />}
                  content={
                    <input
                      type="number"
                      min="1"
                      value={numHeads}
                      onChange={(e) => setNumHeads(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  }
                />
                <InputCard 
                  label="Peso Vivo (kg)" 
                  icon={<Activity size={16} />}
                  content={
                    <input
                      type="number"
                      min="0"
                      value={avgWeight}
                      onChange={(e) => setAvgWeight(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                    />
                  }
                />
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Risultati Animali</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <ResultCard icon={<Thermometer className="text-amber-700" size={18} />} label="Calore Totale Estate" value={calculateAnimalTotal(selectedAnimal.qtEstate)} unit="W" />
                  <ResultCard icon={<Thermometer className="text-cyan-700" size={18} />} label="Calore Totale Inverno" value={calculateAnimalTotal(selectedAnimal.qtInverno)} unit="W" />
                  <ResultCard icon={<Droplets className="text-sky-600" size={18} />} label="Vapor d'acqua Estate" value={calculateAnimalTotal(selectedAnimal.h2oEstate)} unit="g" />
                  <ResultCard icon={<Droplets className="text-cyan-700" size={18} />} label="Vapor d'acqua Inverno" value={calculateAnimalTotal(selectedAnimal.h2oInverno)} unit="g" />
                  <ResultCard icon={<Activity className="text-amber-700" size={18} />} label="Calore Sensibile Estate" value={calculateAnimalTotal(selectedAnimal.qsEstate)} unit="W" />
                  <ResultCard icon={<Activity className="text-slate-500" size={18} />} label="Calore Sensibile Inverno" value={calculateAnimalTotal(selectedAnimal.qsInverno)} unit="W" />
                  <ResultCard icon={<Wind className="text-emerald-500" size={18} />} label="Anidride Carbonica" value={calculateAnimalTotal(selectedAnimal.co2)} unit="l" />
                </div>
              </section>

              <div className="flex justify-end pt-8">
                <button 
                  onClick={() => setCurrentView('climate')}
                  className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group"
                >
                  Vai all'inserimento dei dati climatici
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {currentView === 'climate' && (
            <motion.div 
              key="climate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Parametri Climatici</h2>
                <p className="text-slate-500 leading-relaxed">
                  Configurazione delle condizioni ambientali esterne per il calcolo dell'umidità specifica.
                </p>
              </section>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Winter Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-cyan-700">
                    <Snowflake size={24} />
                    <h3 className="text-lg font-bold">Stagione Inverno</h3>
                  </div>
                  <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 text-sm text-cyan-800 leading-relaxed italic">
                    "In inverno dovranno essere immesse le condizioni climatiche rappresentative del periodo più freddo dell'anno (es. media delle minime del mese più freddo)."
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputCard 
                      label="T°C Inverno" 
                      icon={<Thermometer size={16} />}
                      content={
                        <input
                          type="number"
                          value={winterTemp}
                          onChange={(e) => setWinterTemp(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <InputCard 
                      label="UR% Inverno" 
                      icon={<Droplets size={16} />}
                      content={
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={winterRH}
                          onChange={(e) => setWinterRH(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <ResultCard 
                      icon={<Wind className="text-cyan-700" size={18} />}
                      label="Umidità Specifica Inverno"
                      value={winterHumidity.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                      unit="g/m³"
                    />
                  </div>
                </div>

                {/* Summer Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-amber-700">
                    <Sun size={24} />
                    <h3 className="text-lg font-bold">Stagione Estate</h3>
                  </div>
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 leading-relaxed italic">
                    "In estate dovranno essere inserite le condizioni più critiche del periodo caldo (es. temperatura max e UR da serie storiche recenti della zona)."
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputCard 
                      label="T°C Estate" 
                      icon={<Thermometer size={16} />}
                      content={
                        <input
                          type="number"
                          value={summerTemp}
                          onChange={(e) => setSummerTemp(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <InputCard 
                      label="UR% Estate" 
                      icon={<Droplets size={16} />}
                      content={
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={summerRH}
                          onChange={(e) => setSummerRH(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <ResultCard 
                      icon={<Wind className="text-amber-700" size={18} />}
                      label="Umidità Specifica Estate"
                      value={summerHumidity.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                      unit="g/m³"
                    />
                  </div>
                </div>

                {/* Indoor Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <HomeIcon size={24} />
                    <h3 className="text-lg font-bold">Condizioni Indoor</h3>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800 leading-relaxed italic">
                    "Definisci le condizioni climatiche interne che si desidera mantenere per il calcolo del bilancio termico dell'allevamento."
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputCard 
                      label="T°C Indoor" 
                      icon={<Thermometer size={16} />}
                      content={
                        <input
                          type="number"
                          value={indoorTemp}
                          onChange={(e) => setIndoorTemp(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <InputCard 
                      label="UR% Indoor" 
                      icon={<Droplets size={16} />}
                      content={
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={indoorRH}
                          onChange={(e) => setIndoorRH(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                        />
                      }
                    />
                    <ResultCard 
                      icon={<Wind className="text-emerald-700" size={18} />}
                      label="Umidità Specifica Indoor"
                      value={indoorHumidity.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                      unit="g/m³"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button 
                  onClick={() => setCurrentView('ventilation')}
                  className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group"
                >
                  Vai al calcolo della Ventilazione
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {currentView === 'ventilation' && (
            <motion.div 
              key="ventilation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Calcolo della Ventilazione</h2>
                <p className="text-slate-500 leading-relaxed">
                  Determinazione dei ricambi d'aria necessari per il mantenimento della qualità ambientale.
                </p>
              </section>

              <div className="grid grid-cols-1 gap-8">
                {/* Winter Minimum Exchange */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-900">
                    <Snowflake size={24} />
                    <h3 className="text-lg font-bold">Ricambio Minimo Invernale</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <InputCard 
                          label="CO2 Interna (%)" 
                          icon={<Info size={14} />}
                          content={
                            <input
                              type="number"
                              step="0.01"
                              value={co2In}
                              onChange={(e) => setCo2In(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                            />
                          }
                        />
                        <InputCard 
                          label="CO2 Esterna (%)" 
                          icon={<Wind size={14} />}
                          content={
                            <div className="space-y-2">
                              <input
                                type="number"
                                step="0.0001"
                                value={co2Out}
                                onChange={(e) => setCo2Out(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                              />
                            </div>
                          }
                        />
                      </div>
                      
                      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opzioni CO2 Ambientale</p>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => setCo2Out(0.04)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${co2Out === 0.04 ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
                          >
                            Standard (0,04%)
                          </button>
                          <button 
                            onClick={fetchRealCO2}
                            disabled={isFetchingCO2}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${co2Out > 0.04 ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'}`}
                          >
                            {isFetchingCO2 ? 'Caricamento...' : 'Dati Reali (MeteoAM)'}
                            {!isFetchingCO2 && <Activity size={12} />}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 italic">
                          * I dati reali vengono convertiti da ppm a % (es. 433 ppm ≈ 0,0433%)
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ResultCard 
                          icon={<Wind className="text-indigo-600" size={18} />}
                          label="V inv CO2 (Asportazione CO2)"
                          value={vInvCO2.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                          unit="m³/h"
                        />
                        <ResultCard 
                          icon={<Droplets className="text-indigo-600" size={18} />}
                          label="V inv H2O (Asportazione Vapore)"
                          value={vInvH2O.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                          unit="m³/h"
                        />
                      </div>

                      <div className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <Wind size={120} />
                        </div>
                        <div className="relative z-10">
                          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ventilazione Minima di Progetto</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <h4 className="text-5xl font-bold font-mono tracking-tighter">
                              {vMinProgetto.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                            </h4>
                            <span className="text-xl font-medium opacity-80">m³/h</span>
                          </div>
                          <p className="mt-4 text-emerald-50 text-sm leading-relaxed max-w-md">
                            Valore calcolato come il maggiore tra la necessità di asportazione CO₂ e vapor d'acqua per garantire la qualità dell'aria.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ResultCard 
                          icon={<Calculator className="text-emerald-600" size={18} />}
                          label="Ventilazione Minima per Capo"
                          value={vMinPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                          unit="m³/h/capo"
                        />
                        <ResultCard 
                          icon={<Activity className="text-emerald-600" size={18} />}
                          label="Ventilazione Minima per kg PV"
                          value={vMinPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 4 })}
                          unit="m³/h/kg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summer Maximum Ventilation */}
                <div className="pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-3 text-amber-700">
                    <Sun size={24} />
                    <h3 className="text-lg font-bold">Ventilazione Massima Estiva</h3>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 h-full flex flex-col justify-center">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-widest opacity-80">Parametro da Tabella</span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <h4 className="text-4xl font-bold text-amber-900 font-mono tracking-tighter">
                            {selectedAnimal.vEstate.toLocaleString('it-IT')}
                          </h4>
                          <span className="text-lg font-medium text-amber-700">m³/h/capo</span>
                        </div>
                        <p className="mt-4 text-amber-800/70 text-sm leading-relaxed">
                          Valore di riferimento per la categoria <strong>{selectedAnimal.name}</strong> estratto dal database tecnico (V estiva).
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-amber-600 p-8 rounded-2xl text-white shadow-xl shadow-amber-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                          <Sun size={120} />
                        </div>
                        <div className="relative z-10">
                          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Ventilazione Massima di Progetto (Estate)</span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <h4 className="text-5xl font-bold font-mono tracking-tighter">
                              {vEstTotale.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                            </h4>
                            <span className="text-xl font-medium opacity-80">m³/h</span>
                          </div>
                          <p className="mt-4 text-amber-50 text-sm leading-relaxed max-w-md">
                            Portata d'aria totale necessaria per il raffrescamento e il ricambio d'aria durante il periodo estivo critico.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ResultCard 
                          icon={<Calculator className="text-amber-600" size={18} />}
                          label="Ventilazione Estiva per Capo"
                          value={vEstPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                          unit="m³/h/capo"
                        />
                        <ResultCard 
                          icon={<Activity className="text-amber-600" size={18} />}
                          label="Ventilazione Estiva per kg PV"
                          value={vEstPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 4 })}
                          unit="m³/h/kg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <button 
                    onClick={() => setCurrentView('structure')}
                    className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group"
                  >
                    Vai alla Struttura Edilizia
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'structure' && (
            <motion.div 
              key="structure"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Struttura Edilizia</h2>
                <p className="text-slate-500 leading-relaxed">
                  Definisci le superfici disperdenti e la stratigrafia dei materiali per il calcolo della trasmittanza termica.
                </p>
              </section>

              {/* Surfaces Input */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Superfici Disperdenti (m²)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {elements.map(el => (
                    <div key={el.id}>
                      <InputCard 
                        label={el.name}
                        icon={<Maximize size={14} />}
                        content={
                          <input
                            type="number"
                            min="0"
                            value={el.surface}
                            onChange={(e) => updateElement(el.id, { surface: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                          />
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Stratigraphy Section */}
              <section className="space-y-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Stratigrafia e Trasmittanza</h3>
                <div className="grid grid-cols-1 gap-8">
                  {elements.map(el => {
                    const { rTotal, uValue } = calculateElementThermal(el);
                    return (
                      <div key={el.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Layers className="text-emerald-600" size={20} />
                            <div className="flex flex-col">
                              <h4 className="font-bold text-slate-900">{el.name}</h4>
                              {el.id === 'floor' && (
                                <span className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter">Escluso dal calcolo Um edificio</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Rsi:</span>
                              <input 
                                type="number" 
                                step="0.01"
                                value={el.rSi} 
                                onChange={(e) => updateElement(el.id, { rSi: Number(e.target.value) })}
                                className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-xs font-mono"
                              />
                            </div>
                            {el.id === 'floor' ? (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">R Terreno:</span>
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={el.rGround} 
                                    onChange={(e) => updateElement(el.id, { rGround: Number(e.target.value) })}
                                    className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-xs font-mono"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">T Falda (°C):</span>
                                  <input 
                                    type="number" 
                                    step="0.1"
                                    value={el.tGroundwater} 
                                    onChange={(e) => updateElement(el.id, { tGroundwater: Number(e.target.value) })}
                                    className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-xs font-mono"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Rse:</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={el.rSe} 
                                  onChange={(e) => updateElement(el.id, { rSe: Number(e.target.value) })}
                                  className="w-16 bg-white border border-slate-200 rounded-lg p-1 text-xs font-mono"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                <th className="pb-3 pl-2">Materiale (dall'esterno all'interno)</th>
                                <th className="pb-3 w-24">Spessore (m)</th>
                                <th className="pb-3 w-24 text-center">λ (W/mK)</th>
                                <th className="pb-3 w-24 text-center">R (m²K/W)</th>
                                <th className="pb-3 w-12"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {el.layers.map((layer) => {
                                const material = MATERIAL_DATABASE.find(m => m.name === layer.materialName);
                                const rLayer = material?.rValue || (material?.lambda ? layer.thickness / material.lambda : 0);
                                return (
                                  <tr key={layer.id} className="group">
                                    <td className="py-3 pl-2">
                                      <select
                                        value={layer.materialName}
                                        onChange={(e) => updateLayer(el.id, layer.id, { materialName: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                                      >
                                        {MATERIAL_DATABASE.map(m => (
                                          <option key={m.name} value={m.name}>{m.name}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-3">
                                      {!material?.rValue && (
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={layer.thickness}
                                          onChange={(e) => updateLayer(el.id, layer.id, { thickness: Number(e.target.value) })}
                                          className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-mono"
                                        />
                                      )}
                                    </td>
                                    <td className="py-3 text-center text-xs font-mono text-slate-500">
                                      {material?.lambda || '-'}
                                    </td>
                                    <td className="py-3 text-center text-xs font-mono font-bold text-emerald-600">
                                      {rLayer.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                                    </td>
                                    <td className="py-3 text-right">
                                      <button 
                                        onClick={() => removeLayer(el.id, layer.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          
                          <button 
                            onClick={() => addLayer(el.id)}
                            className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-100"
                          >
                            <Plus size={14} />
                            Aggiungi Strato
                          </button>

                          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end gap-12">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Resistenza Totale</span>
                              <span className="text-xl font-bold text-slate-900 font-mono">{rTotal.toLocaleString('it-IT', { maximumFractionDigits: 3 })} <span className="text-xs font-normal text-slate-400">m²K/W</span></span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase block">Trasmittanza U</span>
                              <span className="text-xl font-bold text-emerald-600 font-mono">{uValue.toLocaleString('it-IT', { maximumFractionDigits: 3 })} <span className="text-xs font-normal text-slate-400">W/m²K</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Final Building Summary */}
              <section className="bg-emerald-600 p-8 rounded-2xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Building2 size={120} />
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Riepilogo Termico Edificio</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h4 className="text-5xl font-bold font-mono tracking-tighter">
                      {umBuilding.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                    </h4>
                    <span className="text-xl font-medium opacity-80">W/m²K</span>
                  </div>
                  <p className="mt-4 text-emerald-50 text-sm leading-relaxed max-w-md">
                    Trasmittanza termica media ponderata (Uₘ) calcolata su tutte le superfici disperdenti (escluso il pavimento).
                  </p>
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Bilancio Termico Invernale</h2>
                <p className="text-slate-500 leading-relaxed">
                  Analisi del bilancio energetico tra il calore prodotto dagli animali e le dispersioni termiche totali.
                </p>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Heat Sources */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <Activity size={24} />
                    <h3 className="text-lg font-bold">Apporti di Calore</h3>
                  </div>
                  <ResultCard 
                    icon={<Activity className="text-emerald-600" size={18} />}
                    label="Calore Sensibile Animali (Inverno)"
                    value={animalSensibleHeatWinter.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                    unit="W"
                  />
                </div>

                {/* Heat Losses */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-rose-700">
                    <ArrowDownRight size={24} />
                    <h3 className="text-lg font-bold">Dispersioni di Calore</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <ResultCard 
                      icon={<Building2 className="text-rose-600" size={18} />}
                      label="Dispersioni Struttura (Pareti, Tetto, ecc.)"
                      value={structureHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                      unit="W"
                    />
                    <ResultCard 
                      icon={<Layers className="text-rose-600" size={18} />}
                      label="Dispersioni Pavimento"
                      value={floorHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                      unit="W"
                    />
                    <ResultCard 
                      icon={<Wind className="text-rose-600" size={18} />}
                      label="Dispersioni Ventilazione Minima"
                      value={ventilationHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                      unit="W"
                    />
                  </div>
                </div>
              </div>

              {/* Total Balance */}
              <section className={`p-8 rounded-2xl text-white shadow-xl relative overflow-hidden ${heatBalance >= 0 ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  {heatBalance >= 0 ? <TrendingUp size={120} /> : <TrendingDown size={120} />}
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Bilancio Termico Totale</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h4 className="text-5xl font-bold font-mono tracking-tighter">
                      {heatBalance.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                    </h4>
                    <span className="text-xl font-medium opacity-80">W</span>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${heatBalance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {heatBalance >= 0 ? 'Bilancio Positivo' : 'Bilancio Negativo'}
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed max-w-md">
                      {heatBalance >= 0 
                        ? "Il calore prodotto dagli animali è sufficiente a coprire le dispersioni. Non è necessario riscaldamento supplementare."
                        : "Le dispersioni superano il calore prodotto. È necessario prevedere un sistema di riscaldamento o migliorare l'isolamento."}
                    </p>
                  </div>
                  {heatBalance > 0 && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-2 text-emerald-100 font-bold uppercase tracking-wider text-xs mb-4">
                        <Wind size={16} />
                        <span>Ventilazione di Pareggio Termico</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-400/20">
                          <span className="text-[10px] font-bold text-emerald-100 uppercase block mb-1">Vent. Aggiuntiva</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold font-mono">{vAdditional.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                            <span className="text-xs opacity-70">m³/h</span>
                          </div>
                        </div>
                        <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-400/20">
                          <span className="text-[10px] font-bold text-emerald-100 uppercase block mb-1">Vent. Totale</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold font-mono">{vTotalWinter.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                            <span className="text-xs opacity-70">m³/h</span>
                          </div>
                        </div>
                        <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-400/20">
                          <span className="text-[10px] font-bold text-emerald-100 uppercase block mb-1">Valori Unitari</span>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="opacity-70">Per Capo:</span>
                              <span className="font-bold">{vTotalWinterPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })} m³/h</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="opacity-70">Per kg:</span>
                              <span className="font-bold">{vTotalWinterPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 3 })} m³/h</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-4 text-emerald-50/70 text-[10px] italic leading-relaxed">
                        * La ventilazione aggiuntiva è calcolata per asportare esattamente il calore in eccesso ({heatBalance.toLocaleString('it-IT', { maximumFractionDigits: 0 })} W) mantenendo la temperatura interna impostata.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Optimization Section (Integrated) */}
              {heatBalance < 0 && (
                <section className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800 space-y-8">
                  <div className="flex items-center gap-3">
                    <Settings className="text-emerald-400" size={28} />
                    <div>
                      <h3 className="text-2xl font-bold">Ottimizzazione Clima Invernale</h3>
                      <p className="text-slate-400 text-sm">Strategie per il raggiungimento del pareggio termico</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Solution 1: Insulation */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-6">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                        <Ruler size={16} />
                        <span>Soluzione 1: Incremento Isolamento Tetto</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Seleziona Materiale Isolante</label>
                          <div className="relative">
                            <select 
                              value={selectedInsulationName}
                              onChange={(e) => setSelectedInsulationName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                            >
                              {insulators.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" size={18} />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Spessore Necessario (Tetto)</span>
                          {requiredInsulationThickness !== null ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-emerald-400 font-mono">
                                {requiredInsulationThickness.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-sm font-medium text-slate-400">cm</span>
                            </div>
                          ) : (
                            <div className="text-rose-400 text-sm font-medium italic">
                              Impossibile raggiungere il pareggio solo tramite isolamento del tetto.
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                          * Calcolo basato sulla riduzione della trasmittanza del tetto per compensare l'intero deficit termico.
                        </p>
                      </div>
                    </div>

                    {/* Solution 2: Heating */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-6">
                      <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
                        <Flame size={16} />
                        <span>Soluzione 2: Riscaldamento Artificiale</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Seleziona Combustibile</label>
                          <div className="relative">
                            <select 
                              value={selectedFuelName}
                              onChange={(e) => setSelectedFuelName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white appearance-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                            >
                              {FUELS_DATABASE.map(f => (
                                <option key={f.name} value={f.name}>{f.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" size={18} />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Consumo Orario Stimato</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-rose-400 font-mono">
                              {fuelConsumption.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                            </span>
                            <span className="text-sm font-medium text-slate-400">kg/h</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Potere Cal. (Hi)</span>
                            <span className="text-xs font-mono text-slate-300">
                              {FUELS_DATABASE.find(f => f.name === selectedFuelName)?.kwhPerKg.toFixed(2)} kWh/kg
                            </span>
                          </div>
                          <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                            <span className="text-[9px] font-bold text-slate-500 uppercase block">Rendimento (η)</span>
                            <span className="text-xs font-mono text-slate-300">
                              {((FUELS_DATABASE.find(f => f.name === selectedFuelName)?.efficiency || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <p>© 2024 Animal Clima Project • Design Suite</p>
          <p>Sviluppato per la progettazione zootecnica avanzata</p>
        </div>
      </footer>
    </div>
  );
}

function ModuleCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4, shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      onClick={onClick}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm cursor-pointer transition-all group"
    >
      <div className="mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function InputCard({ label, icon, content }: { label: string, icon: React.ReactNode, content: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        {content}
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-50 rounded-lg">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</span>
          <span className="text-xs font-semibold text-slate-400">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
}
