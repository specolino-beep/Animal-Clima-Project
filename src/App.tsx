import React, { useState, useMemo, useEffect } from 'react';
import { ANIMAL_DATABASE } from './data/animals';
import { MATERIAL_DATABASE } from './data/materials';
import { FUELS_DATABASE } from './data/fuels';
import { 
  Calculator, 
  Wind, 
  Thermometer, 
  Activity, 
  ArrowLeft, 
  Settings,
  Building2,
  Menu,
  X,
  PawPrint
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculateSpecificHumidity, 
  calculateVentilationCO2, 
  calculateVentilationH2O,
  calculateElementThermal,
  calculateRequiredInsulationThickness,
  calculateFuelConsumption
} from './utils/calculations';
import { View, BuildingElement, Layer, ForcedVentParams, BuildingDimensions } from './types';

// Components
import { ModuleCard } from './components/Common';
import { ConfigurazioneAnimali } from './components/ConfigurazioneAnimali';
import { ParametriClimatici } from './components/ParametriClimatici';
import { ParametriVentilazione } from './components/ParametriVentilazione';
import { StrutturaEdilizia } from './components/StrutturaEdilizia';
import { RisultatiBilancio } from './components/RisultatiBilancio';
import { VentilazioneNaturale } from './components/VentilazioneNaturale';
import { VentilazioneForzata } from './components/VentilazioneForzata';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isNavOpen, setIsNavOpen] = useState(false);

  const views: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Dashboard', icon: <Activity size={18} /> },
    { id: 'animals', label: 'Configurazione Animali', icon: <Activity size={18} /> },
    { id: 'climate', label: 'Parametri Climatici', icon: <Thermometer size={18} /> },
    { id: 'structure', label: 'Struttura Edilizia', icon: <Building2 size={18} /> },
    { id: 'ventilation', label: 'Ventilazione Minima', icon: <Wind size={18} /> },
    { id: 'results', label: 'Bilancio Termico', icon: <Calculator size={18} /> },
    { id: 'natural_vent', label: 'Ventilazione Naturale', icon: <Wind size={18} /> },
    { id: 'forced_vent', label: 'Ventilazione Forzata', icon: <Wind size={18} /> },
  ];

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

  // Natural Ventilation State
  const [naturalVentParams, setNaturalVentParams] = useState({
    hOut: 6,
    hIn: 1.5,
    ventType: 'cupolino' as 'cupolino' | 'camini',
    buildingLength: 50,
    chimneyDiameter: 0.6
  });

  // Forced Ventilation State
  const [forcedVentParams, setForcedVentParams] = useState<ForcedVentParams>({
    mode: 'preset',
    selectedFanId: 'f1',
    useInverter: false,
    inverterEfficiency: 0.9,
    winterFansCount: 1,
    ventilationType: 'longitudinal',
  });

  // Building Dimensions State
  const [buildingDimensions, setBuildingDimensions] = useState<BuildingDimensions>({
    length: 50,
    width: 20,
    ridgeHeight: 6,
    eaveHeight: 4
  });

  const selectedAnimal = useMemo(() => {
    return ANIMAL_DATABASE.find(a => a.name === selectedAnimalName) || ANIMAL_DATABASE[0];
  }, [selectedAnimalName]);

  // Sync weight when animal changes
  useEffect(() => {
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
  const umBuilding = useMemo(() => {
    let totalUSurface = 0;
    let totalSurface = 0;
    elements.forEach(el => {
      if (el.id !== 'floor' && el.surface > 0) {
        const { uValue } = calculateElementThermal(el, MATERIAL_DATABASE);
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
  const { uValue: uFloor } = floorElement ? calculateElementThermal(floorElement, MATERIAL_DATABASE) : { uValue: 0 };
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
    return calculateRequiredInsulationThickness(
      heatBalance,
      elements,
      indoorTemp,
      winterTemp,
      selectedInsulationName,
      MATERIAL_DATABASE
    );
  }, [heatBalance, elements, indoorTemp, winterTemp, selectedInsulationName]);

  const fuelConsumption = useMemo(() => {
    return calculateFuelConsumption(heatBalance, selectedFuelName, FUELS_DATABASE);
  }, [heatBalance, selectedFuelName]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <div 
                className="bg-emerald-600 p-2 rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors relative group"
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                <PawPrint className="text-white" size={20} />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-emerald-600">
                  <Menu size={8} className="text-emerald-600" />
                </div>
              </div>
              <div 
                className="cursor-pointer" 
                onClick={() => setCurrentView('home')}
              >
                <span className="text-lg font-extrabold tracking-tight text-slate-900 font-montserrat">Animal Clima <span className="text-emerald-600">Project</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentView !== 'home' && (
                <button 
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm"
                >
                  <ArrowLeft size={16} />
                  Torna alla Home
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu Overlay */}
        <AnimatePresence>
          {isNavOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNavOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              />
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 p-6 flex flex-col"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-extrabold text-slate-900 font-montserrat">Menu <span className="text-emerald-600">Moduli</span></span>
                  <button onClick={() => setIsNavOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>
                <div className="space-y-2 flex-grow overflow-y-auto">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => {
                        setCurrentView(view.id);
                        setIsNavOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        currentView === view.id 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={currentView === view.id ? 'text-emerald-600' : 'text-slate-400'}>
                        {view.icon}
                      </span>
                      {view.label}
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Animal Clima Project v1.0</p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
              <section className="bg-slate-800 rounded-2xl p-8 shadow-lg relative overflow-hidden border-none">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                  <Settings size={120} />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-2xl font-extrabold text-white mb-4 tracking-tight font-montserrat"><span className="text-5xl block mb-3 leading-tight">Animal Clima Project</span>Progettare Benessere Animale</h2>
                  <p className="text-slate-200 leading-relaxed text-lg">
                    Seleziona il primo modulo per iniziare la progettazione climatica e ambientale della struttura.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ModuleCard 
                  title="1. Configurazione Animali"
                  description="Definisci la categoria animale e il numero di capi per calcolare i parametri di emissione e calore."
                  icon={<Activity className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('animals')}
                />
                <ModuleCard 
                  title="2. Parametri Climatici"
                  description="Imposta le condizioni termiche e igrometriche esterne per il calcolo dell'umidità specifica."
                  icon={<Thermometer className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('climate')}
                />
                <ModuleCard 
                  title="3. Struttura Edilizia, Materiali e Caratteristiche Termiche"
                  description="Configura i materiali e le superfici dell'edificio per calcolare la trasmittanza termica media."
                  icon={<Building2 className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('structure')}
                />
                <ModuleCard 
                  title="4. Ventilazione per Ricambio dell'Aria"
                  description="Calcola la portata d'aria necessaria per il controllo della CO2 e dell'umidità interna."
                  icon={<Wind className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('ventilation')}
                />
                <ModuleCard 
                  title="5. Bilancio Termico Invernale"
                  description="Verifica il bilancio energetico tra calore prodotto dagli animali e dispersioni totali."
                  icon={<Calculator className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('results')}
                />
                <ModuleCard 
                  title="6. Ventilazione Naturale"
                  description="Dimensiona le aperture d'uscita per l'effetto camino invernale."
                  icon={<Wind className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('natural_vent')}
                />
                <ModuleCard 
                  title="7. Ventilazione Forzata"
                  description="Configura i ventilatori, calcola il numero necessario e i consumi energetici."
                  icon={<Wind className="text-emerald-600" size={32} />}
                  onClick={() => setCurrentView('forced_vent')}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'animals' && (
            <ConfigurazioneAnimali 
              selectedAnimalName={selectedAnimalName}
              setSelectedAnimalName={setSelectedAnimalName}
              numHeads={numHeads}
              setNumHeads={setNumHeads}
              avgWeight={avgWeight}
              setAvgWeight={setAvgWeight}
              selectedAnimal={selectedAnimal}
              calculateAnimalTotal={calculateAnimalTotal}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'climate' && (
            <ParametriClimatici 
              winterTemp={winterTemp}
              setWinterTemp={setWinterTemp}
              winterRH={winterRH}
              setWinterRH={setWinterRH}
              summerTemp={summerTemp}
              setSummerTemp={setSummerTemp}
              summerRH={summerRH}
              setSummerRH={setSummerRH}
              indoorTemp={indoorTemp}
              setIndoorTemp={setIndoorTemp}
              indoorRH={indoorRH}
              setIndoorRH={setIndoorRH}
              winterHumidity={winterHumidity}
              summerHumidity={summerHumidity}
              indoorHumidity={indoorHumidity}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'ventilation' && (
            <ParametriVentilazione 
              co2In={co2In}
              setCo2In={setCo2In}
              co2Out={co2Out}
              setCo2Out={setCo2Out}
              isFetchingCO2={isFetchingCO2}
              fetchRealCO2={fetchRealCO2}
              vInvCO2={vInvCO2}
              vInvH2O={vInvH2O}
              vMinProgetto={vMinProgetto}
              vMinPerCapo={vMinPerCapo}
              vMinPerPesoVivo={vMinPerPesoVivo}
              vEstTotale={vEstTotale}
              vEstPerCapo={vEstPerCapo}
              vEstPerPesoVivo={vEstPerPesoVivo}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'structure' && (
            <StrutturaEdilizia 
              elements={elements}
              updateElement={updateElement}
              addLayer={addLayer}
              removeLayer={removeLayer}
              updateLayer={updateLayer}
              calculateElementThermal={(el) => calculateElementThermal(el, MATERIAL_DATABASE)}
              umBuilding={umBuilding}
              setCurrentView={setCurrentView}
              dimensions={buildingDimensions}
              setDimensions={setBuildingDimensions}
            />
          )}

          {currentView === 'results' && (
            <RisultatiBilancio 
              animalSensibleHeatWinter={animalSensibleHeatWinter}
              structureHeatLoss={structureHeatLoss}
              floorHeatLoss={floorHeatLoss}
              ventilationHeatLoss={ventilationHeatLoss}
              heatBalance={heatBalance}
              vAdditional={vAdditional}
              vTotalWinter={vTotalWinter}
              vTotalWinterPerCapo={vTotalWinterPerCapo}
              vTotalWinterPerPesoVivo={vTotalWinterPerPesoVivo}
              umBuilding={umBuilding}
              insulators={insulators}
              selectedInsulationName={selectedInsulationName}
              setSelectedInsulationName={setSelectedInsulationName}
              requiredInsulationThickness={requiredInsulationThickness}
              selectedFuelName={selectedFuelName}
              setSelectedFuelName={setSelectedFuelName}
              fuelConsumption={fuelConsumption}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'natural_vent' && (
            <VentilazioneNaturale 
              params={naturalVentParams}
              setParams={setNaturalVentParams}
              indoorTemp={indoorTemp}
              winterTemp={winterTemp}
              vMinProgetto={vMinProgetto}
              vTotalWinter={vTotalWinter}
              heatBalance={heatBalance}
              setCurrentView={setCurrentView}
            />
          )}

          {currentView === 'forced_vent' && (
            <VentilazioneForzata 
              params={forcedVentParams}
              setParams={setForcedVentParams}
              vEstTotale={vEstTotale}
              vMinProgetto={vMinProgetto}
              vTotalWinter={vTotalWinter}
              heatBalance={heatBalance}
              setCurrentView={setCurrentView}
              buildingDimensions={buildingDimensions}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-medium uppercase tracking-widest">
          <p>© 2026 Animal Clima Project • Design Suite</p>
          <p>Developed: francesco.daborso@uniud.it</p>
        </div>
      </footer>
    </div>
  );
}
