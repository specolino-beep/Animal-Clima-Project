import React, { useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Thermometer, Activity, AlertTriangle, CheckCircle2, Info, ArrowRight, Wind, Droplets, Gauge } from 'lucide-react';
import { HeatStressParams, View, ForcedVentParams } from '../types';
import { calculateTHI, calculateAdjustedTHI } from '../utils/calculations';

interface Props {
  params: HeatStressParams;
  setParams: React.Dispatch<React.SetStateAction<HeatStressParams>>;
  setCurrentView: (view: View) => void;
  selectedAnimalName: string;
  summerTemp: number;
  summerRH: number;
  forcedVentVelocities: { longitudinal: number; transversal: number };
  forcedVentParams: ForcedVentParams;
}

export function ValutazioneRischioStress({
  params,
  setParams,
  setCurrentView,
  selectedAnimalName,
  summerTemp,
  summerRH,
  forcedVentVelocities,
  forcedVentParams
}: Props) {
  
  // Sync with summer climate if not using measured params
  useEffect(() => {
    if (!params.useMeasuredParams) {
      setParams(p => ({
        ...p,
        indoorTemp: summerTemp,
        indoorRH: summerRH
      }));
    }
  }, [summerTemp, summerRH, params.useMeasuredParams, setParams]);

  // Sync with forced ventilation velocity if requested
  useEffect(() => {
    if (params.useForcedVentVelocity) {
      const velocity = forcedVentParams.ventilationType === 'longitudinal' 
        ? forcedVentVelocities.longitudinal 
        : forcedVentVelocities.transversal;
      
      setParams(p => ({
        ...p,
        airVelocity: Math.round(velocity * 100) / 100
      }));
    }
  }, [params.useForcedVentVelocity, forcedVentVelocities, forcedVentParams.ventilationType, setParams]);

  const thi = useMemo(() => calculateTHI(params.indoorTemp, params.indoorRH, selectedAnimalName), [params.indoorTemp, params.indoorRH, selectedAnimalName]);
  const adjustedThi = useMemo(() => calculateAdjustedTHI(thi, params.airVelocity), [thi, params.airVelocity]);

  const riskLevel = useMemo(() => {
    if (thi < 68) return { label: 'Assente', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', highlight: 'text-emerald-600', icon: <CheckCircle2 className="text-emerald-500" /> };
    if (thi < 72) return { label: 'Lieve', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', highlight: 'text-yellow-600', icon: <AlertTriangle className="text-yellow-500" /> };
    if (thi < 79) return { label: 'Moderato', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', highlight: 'text-orange-600', icon: <AlertTriangle className="text-orange-500" /> };
    if (thi < 89) return { label: 'Grave', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', highlight: 'text-red-600', icon: <AlertTriangle className="text-red-500" /> };
    return { label: 'Estremo', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', highlight: 'text-purple-700', icon: <AlertTriangle className="text-purple-600" /> };
  }, [thi]);

  const formulaInfo = useMemo(() => {
    const species = selectedAnimalName.toLowerCase();
    if (species.includes('bovini') || species.includes('vacche')) {
      return {
        formula: "THI = (1.8 × T + 32) - (0.55 - 0.0055 × UR) × (1.8 × T - 26)",
        source: "NRC (1971) - National Research Council"
      };
    }
    if (species.includes('avicoli') || species.includes('polli') || species.includes('galline')) {
      return {
        formula: "THI = 0.8 × T + (UR/100) × (T - 14.4) + 46.4",
        source: "Zulovich & DeShazer (1990) / Hahn (1999)"
      };
    }
    if (species.includes('conigli')) {
      return {
        formula: "THI = T - (0.55 - 0.0055 × UR) × (T - 14.5)",
        source: "Marai et al. (2001)"
      };
    }
    return {
      formula: "THI = (1.8 × T + 32) - (0.55 - 0.0055 × UR) × (1.8 × T - 26)",
      source: "Thom (1959) - Standard Equation"
    };
  }, [selectedAnimalName]);

  const mitigationMeasures = useMemo(() => {
    const measures = [];
    if (thi >= 68) {
      measures.push("Aumentare la velocità dell'aria sugli animali.");
      measures.push("Garantire acqua fresca e pulita in abbondanza.");
      measures.push("Ridurre la densità di stabulazione se possibile.");
    }
    if (thi >= 72) {
      measures.push("Attivare sistemi di bagnatura (soaking) o nebulizzazione.");
      measures.push("Utilizzare pannelli evaporativi se presenti.");
      measures.push("Alimentazione nelle ore più fresche.");
    }
    if (thi >= 79) {
      measures.push("Interventi d'urgenza: bagnatura intensiva.");
      measures.push("Monitoraggio continuo della temperatura rettale.");
    }
    return measures;
  }, [thi]);

  const suggestedSystem = useMemo(() => {
    const species = selectedAnimalName.toLowerCase();
    if (species.includes('bovini') || species.includes('vacche')) {
      return {
        title: "Bovini da Latte",
        desc: "Movimentazione dell'aria (ventilatori) e a seguire sistemi di aspersione dell'acqua (soaking).",
        next: 'cooling' as View
      };
    }
    if (species.includes('suini')) {
      return {
        title: "Suini",
        desc: "Ventilazione forzata a velocità sostenuta e sistemi di nebulizzazione d'acqua (fogging).",
        next: 'forced_vent' as View
      };
    }
    if (species.includes('polli') || species.includes('avicoli')) {
      return {
        title: "Polli da Carne",
        desc: "Movimentatori d'aria a flusso longitudinale (Tunnel) e cooling evaporativo (pannelli).",
        next: 'panels' as View
      };
    }
    if (species.includes('galline') || species.includes('conigli')) {
      return {
        title: "Galline / Conigli",
        desc: "Cooling evaporativo (pannelli) e ventilazione controllata.",
        next: 'panels' as View
      };
    }
    return {
      title: "Generale",
      desc: "Ventilazione forzata e sistemi evaporativi in base alla tolleranza della specie.",
      next: 'cooling' as View
    };
  }, [selectedAnimalName]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Valutazione Rischio Stress da Calore</h2>
            <p className="text-emerald-300 font-medium">Analisi dell'indice THI e strategie di mitigazione</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Input Climatici */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Thermometer className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-slate-800 font-montserrat">Parametri di Calcolo</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={params.useMeasuredParams}
                onChange={(e) => setParams(p => ({ ...p, useMeasuredParams: e.target.checked }))}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-600 uppercase">Usa parametri misurati (interni)</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Temperatura Aria</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={params.indoorTemp}
                  onChange={(e) => setParams(p => ({ ...p, indoorTemp: parseFloat(e.target.value) || 0 }))}
                  disabled={!params.useMeasuredParams}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 w-full font-bold text-slate-700 disabled:opacity-50"
                />
                <span className="text-sm font-bold text-slate-400">°C</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Umidità Relativa</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={params.indoorRH}
                  onChange={(e) => setParams(p => ({ ...p, indoorRH: parseFloat(e.target.value) || 0 }))}
                  disabled={!params.useMeasuredParams}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 w-full font-bold text-slate-700 disabled:opacity-50"
                />
                <span className="text-sm font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Velocità Aria (interna)</label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={params.useForcedVentVelocity}
                    onChange={(e) => setParams(p => ({ ...p, useForcedVentVelocity: e.target.checked }))}
                    className="w-3 h-3 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Usa Forzata</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  step="0.01"
                  value={params.airVelocity}
                  onChange={(e) => setParams(p => ({ ...p, airVelocity: parseFloat(e.target.value) || 0, useForcedVentVelocity: false }))}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 w-full font-bold text-slate-700"
                />
                <span className="text-sm font-bold text-slate-400">m/s</span>
              </div>
              {params.useForcedVentVelocity && (
                <p className="text-[9px] text-emerald-600 mt-1 font-bold italic">
                  * Da schema {forcedVentParams.ventilationType === 'longitudinal' ? 'Longitudinale' : 'Trasversale'}
                </p>
              )}
            </div>
          </div>
          {!params.useMeasuredParams && (
            <p className="text-[10px] text-slate-400 mt-4 italic">
              * I valori sono sincronizzati con le condizioni estive di progetto ({summerTemp}°C, {summerRH}% UR).
            </p>
          )}
        </section>

        {/* Risultati THI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <div className={`w-32 h-32 rounded-full border-8 ${riskLevel.border.replace('border-', 'border-opacity-50 border-')} flex flex-col items-center justify-center mb-4 relative transition-colors duration-500`}>
              <span className={`text-4xl font-black ${riskLevel.highlight}`}>{thi.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Indice THI</span>
              {params.airVelocity > 0.2 && (
                <div className="absolute -bottom-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
                  ADJ: {adjustedThi.toFixed(1)}
                </div>
              )}
            </div>

            <div className={`px-6 py-2 rounded-xl border-2 ${riskLevel.bg} ${riskLevel.border} flex items-center gap-3 mb-4`}>
              {riskLevel.icon}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Livello di Rischio</span>
                <span className={`text-lg font-black ${riskLevel.color}`}>{riskLevel.label}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 w-full text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formula Utilizzata</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-700 mb-1">{formulaInfo.formula}</p>
              <p className="text-[10px] text-slate-500 italic">Fonte: {formulaInfo.source}</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-slate-800 font-montserrat">Misure di Mitigazione</h3>
            </div>
            <ul className="space-y-3">
              {mitigationMeasures.length > 0 ? (
                mitigationMeasures.map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {m}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-400 italic">Nessuna misura critica necessaria al momento.</li>
              )}
            </ul>
          </section>
        </div>

        {/* Suggerimento Sistema */}
        <div className="space-y-6">
          <section className="bg-emerald-50 rounded-2xl p-6 md:p-8 border border-emerald-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
              <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg shadow-emerald-200">
                <Activity size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black mb-2 font-montserrat text-emerald-900">Sistema di Raffrescamento Consigliato</h3>
                <p className="text-emerald-700 leading-relaxed text-sm md:text-base">
                  Per la specie <span className="font-bold underline">{suggestedSystem.title}</span>, la strategia ottimale prevede: <br/>
                  <span className="text-lg font-bold text-emerald-800">{suggestedSystem.desc}</span>
                </p>
              </div>
            </div>
          </section>
          
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
            <button 
              onClick={() => setCurrentView('cooling')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <Wind size={16} />
              Raffr. Convettivo
            </button>
            <button 
              onClick={() => setCurrentView('soaking')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <Droplets size={16} />
              Raffr. Evaporativo
            </button>
            <button 
              onClick={() => setCurrentView('panels')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
            >
              <Gauge size={16} />
              Pannelli Evaporanti
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
