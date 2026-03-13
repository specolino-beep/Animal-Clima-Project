import React from 'react';
import { motion } from 'motion/react';
import { 
  Wind, 
  Database, 
  Zap, 
  ArrowRight,
  BarChart3
} from 'lucide-react';
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
import { View } from '../types';
import { InputCard, ResultCard } from './Common';

interface ParametriVentilazioneProps {
  co2In: number;
  setCo2In: (v: number) => void;
  co2Out: number;
  setCo2Out: (v: number) => void;
  isFetchingCO2: boolean;
  fetchRealCO2: () => void;
  vInvCO2: number;
  vInvH2O: number;
  vMinProgetto: number;
  vMinPerCapo: number;
  vMinPerPesoVivo: number;
  vEstTotale: number;
  vEstPerCapo: number;
  vEstPerPesoVivo: number;
  setCurrentView: (view: View) => void;
}

export function ParametriVentilazione({
  co2In,
  setCo2In,
  co2Out,
  setCo2Out,
  isFetchingCO2,
  fetchRealCO2,
  vInvCO2,
  vInvH2O,
  vMinProgetto,
  vMinPerCapo,
  vMinPerPesoVivo,
  vEstTotale,
  vEstPerCapo,
  vEstPerPesoVivo,
  setCurrentView
}: ParametriVentilazioneProps) {
  return (
    <motion.div 
      key="ventilation"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione per il Ricambio dell'aria</h2>
        <p className="text-emerald-300 font-medium">Calcolo della portata d'aria necessaria per il controllo della CO2 e dell'umidità.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputCard 
          label="CO2 Interna Target (%)" 
          icon={<Wind size={16} />}
          content={
            <input
              type="number"
              step="0.01"
              value={co2In}
              onChange={(e) => setCo2In(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
            />
          }
        />
        <InputCard 
          label="CO2 Esterna (%)" 
          icon={<Database size={16} />}
          content={
            <div className="flex gap-2">
              <input
                type="number"
                step="0.0001"
                value={co2Out}
                onChange={(e) => setCo2Out(Number(e.target.value))}
                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
              <button 
                onClick={fetchRealCO2}
                disabled={isFetchingCO2}
                className="bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
              >
                <Zap size={14} className={isFetchingCO2 ? "animate-pulse" : ""} />
                {isFetchingCO2 ? "..." : "Real-time"}
              </button>
            </div>
          }
        />
      </section>

      <div className="space-y-8">
        <div className="space-y-6">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 font-montserrat">
            <Wind size={16} className="text-cyan-600" />
            Portate Minime Invernali
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'Portata per CO2', value: vInvCO2, color: '#0891b2' },
                      { name: 'Portata per H2O', value: vInvH2O, color: '#d97706' }
                    ]}
                    margin={{ top: 20, right: 120, left: 40, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                      width={130}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [value.toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' m³/h', 'Portata']}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                      <Cell fill="#0891b2" />
                      <Cell fill="#d97706" />
                      <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={15}
                        formatter={(v: number) => v.toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' m³/h'}
                        style={{ fill: '#0f172a', fontSize: 18, fontWeight: 900, fontFamily: 'monospace' }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="sm:col-span-2 bg-emerald-500/10 p-6 rounded-2xl text-slate-900 border border-emerald-500/20 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 opacity-80">Portata di Ventilazione Minima</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-emerald-900">{vMinProgetto.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                <span className="text-sm font-medium text-emerald-700 opacity-80">m³/h</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-emerald-500/10 pt-4">
                <div>
                  <span className="text-[9px] font-bold uppercase block text-emerald-800 opacity-70">Per Capo</span>
                  <span className="text-sm font-bold font-mono text-emerald-900">{vMinPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })} m³/h</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase block text-emerald-800 opacity-70">Per kg Peso Vivo</span>
                  <span className="text-sm font-bold font-mono text-emerald-900">{vMinPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 3 })} m³/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 font-montserrat">
            <Wind size={16} className="text-amber-600" />
            Portate Estive
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 bg-amber-500/10 p-6 rounded-2xl text-slate-900 border border-amber-500/20 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 opacity-80">Portata Totale (Estate)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold font-mono text-amber-900">{vEstTotale.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                <span className="text-sm font-medium text-amber-700 opacity-80">m³/h</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-amber-500/10 pt-4">
                <div>
                  <span className="text-[9px] font-bold uppercase block text-amber-800 opacity-70">Per Capo</span>
                  <span className="text-sm font-bold font-mono text-amber-900">{vEstPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })} m³/h</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase block text-amber-800 opacity-70">Per kg Peso Vivo</span>
                  <span className="text-sm font-bold font-mono text-amber-900">{vEstPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 3 })} m³/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-emerald-600" size={20} />
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-montserrat">
            Confronto Portate Unitarie (m³/h per kg Peso Vivo)
          </h3>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="h-64 w-full lg:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: 'Inverno', value: vMinPerPesoVivo, color: '#0891b2' },
                  { name: 'Estate', value: vEstPerPesoVivo, color: '#d97706' }
                ]}
                margin={{ top: 20, right: 100, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [value.toLocaleString('it-IT', { maximumFractionDigits: 3 }) + ' m³/h/kg', 'Portata']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                  {
                    [
                      { name: 'Inverno', value: vMinPerPesoVivo, color: '#0891b2' },
                      { name: 'Estate', value: vEstPerPesoVivo, color: '#d97706' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  }
                  <LabelList 
                    dataKey="value" 
                    position="right" 
                    offset={15}
                    formatter={(v: number) => v.toLocaleString('it-IT', { maximumFractionDigits: 3 }) + ' m³/h/kg'}
                    style={{ fill: '#0f172a', fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full lg:w-1/3 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rapporto Estate / Inverno</span>
            <div className="text-4xl font-black text-slate-900 font-mono mb-1">
              {vMinPerPesoVivo > 0 
                ? `+${((vEstPerPesoVivo / vMinPerPesoVivo) * 100).toLocaleString('it-IT', { maximumFractionDigits: 0 })}%`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              La portata estiva è circa <span className="text-amber-600 font-bold">{vMinPerPesoVivo > 0 ? (vEstPerPesoVivo / vMinPerPesoVivo).toLocaleString('it-IT', { maximumFractionDigits: 1 }) : '0'} volte</span> superiore a quella minima invernale.
            </p>
          </div>
        </div>
      </section>

      <div className="flex justify-end items-center pt-6">
  <button 
    onClick={() => setCurrentView('results')}
    /* Ho aggiunto w-80 e justify-center */
    className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white w-80 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-sm group"
  >
    Vai al calcolo del bilancio termico
    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
  </button>
</div>
    </motion.div>
  );
}
