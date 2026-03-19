import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Wind, Thermometer, Info, Settings2, Activity, Gauge, ArrowLeft, Layout } from 'lucide-react';
import { SoakingParams, BuildingDimensions, CoolingParams } from '../types';

interface Props {
  params: SoakingParams;
  setParams: React.Dispatch<React.SetStateAction<SoakingParams>>;
  setCurrentView: (view: any) => void;
  buildingDimensions: BuildingDimensions;
  coolingParams: CoolingParams;
  totalCoolingFans: number;
  selectedFanDiameter: number;
  numHeads: number;
  avgWeight: number;
  selectedAnimalName: string;
}

const InputCard = ({ label, value, onChange, unit, description }: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void; 
  unit: string;
  description?: string;
}) => (
  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl hover:border-emerald-200 transition-all">
    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
    <div className="flex items-center gap-2">
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 w-full font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
      />
      <span className="text-sm font-bold text-slate-400">{unit}</span>
    </div>
    {description && <p className="text-[10px] text-slate-400 mt-2 leading-tight">{description}</p>}
  </div>
);

export function SistemiRaffrescamentoEvaporativo({ 
  params, 
  setParams, 
  setCurrentView, 
  buildingDimensions,
  coolingParams,
  totalCoolingFans,
  selectedFanDiameter,
  numHeads,
  avgWeight,
  selectedAnimalName
}: Props) {
  
  const isBovine = selectedAnimalName.toLowerCase().includes('bovini') || selectedAnimalName.toLowerCase().includes('vacche');
  const isAvicoli = selectedAnimalName.toLowerCase().includes('avicoli') || selectedAnimalName.toLowerCase().includes('polli');
  const isSuini = selectedAnimalName.toLowerCase().includes('suini') || selectedAnimalName.toLowerCase().includes('maiali');

  // Calcoli Progettuali
  const numNozzlesPerLine = Math.ceil(params.lineLength / params.nozzleDistance);
  
  let totalNozzles = 0;
  if (params.systemType === 'soaking') {
    totalNozzles = numNozzlesPerLine * params.numLines;
  } else {
    if (params.foggingMode === 'grid') {
      totalNozzles = numNozzlesPerLine * params.numLines;
    } else {
      totalNozzles = totalCoolingFans * params.nozzlesPerFan;
    }
  }
  
  // Portata totale istantanea (L/min)
  const totalInstantFlow = totalNozzles * params.nozzleFlowRate;
  
  // Aria necessaria (m3/h) - Regola 500-800 m3 per litro nebulizzato
  const requiredAirflow = totalInstantFlow * 60 * 650; // Media di 650 m3 per litro/h
  const cycleTotalTime = params.wetTime + params.dryTime;
  const cyclesPerHour = 60 / cycleTotalTime;
  const wetTimePerHour = cyclesPerHour * params.wetTime; // min/h
  
  // Consumo acqua giornaliero (L/giorno)
  const dailyWaterConsumption = totalInstantFlow * wetTimePerHour * params.hoursPerDay;
  const waterPerCapo = numHeads > 0 ? dailyWaterConsumption / numHeads : 0;

  // Suggerimenti basati sulla specie
  React.useEffect(() => {
    if (params.systemType === 'soaking' && isBovine) {
      setParams(p => ({ ...p, nozzleDistance: 2.5, nozzleFlowRate: 1.15, pressure: 3, wetTime: 2, dryTime: 11, numLines: 1 }));
    } else if (params.systemType === 'fogging' && (isAvicoli || isSuini)) {
      const suggestedLines = Math.ceil(buildingDimensions.width / 5);
      const suggestedNozzlesPerFan = selectedFanDiameter >= 1 ? 8 : 6;
      setParams(p => ({ 
        ...p, 
        nozzleDistance: 1.75, 
        nozzleFlowRate: 0.1, 
        pressure: 60, 
        wetTime: 1, 
        dryTime: 4,
        numLines: suggestedLines,
        nozzlesPerFan: suggestedNozzlesPerFan
      }));
    }
  }, [params.systemType, isBovine, isAvicoli, isSuini, buildingDimensions.width, selectedFanDiameter]);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
          <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Droplets size={32} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-emerald-900 mb-1 md:mb-2 font-montserrat">Sistemi di Raffrescamento Evaporativo</h2>
            <p className="text-emerald-700 text-sm md:text-base font-medium">Doccette o Nebulizzazione (Soaking, Fogging, Misting)</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Selezione Tipo Sistema */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Tipo di Sistema</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setParams(p => ({ ...p, systemType: 'soaking' }))}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                params.systemType === 'soaking'
                  ? 'bg-emerald-50 border-emerald-500 shadow-md'
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${params.systemType === 'soaking' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Droplets size={20} />
                </div>
                <span className={`font-bold ${params.systemType === 'soaking' ? 'text-emerald-900' : 'text-slate-600'}`}>Doccette, bagnatura diretta (Soaking)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Goccia grossa {"(>150 micron)"} per bagnare la pelle. Tipico per bovine e scrofe. Sottrae calore per evaporazione cutanea.
              </p>
            </button>

            <button
              onClick={() => setParams(p => ({ ...p, systemType: 'fogging' }))}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                params.systemType === 'fogging'
                  ? 'bg-emerald-50 border-emerald-500 shadow-md'
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${params.systemType === 'fogging' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Activity size={20} />
                </div>
                <span className={`font-bold ${params.systemType === 'fogging' ? 'text-emerald-900' : 'text-slate-600'}`}>Nebulizzazione (Fogging, Misting)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Goccia fine {"(<50 micron)"} ad alta pressione. Raffresca l'aria ambiente prima che tocchi l'animale. Ideale per avicoli.
              </p>
            </button>
          </div>
        </section>

        {params.systemType === 'fogging' && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Wind className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-slate-800 font-montserrat">Configurazione Nebulizzazione</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setParams(p => ({ ...p, foggingMode: 'grid' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  params.foggingMode === 'grid'
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className="font-bold block mb-1">Griglia a Tutta Superficie</span>
                <p className="text-[10px] text-slate-500 leading-tight">Linee distribuite uniformemente in tutto l'edificio per coprire l'intera area.</p>
              </button>
              <button
                onClick={() => setParams(p => ({ ...p, foggingMode: 'fans' }))}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  params.foggingMode === 'fans'
                    ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className="font-bold block mb-1">Montaggio su Ventilatori</span>
                <p className="text-[10px] text-slate-500 leading-tight">Ugelli montati sulla corona dei ventilatori di raffrescamento esistenti.</p>
              </button>
            </div>
          </section>
        )}

        {/* Parametri Tecnici */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Gauge className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Parametri Tecnici</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {params.systemType === 'fogging' && params.foggingMode === 'fans' ? (
              <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ventilatori Presenti</span>
                    <span className="text-lg font-black text-slate-700">{totalCoolingFans} unità</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-medium text-slate-400 block italic">Ø {selectedFanDiameter}m</span>
                  </div>
                </div>
                <InputCard 
                  label="Ugelli per Ventilatore"
                  value={params.nozzlesPerFan}
                  onChange={(v) => setParams(p => ({ ...p, nozzlesPerFan: Math.max(1, v) }))}
                  unit="n°"
                  description={`Suggeriti: ${selectedFanDiameter >= 1 ? '8-10' : '4-6'} per Ø ${selectedFanDiameter}m`}
                />
              </>
            ) : (
              <>
                <InputCard 
                  label="Lunghezza Linea"
                  value={params.lineLength}
                  onChange={(v) => setParams(p => ({ ...p, lineLength: v }))}
                  unit="m"
                  description={params.systemType === 'soaking' ? "Coincide con la corsia di alimentazione." : "Lunghezza dell'edificio."}
                />
                <InputCard 
                  label="Numero di Linee"
                  value={params.numLines}
                  onChange={(v) => setParams(p => ({ ...p, numLines: Math.max(1, v) }))}
                  unit="n°"
                  description={params.systemType === 'soaking' ? "Solitamente 1 linea per corsia." : `Suggerite: ${Math.ceil(buildingDimensions.width / 5)} per larghezza ${buildingDimensions.width}m`}
                />
                <InputCard 
                  label="Distanza Ugelli"
                  value={params.nozzleDistance}
                  onChange={(v) => setParams(p => ({ ...p, nozzleDistance: v }))}
                  unit="m"
                  description={params.systemType === 'soaking' ? "Suggerito: 2.4 - 3.0 m" : "Suggerito: 1.5 - 2.0 m"}
                />
              </>
            )}
            
            <InputCard 
              label="Portata Ugello"
              value={params.nozzleFlowRate}
              onChange={(v) => setParams(p => ({ ...p, nozzleFlowRate: v }))}
              unit="L/min"
              description={params.systemType === 'soaking' ? "Suggerito: 1.0 - 1.3 L/min" : "Goccia fine: 0.05 - 0.2 L/min"}
            />
            <InputCard 
              label="Pressione Sistema"
              value={params.pressure}
              onChange={(v) => setParams(p => ({ ...p, pressure: v }))}
              unit="bar"
              description={params.systemType === 'soaking' ? "Bassa: 2-3 bar" : "Alta: 40-70 bar"}
            />
            <InputCard 
              label="Soglia Attivazione"
              value={params.activationTemp}
              onChange={(v) => setParams(p => ({ ...p, activationTemp: v }))}
              unit="°C"
              description="Suggerito: 24 - 26 °C."
            />
          </div>
        </section>

        {/* Ciclo di Funzionamento */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Ciclo di Funzionamento</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputCard 
              label="Fase Bagnatura (ON)"
              value={params.wetTime}
              onChange={(v) => setParams(p => ({ ...p, wetTime: v }))}
              unit="min"
              description="Tempo di erogazione acqua."
            />
            <InputCard 
              label="Fase Evaporazione (OFF)"
              value={params.dryTime}
              onChange={(v) => setParams(p => ({ ...p, dryTime: v }))}
              unit="min"
              description="Tempo di sola ventilazione."
            />
            <InputCard 
              label="Ore di Picco"
              value={params.hoursPerDay}
              onChange={(v) => setParams(p => ({ ...p, hoursPerDay: v }))}
              unit="h/giorno"
              description="Ore di funzionamento stimato."
            />
          </div>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex gap-3">
              <Info size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-2">
                <p><span className="font-bold">Nota Ciclo:</span> Il sistema non deve essere continuo. La fase di bagnatura serve a saturare il pelo/pelle, mentre la fase di evaporazione (con ventilatori attivi) sottrae effettivamente calore.</p>
                <p><span className="font-bold">Rapporto Aria/Acqua:</span> Per ogni litro nebulizzato servono <span className="font-bold">500-800 m³/h</span> di aria per evitare la saturazione dell'umidità.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Risultati Dimensionamento */}
        <div className="space-y-6">
          <section className="bg-emerald-50 rounded-2xl p-6 md:p-8 border border-emerald-100 shadow-sm">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
              <div className="space-y-1">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Totale Ugelli</span>
                <div className="text-2xl font-black text-emerald-900">{totalNozzles} <span className="text-xs font-medium text-emerald-600/70">unità</span></div>
                <p className="text-[10px] text-emerald-600/70 italic">Distanza: {params.nozzleDistance}m</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Portata Istantanea</span>
                <div className="text-2xl font-black text-emerald-900">{totalInstantFlow.toFixed(1)} <span className="text-xs font-medium text-emerald-600/70">L/min</span></div>
                <p className="text-[10px] text-emerald-600/70 italic">Capacità pompa</p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Consumo Totale</span>
                <div className="text-2xl font-black text-emerald-900">{dailyWaterConsumption.toFixed(0)} <span className="text-xs font-medium text-emerald-600/70">L/giorno</span></div>
                <p className="text-[10px] text-emerald-600/70 italic">Su {params.hoursPerDay}h picco</p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Consumo Specifico</span>
                <div className="text-2xl font-black text-emerald-900">{waterPerCapo.toFixed(1)} <span className="text-xs font-medium text-emerald-600/70">L/capo/g</span></div>
                <p className="text-[10px] text-emerald-600/70 italic">Valore medio stimato</p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Aria Necessaria</span>
                <div className="text-2xl font-black text-emerald-900">{(requiredAirflow / 1000).toFixed(0)}k <span className="text-xs font-medium text-emerald-600/70">m³/h</span></div>
                <p className="text-[10px] text-emerald-600/70 italic">Rapporto 650 m³/L</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-100">
                <Thermometer size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900">Efficacia Raffrescamento</p>
                <p className="text-xs text-emerald-600">Abbattimento stimato: <span className="font-bold">4-6°C</span> (con UR {'<'} 80%)</p>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button 
              onClick={() => setCurrentView('cooling')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <ArrowLeft size={16} />
              Torna a Ventilazione
            </button>
            <button 
              onClick={() => setCurrentView('panels')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              Vai ai Pannelli
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
