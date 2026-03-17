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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
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
  numHeads: number;
  avgWeight: number;
}

export function VentilazioneForzata({ 
  params, 
  setParams, 
  vEstTotale, 
  vMinProgetto, 
  vTotalWinter,
  heatBalance,
  setCurrentView,
  buildingDimensions,
  numHeads,
  avgWeight
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

  // Valori Unitari Consumi (convertiti in Wh)
  const totalLiveWeight = numHeads * avgWeight;
  
  const energyWinterPerCapo = useMemo(() => numHeads > 0 ? (energyWinter * 1000) / numHeads : 0, [energyWinter, numHeads]);
  const energyWinterPerPesoVivo = useMemo(() => totalLiveWeight > 0 ? (energyWinter * 1000) / totalLiveWeight : 0, [energyWinter, totalLiveWeight]);
  
  const energySummerPerCapo = useMemo(() => numHeads > 0 ? (energySummer * 1000) / numHeads : 0, [energySummer, numHeads]);
  const energySummerPerPesoVivo = useMemo(() => totalLiveWeight > 0 ? (energySummer * 1000) / totalLiveWeight : 0, [energySummer, totalLiveWeight]);

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
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione Forzata</h2>
        <p className="text-emerald-300 font-medium">Dimensionamento ventilatori e calcolo consumi</p>
      </section>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Scelta Ventilatore */}
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <Minimize className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Ventilazione Invernale</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Necessaria (di progetto): {targetWinterFlow.toLocaleString('it-IT')} m³/h
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputCard 
              label="Ventilatori Attivi"
              icon={<Activity size={16} />}
              value={params.winterFansCount}
              onChange={(val) => updateParam({ winterFansCount: val })}
              unit="unità"
              description="Numero di ventilatori operativi in inverno"
            />
            {!params.useInverter ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase mb-2">Tempo Funzionamento</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{winterMinutesPerHour.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                  <span className="text-xs font-medium text-slate-400">min/ora</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Garantisce {targetWinterFlow.toLocaleString('it-IT')} m³/h</p>
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-400 uppercase mb-2">Modulazione Inverter</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-600">{(safeModulation * 100).toLocaleString('it-IT', { maximumFractionDigits: 0 })}%</span>
                  <span className="text-xs font-medium text-slate-400">della velocità max</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Calcolata per garantire {targetWinterFlow.toLocaleString('it-IT')} m³/h</p>
              </div>
            )}
          </div>
        </div>

        {/* Ventilazione Estiva */}
        <div className="bg-emerald-50/50 p-8 rounded-2xl border border-emerald-100 shadow-sm text-emerald-900 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
            <div className="flex items-center gap-3">
              <Maximize size={20} className="text-emerald-600" />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Ventilazione Estiva</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-white/50 px-3 py-1 rounded-full uppercase tracking-wider">
              Necessaria (di progetto): {vEstTotale.toLocaleString('it-IT')} m³/h
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-tight">Ventilatori Necessari</span>
              <span className="text-2xl font-black">{fansNeededSummer}</span>
            </div>
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl">
              <span className="text-emerald-600 text-sm font-bold uppercase tracking-tight">Portata Totale</span>
              <span className="text-lg font-black">{actualFlowSummer.toLocaleString('it-IT')} m³/h</span>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <ResultCard 
              label="Velocità Aria Inverno"
              value={airVelocityWinter.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              unit="m/s"
              description="Velocità calcolata sulla sezione trasversale/longitudinale"
            />
            <ResultCard 
              label="Velocità Aria Estate"
              value={airVelocitySummer.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              unit="m/s"
              description="Velocità calcolata sulla sezione trasversale/longitudinale"
            />
          </div>
        </div>

        {/* Consumi energetici */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Zap className="text-emerald-600" size={20} />
            <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Consumi energetici</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResultCard 
              label="Consumo Inverno"
              value={energyWinter.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              unit="kWh/giorno"
              description={params.useInverter ? "Modulazione continua" : `Intermittenza: ${winterMinutesPerHour.toLocaleString('it-IT', { maximumFractionDigits: 1 })} min/ora`}
            />
            <ResultCard 
              label="Consumo Estate"
              value={energySummer.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              unit="kWh/giorno"
              description="Basato su 24h di funzionamento continuo"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Consumo Unitario per Capo (Wh/giorno/capo)</span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Inverno', value: energyWinterPerCapo, color: '#0891b2' },
                      { name: 'Estate', value: energySummerPerCapo, color: '#d97706' }
                    ]}
                    margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                      width={70}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(v: number) => [v.toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' Wh/g/capo', 'Consumo']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      <Cell fill="#0891b2" />
                      <Cell fill="#d97706" />
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={10}
                        formatter={(v: number) => v.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                        style={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Consumo Unitario per kg PV (Wh/giorno/kg)</span>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Inverno', value: energyWinterPerPesoVivo, color: '#0891b2' },
                      { name: 'Estate', value: energySummerPerPesoVivo, color: '#d97706' }
                    ]}
                    margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
                      width={70}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(v: number) => [v.toLocaleString('it-IT', { maximumFractionDigits: 3 }) + ' Wh/g/kg', 'Consumo']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                      <Cell fill="#0891b2" />
                      <Cell fill="#d97706" />
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={10}
                        formatter={(v: number) => v.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                        style={{ fill: '#0f172a', fontSize: 12, fontWeight: 800 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-center bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
            <div className="flex-1 text-center lg:text-left">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">Rapporto di Consumo Stagionale</span>
              <p className="text-sm text-slate-600 font-medium">
                Confronto tra il fabbisogno energetico estivo (24h) e quello invernale (modulato/intermittente).
              </p>
            </div>
            <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-emerald-100 text-center min-w-[200px]">
              <div className="text-4xl font-black text-emerald-700 font-mono">
                {energyWinter > 0 
                  ? `${(energySummer / energyWinter).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x`
                  : 'N/A'
                }
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight mt-1">
                volte superiore in estate
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              * Il consumo è calcolato considerando un rendimento medio del motore trifase pari a 0.85. 
              In modalità inverter, la potenza varia con il cubo della velocità.
            </p>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
