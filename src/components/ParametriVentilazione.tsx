import React from 'react';
import { motion } from 'motion/react';
import { 
  Wind, 
  Database, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
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
      <section className="bg-slate-600 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione (Portata d'Aria di Ricambio)</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-2 font-montserrat">
            <Wind size={16} className="text-cyan-600" />
            Portate Minime Invernali
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard icon={<Wind className="text-cyan-600" size={18} />} label="Portata per CO2" value={vInvCO2.toLocaleString('it-IT', { maximumFractionDigits: 1 })} unit="m³/h" />
            <ResultCard icon={<Wind className="text-blue-600" size={18} />} label="Portata per H2O" value={vInvH2O.toLocaleString('it-IT', { maximumFractionDigits: 1 })} unit="m³/h" />
            <div className="sm:col-span-2 bg-emerald-500/10 p-6 rounded-2xl text-slate-900 border border-emerald-500/20 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 opacity-80">Portata di Progetto (Inverno)</span>
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

      <div className="flex justify-between items-center pt-8">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 px-6 py-4 bg-slate-600 text-emerald-300 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
        >
          Torna alla Home
        </button>
        <button 
          onClick={() => setCurrentView('results')}
          className="flex items-center gap-3 bg-slate-600 text-emerald-300 px-8 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200 group"
        >
          Vai al calcolo del bilancio termico
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
