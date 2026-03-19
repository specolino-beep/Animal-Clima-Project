import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Gauge, Wind, Settings2, Info, Droplets, Maximize, Activity, Thermometer, AlertTriangle, ChevronDown } from 'lucide-react';
import { EvaporativePanelParams, View } from '../types';
import { 
  calculateAdiabaticCooling, 
  calculatePadWaterConsumption, 
  calculateTHI,
} from '../utils/calculations';
import { InputCard } from './Common';
import { PAD_EFFICIENCY_TABLE, getPadEfficiency } from '../data/evaporativePads';

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  LabelList
} from 'recharts';

interface Props {
  params: EvaporativePanelParams;
  setParams: React.Dispatch<React.SetStateAction<EvaporativePanelParams>>;
  setCurrentView: (view: View) => void;
  vEstTotale: number;
  summerTemp: number;
  summerRH: number;
  selectedAnimalName: string;
}

export function SistemiPannelliEvaporanti({ 
  params, 
  setParams, 
  setCurrentView, 
  vEstTotale,
  summerTemp,
  summerRH,
  selectedAnimalName
}: Props) {

  const efficiency = useMemo(() => {
    return getPadEfficiency(params.airVelocity, params.thickness);
  }, [params.airVelocity, params.thickness]);

  const coolingResults = useMemo(() => {
    return calculateAdiabaticCooling(summerTemp, summerRH, efficiency);
  }, [summerTemp, summerRH, efficiency]);

  const requiredArea = useMemo(() => {
    if (params.airVelocity <= 0) return 0;
    return vEstTotale / (params.airVelocity * 3600);
  }, [vEstTotale, params.airVelocity]);

  const waterConsumption = useMemo(() => {
    return calculatePadWaterConsumption(
      vEstTotale,
      summerTemp,
      summerRH,
      coolingResults.finalTemp,
      coolingResults.finalRH
    );
  }, [vEstTotale, summerTemp, summerRH, coolingResults]);

  const thiBefore = useMemo(() => calculateTHI(summerTemp, summerRH, selectedAnimalName), [summerTemp, summerRH, selectedAnimalName]);
  const thiAfter = useMemo(() => calculateTHI(coolingResults.finalTemp, coolingResults.finalRH, selectedAnimalName), [coolingResults, selectedAnimalName]);

  const getRiskLevel = (thi: number) => {
    if (thi < 68) return { label: 'Assente', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', highlight: 'text-emerald-600', hex: '#10b981' };
    if (thi < 72) return { label: 'Lieve', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', highlight: 'text-yellow-600', hex: '#eab308' };
    if (thi < 79) return { label: 'Moderato', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', highlight: 'text-orange-600', hex: '#f97316' };
    if (thi < 89) return { label: 'Grave', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', highlight: 'text-red-600', hex: '#ef4444' };
    return { label: 'Estremo', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', highlight: 'text-purple-700', hex: '#9333ea' };
  };

  const riskBefore = useMemo(() => getRiskLevel(thiBefore), [thiBefore]);
  const riskAfter = useMemo(() => getRiskLevel(thiAfter), [thiAfter]);

  const chartData = [
    { name: 'Aria Atmosferica', value: parseFloat(thiBefore.toFixed(1)), color: riskBefore.hex },
    { name: 'Aria Raffrescata', value: parseFloat(thiAfter.toFixed(1)), color: riskAfter.hex }
  ];

  const updateParam = (updates: Partial<EvaporativePanelParams>) => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 md:space-y-8 pb-12"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1 md:mb-2 font-montserrat">Sistemi a Pannelli Evaporanti</h2>
            <p className="text-emerald-300 text-sm md:text-base font-medium">Dimensionamento sistema di raffrescamento adiabatico (Cooling Pads)</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Parametri di Progetto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Settings2 className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Parametri Pannello</h3>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Spessore Pannello (mm)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-slate-100 rounded-xl">
                {[50, 100, 150, 200].map((t) => (
                  <button 
                    key={t}
                    onClick={() => updateParam({ thickness: t })}
                    className={`py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${params.thickness === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t} mm
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Velocità di Transito (m/s)</label>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Consigliata: 1.0 - 1.5</span>
              </div>
              <div className="relative">
                <select 
                  value={params.airVelocity.toFixed(2)}
                  onChange={(e) => updateParam({ airVelocity: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  {PAD_EFFICIENCY_TABLE.map(row => (
                    <option key={row.velocity} value={row.velocity.toFixed(2)}>
                      {row.velocity.toFixed(2)} m/s
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                L'efficienza di saturazione calcolata per questa configurazione è del <span className="text-emerald-600 font-bold">{efficiency}%</span>.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Maximize className="text-emerald-600" size={20} />
              <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Dimensionamento Superficie</h3>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center">
              <span className="text-xs font-bold text-emerald-600 uppercase mb-2">Superficie Totale Necessaria</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900">{requiredArea.toLocaleString('it-IT', { maximumFractionDigits: 2 })}</span>
                <span className="text-sm font-bold text-slate-500">m²</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Calcolata per una portata di {vEstTotale.toLocaleString('it-IT')} m³/h</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Altezza Pannello (m)</label>
                <div className="relative">
                  <select 
                    value={params.height.toFixed(1)}
                    onChange={(e) => updateParam({ height: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map(h => (
                      <option key={h} value={h.toFixed(1)}>{h.toFixed(1)} m</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lunghezza Totale</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-700">{(params.height > 0 ? requiredArea / params.height : 0).toLocaleString('it-IT', { maximumFractionDigits: 2 })}</span>
                  <span className="text-xs font-bold text-slate-400">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risultati Raffrescamento */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Droplets className="text-emerald-600" size={20} />
            <h3 className="text-lg font-extrabold text-slate-900 font-montserrat">Risultati Raffrescamento Adiabatico</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Thermometer size={18} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Temperatura Uscita</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{coolingResults.finalTemp.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                <span className="text-sm font-bold text-slate-500">°C</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">Riduzione di {(summerTemp - coolingResults.finalTemp).toFixed(1)}°C</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={18} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Umidità Uscita</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{coolingResults.finalRH.toLocaleString('it-IT', { maximumFractionDigits: 0 })}</span>
                <span className="text-sm font-bold text-slate-500">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Aumento umidità per evaporazione</p>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={18} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Consumo Acqua</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{waterConsumption.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                <span className="text-sm font-bold text-emerald-600">L/h</span>
              </div>
              <p className="text-[10px] text-emerald-600/70 mt-2">Quantità evaporata per il raffrescamento</p>
            </div>
          </div>

          {/* Confronto THI */}
          <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="text-emerald-600" size={24} />
              <h4 className="text-lg md:text-xl font-bold font-montserrat uppercase tracking-tight text-slate-800">Confronto Indice di Stress (THI)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <Wind className="text-emerald-600" size={20} />
                </div>
              </div>

              <div className={`space-y-4 p-6 rounded-xl border shadow-sm ${riskBefore.bg} ${riskBefore.border}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aria Atmosferica</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${riskBefore.bg} ${riskBefore.color} border ${riskBefore.border}`}>
                    Rischio: {riskBefore.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl md:text-5xl font-black ${riskBefore.highlight}`}>{thiBefore.toFixed(1)}</span>
                  <span className="text-lg font-bold text-slate-400">THI</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Thermometer size={12} /> {summerTemp}°C</span>
                  <span className="flex items-center gap-1"><Droplets size={12} /> {summerRH}%</span>
                </div>
              </div>

              <div className={`space-y-4 p-6 rounded-xl border shadow-sm md:text-right ${riskAfter.bg} ${riskAfter.border}`}>
                <div className="flex justify-between items-center md:flex-row-reverse">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Aria Raffrescata</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${riskAfter.bg} ${riskAfter.color} border ${riskAfter.border}`}>
                    Rischio: {riskAfter.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 md:justify-end">
                  <span className={`text-4xl md:text-5xl font-black ${riskAfter.highlight}`}>{thiAfter.toFixed(1)}</span>
                  <span className="text-lg font-bold text-emerald-600">THI</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-emerald-600/70 md:justify-end">
                  <span className="flex items-center gap-1"><Thermometer size={12} /> {coolingResults.finalTemp.toFixed(1)}°C</span>
                  <span className="flex items-center gap-1"><Droplets size={12} /> {coolingResults.finalRH.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Grafico THI */}
            <div className="mt-10 h-[200px] w-full">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Visualizzazione Impatto THI</h5>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-lg text-xs font-bold">
                            {payload[0].value} THI
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList 
                      dataKey="value" 
                      position="right" 
                      style={{ fontSize: 12, fontWeight: 800, fill: '#475569' }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 md:mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl border border-emerald-200">
                  <Gauge className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600">Riduzione THI: {(thiBefore - thiAfter).toFixed(1)} unità</p>
                  <p className="text-[10px] text-slate-400">Calcolato per specie: {selectedAnimalName}</p>
                </div>
              </div>
              <div className="text-[9px] text-slate-500 max-w-xs md:text-right italic leading-relaxed">
                * L'efficienza di saturazione ($\eta$) indica quanto il pannello avvicina l'aria al limite teorico del bulbo umido. Dipende meccanicamente da spessore e velocità.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
