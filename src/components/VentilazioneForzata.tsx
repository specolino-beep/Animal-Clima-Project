import React, { useMemo } from 'react';
import { 
  Wind, 
  Zap, 
  Settings, 
  Maximize, 
  Minimize, 
  ArrowLeft,
  Activity,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';
import { ForcedVentParams, FanEntry, View, BuildingDimensions } from '../types';
import { fanDatabase } from '../data/fans';
import { 
  calculateFansNeeded, 
  calculateForcedVentEnergy, 
  calculateAirVelocity 
} from '../utils/calculations';
import { InputCard, ResultCard } from './Common';

interface VentilazioneForzataProps {
  params: ForcedVentParams;
  setParams: React.Dispatch<React.SetStateAction<ForcedVentParams>>;
  vEstTotale: number;
  vMinProgetto: number;
  vTotalWinter: number;
  heatBalance: number;
  setCurrentView: (view: View) => void;
  buildingDimensions: BuildingDimensions;
}

export function VentilazioneForzata({ 
  params, 
  setParams, 
  vEstTotale, 
  vMinProgetto, 
  vTotalWinter,
  heatBalance,
  setCurrentView,
  buildingDimensions
}: VentilazioneForzataProps) {
  
  const selectedFan = useMemo(() => {
    if (params.mode === 'preset') {
      return fanDatabase.find(f => f.id === params.selectedFanId) || fanDatabase[0];
    }
    return params.manualFan || { diameter: 0, power: 0, airflow: 0 };
  }, [params.mode, params.selectedFanId, params.manualFan]);

  // Calcoli Estate
  const fansNeededSummer = useMemo(() => {
    return calculateFansNeeded(vEstTotale, selectedFan.airflow);
  }, [vEstTotale, selectedFan.airflow]);

  // Portata effettiva estate
  const actualFlowSummer = fansNeededSummer * selectedFan.airflow;

  // Calcoli Inverno
  // La portata invernale dipende dal bilancio termico
  const targetWinterFlow = heatBalance > 0 ? vTotalWinter : vMinProgetto;
  
  // Se usiamo inverter, la portata è modulata. Se no, è intermittente.
  const modulationFactor = params.useInverter ? (targetWinterFlow / (params.winterFansCount * selectedFan.airflow)) : 1.0;
  const safeModulation = Math.min(1, Math.max(0.1, modulationFactor));

  // Tempo di funzionamento invernale (min/ora) - Calcolato come output
  const winterMinutesPerHour = useMemo(() => {
    if (params.useInverter) return 60;
    const totalCapacity = params.winterFansCount * selectedFan.airflow;
    if (totalCapacity <= 0) return 0;
    return Math.min(60, (targetWinterFlow / totalCapacity) * 60);
  }, [targetWinterFlow, params.winterFansCount, selectedFan.airflow, params.useInverter]);

  // Consumo Energetico
  const energySummer = useMemo(() => {
    return calculateForcedVentEnergy(fansNeededSummer, selectedFan.power, 24, 60, 0.85, false);
  }, [fansNeededSummer, selectedFan.power]);

  const energyWinter = useMemo(() => {
    return calculateForcedVentEnergy(
      params.winterFansCount, 
      selectedFan.power, 
      24, 
      winterMinutesPerHour, 
      0.85, 
      params.useInverter, 
      safeModulation
    );
  }, [params.winterFansCount, selectedFan.power, winterMinutesPerHour, params.useInverter, safeModulation]);

  // Geometria calcolata
  const areaTrasversale = ((buildingDimensions.ridgeHeight + buildingDimensions.eaveHeight) / 2) * buildingDimensions.length;
  const areaLongitudinale = ((buildingDimensions.ridgeHeight + buildingDimensions.eaveHeight) / 2) * buildingDimensions.width;

  // Velocità Aria
  const currentArea = params.ventilationType === 'longitudinal' ? areaLongitudinale : areaTrasversale;
  const airVelocitySummer = useMemo(() => calculateAirVelocity(actualFlowSummer, currentArea), [actualFlowSummer, currentArea]);
  const airVelocityWinter = useMemo(() => calculateAirVelocity(targetWinterFlow, currentArea), [targetWinterFlow, currentArea]);

  const updateParam = (updates: Partial<ForcedVentParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  const updateManualFan = (updates: Partial<Omit<FanEntry, 'id'>>) => {
    setParams(prev => ({
      ...prev,
      manualFan: { ...(prev.manualFan || { diameter: 0, power: 0, airflow: 0 }), ...updates }
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-600 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione Forzata</h2>
        <p className="text-emerald-300 font-medium">Dimensionamento ventilatori e calcolo consumi</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configurazione Ventilatore */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Settings className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Scelta Ventilatore</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modalità Selezione</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => updateParam({ mode: 'preset' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${params.mode === 'preset' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Database
                  </button>
                  <button 
                    onClick={() => updateParam({ mode: 'manual' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${params.mode === 'manual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Manuale
                  </button>
                </div>
              </div>

              {params.mode === 'preset' ? (
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seleziona Modello</label>
                  <select 
                    value={params.selectedFanId}
                    onChange={(e) => updateParam({ selectedFanId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    {fanDatabase.map(f => (
                      <option key={f.id} value={f.id}>
                        Ø {f.diameter}mm - {f.power}kW ({f.airflow} m³/h)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Ø (mm)</label>
                    <input 
                      type="number"
                      value={params.manualFan?.diameter || 0}
                      onChange={(e) => updateManualFan({ diameter: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pot. (kW)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={params.manualFan?.power || 0}
                      onChange={(e) => updateManualFan({ power: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">m³/h</label>
                    <input 
                      type="number"
                      value={params.manualFan?.airflow || 0}
                      onChange={(e) => updateManualFan({ airflow: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <Zap className="text-emerald-600" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Utilizzo Inverter</h4>
                  <p className="text-xs text-emerald-600 font-medium">Modulazione continua della portata</p>
                </div>
              </div>
              <button 
                onClick={() => updateParam({ useInverter: !params.useInverter })}
                className={`w-12 h-6 rounded-full transition-all relative ${params.useInverter ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${params.useInverter ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Ventilazione Invernale */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Minimize className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Ventilazione Invernale</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputCard 
                label="Ventilatori Attivi"
                icon={<Activity size={16} />}
                value={params.winterFansCount}
                onChange={(val) => updateParam({ winterFansCount: val })}
                unit="unità"
                description="Numero di ventilatori operativi in inverno"
              />
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase mb-2">Velocità Aria</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{airVelocityWinter.toFixed(2)}</span>
                  <span className="text-xs font-medium text-slate-400">m/s</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Invernale</p>
              </div>
              {!params.useInverter ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Funzionamento</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">{winterMinutesPerHour.toFixed(1)}</span>
                    <span className="text-xs font-medium text-slate-400">min/ora</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Garantisce {targetWinterFlow.toLocaleString()} m³/h</p>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-2">Modulazione Inverter</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-600">{(safeModulation * 100).toFixed(0)}%</span>
                    <span className="text-xs font-medium text-slate-400">della velocità max</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Calcolata per garantire {targetWinterFlow.toLocaleString()} m³/h</p>
                </div>
              )}
            </div>
          </div>

          {/* Geometria e Velocità */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Layout className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Schema di Flusso e Velocità Aria</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo Ventilazione</label>
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => updateParam({ ventilationType: 'longitudinal' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${params.ventilationType === 'longitudinal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Longitudinale
                  </button>
                  <button 
                    onClick={() => updateParam({ ventilationType: 'transversal' })}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${params.ventilationType === 'transversal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Trasversale
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase mb-2">Area Sezione Calcolata</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{currentArea.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                  <span className="text-xs font-medium text-slate-400">m²</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Dati derivati dal modulo Struttura Edilizia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Risultati */}
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 shadow-sm text-emerald-900 space-y-6">
            <div className="flex items-center gap-3 border-b border-emerald-200 pb-4">
              <Maximize size={20} className="text-emerald-600" />
              <h3 className="text-lg font-extrabold font-montserrat">Ventilazione Estiva</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 text-sm font-medium">Ventilatori Necessari</span>
                <span className="text-2xl font-bold">{fansNeededSummer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 text-sm font-medium">Portata Totale</span>
                <span className="text-lg font-bold">{actualFlowSummer.toLocaleString()} m³/h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-600 text-sm font-medium">Velocità Aria</span>
                <span className="text-lg font-bold">{airVelocitySummer.toFixed(2)} m/s</span>
              </div>
            </div>
          </div>

          <div className="bg-white/50 p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Zap className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Consumi energetici</h3>
            </div>

            <div className="space-y-4">
              <ResultCard 
                label="Consumo Estate"
                value={energySummer}
                unit="kWh/giorno"
                description="Basato su 24h di funzionamento continuo"
              />
              <ResultCard 
                label="Consumo Inverno"
                value={energyWinter}
                unit="kWh/giorno"
                description={params.useInverter ? "Modulazione continua" : `Intermittenza: ${winterMinutesPerHour.toFixed(1)} min/ora`}
              />
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  * Il consumo è calcolato considerando un rendimento medio del motore trifase pari a 0.85. 
                  In modalità inverter, la potenza varia con il cubo della velocità.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start pt-8">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 px-6 py-4 bg-slate-600 text-emerald-300 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
        >
          Torna alla Home
        </button>
      </div>
    </motion.div>
  );
}
