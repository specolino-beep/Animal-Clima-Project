import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  ArrowDownRight, 
  Building2, 
  Layers, 
  Wind, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Ruler, 
  ChevronDown, 
  Flame,
  Zap
} from 'lucide-react';
import { MaterialEntry, FuelEntry, View } from '../types';
import { ResultCard } from './Common';
import { FUELS_DATABASE } from '../data/fuels';

interface RisultatiBilancioProps {
  animalSensibleHeatWinter: number;
  structureHeatLoss: number;
  floorHeatLoss: number;
  ventilationHeatLoss: number;
  heatBalance: number;
  vAdditional: number;
  vTotalWinter: number;
  vTotalWinterPerCapo: number;
  vTotalWinterPerPesoVivo: number;
  umBuilding: number;
  insulators: MaterialEntry[];
  selectedInsulationName: string;
  setSelectedInsulationName: (name: string) => void;
  requiredInsulationThickness: number | null;
  selectedFuelName: string;
  setSelectedFuelName: (name: string) => void;
  fuelConsumption: number;
  setCurrentView: (view: View) => void;
}

export function RisultatiBilancio({
  animalSensibleHeatWinter,
  structureHeatLoss,
  floorHeatLoss,
  ventilationHeatLoss,
  heatBalance,
  vAdditional,
  vTotalWinter,
  vTotalWinterPerCapo,
  vTotalWinterPerPesoVivo,
  umBuilding,
  insulators,
  selectedInsulationName,
  setSelectedInsulationName,
  requiredInsulationThickness,
  selectedFuelName,
  setSelectedFuelName,
  fuelConsumption,
  setCurrentView
}: RisultatiBilancioProps) {
  return (
    <motion.div 
      key="results"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Bilancio Termico Invernale</h2>
        <p className="text-emerald-300 font-medium">
          Analisi del bilancio energetico tra il calore prodotto dagli animali e le dispersioni termiche totali.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Heat Sources */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-emerald-700">
            <Activity size={24} />
            <h3 className="text-lg font-extrabold font-montserrat">Apporti di Calore</h3>
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
          <div className="flex items-center gap-3 text-slate-800">
            <ArrowDownRight size={24} />
            <h3 className="text-lg font-extrabold font-montserrat">Dispersioni di Calore</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <ResultCard 
              icon={<Building2 className="text-slate-800" size={18} />}
              label="Dispersioni Struttura (Pareti, Tetto, ecc.)"
              value={structureHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
              unit="W"
              labelClassName="text-slate-800"
              valueClassName="text-slate-800"
            />
            <ResultCard 
              icon={<Layers className="text-slate-800" size={18} />}
              label="Dispersioni Pavimento"
              value={floorHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
              unit="W"
              labelClassName="text-slate-800"
              valueClassName="text-slate-800"
            />
            <ResultCard 
              icon={<Wind className="text-slate-800" size={18} />}
              label="Dispersioni Ventilazione Minima"
              value={ventilationHeatLoss.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
              unit="W"
              labelClassName="text-slate-800"
              valueClassName="text-slate-800"
            />
            <div className="mt-2 pt-4 border-t border-slate-200">
              <ResultCard 
                icon={<ArrowDownRight className="text-rose-700" size={18} />}
                label="Dispersioni Totali"
                value={(structureHeatLoss + floorHeatLoss + ventilationHeatLoss).toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                unit="W"
                labelClassName="text-rose-700 font-bold"
                valueClassName="text-rose-700 font-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Total Balance */}
      <section className={`p-8 rounded-2xl shadow-sm border relative overflow-hidden ${heatBalance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' : 'bg-rose-700/10 border-rose-700/20 text-rose-900'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          {heatBalance >= 0 ? <TrendingUp size={120} /> : <TrendingDown size={120} />}
        </div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest opacity-60">Bilancio Termico Totale</span>
          <div className="flex items-baseline gap-2 mt-2">
            <h4 className="text-5xl font-bold font-mono tracking-tighter">
              {heatBalance.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
            </h4>
            <span className="text-xl font-medium opacity-60">W</span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${heatBalance >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-700 text-white'}`}>
              {heatBalance >= 0 ? 'Bilancio Positivo' : 'Bilancio Negativo'}
            </div>
            <p className="opacity-80 text-sm leading-relaxed max-w-md font-medium">
              {heatBalance >= 0 
                ? "Il calore prodotto dagli animali è sufficiente a coprire le dispersioni. Non è necessario riscaldamento supplementare. Deve essere adottata la ventilazione aggiuntiva fino ad asportare il calore in eccesso."
                : "Le dispersioni superano il calore prodotto. NB: Non è possibile ridurre le dispersioni che avevngono attraverso la ventilazione minima. È necessario prevedere un sistema di riscaldamento artificiale o migliorare l'isolamento."}
            </p>
          </div>
          {heatBalance > 0 && (
            <div className="mt-8 pt-8 border-t border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs mb-6">
                <Wind size={16} />
                <span>Ventilazione di Pareggio Termico</span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Vent. Aggiuntiva</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-emerald-900">{vAdditional.toLocaleString('it-IT', { maximumFractionDigits: 1 })}</span>
                      <span className="text-xs text-emerald-600">m³/h</span>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Valori Unitari (Totali)</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-emerald-600">Per Capo:</span>
                        <span className="font-bold text-emerald-900">{vTotalWinterPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 2 })} m³/h</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-emerald-600">Per kg:</span>
                        <span className="font-bold text-emerald-900">{vTotalWinterPerPesoVivo.toLocaleString('it-IT', { maximumFractionDigits: 3 })} m³/h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/20 p-6 rounded-2xl border border-emerald-500/30">
                  <span className="text-xs font-bold text-emerald-800 uppercase block mb-2 tracking-widest">Ventilazione Totale (Invernale)</span>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-5xl font-bold font-mono tracking-tighter text-emerald-900">
                      {vTotalWinter.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                    </h4>
                    <span className="text-xl font-medium text-emerald-700">m³/h</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-emerald-700/60 text-[10px] italic leading-relaxed">
                * La ventilazione aggiuntiva è calcolata per asportare esattamente il calore in eccesso ({heatBalance.toLocaleString('it-IT', { maximumFractionDigits: 0 })} W) mantenendo la temperatura interna impostata.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Optimization Section (Integrated) */}
      {heatBalance < 0 && (
        <section className="bg-rose-700/10 rounded-2xl p-8 text-rose-900 shadow-sm border border-rose-700/20 space-y-8">
          <div className="flex items-center gap-3">
            <Settings className="text-rose-700" size={28} />
            <div>
              <h3 className="text-2xl font-extrabold font-montserrat">Ottimizzazione Clima Invernale</h3>
              <p className="text-rose-700/60 text-sm font-medium">Strategie per il raggiungimento del pareggio termico</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Solution 1: Insulation */}
            <div className="bg-white/40 p-6 rounded-2xl border border-rose-700/10 space-y-6">
              <div className="flex items-center gap-2 text-rose-700 font-bold uppercase tracking-wider text-xs">
                <Ruler size={16} />
                <span>Soluzione 1: Incremento Isolamento Tetto</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">Seleziona Materiale Isolante</label>
                  <div className="relative">
                    <select 
                      value={selectedInsulationName}
                      onChange={(e) => setSelectedInsulationName(e.target.value)}
                      className="w-full bg-white/80 border border-rose-200 rounded-xl px-4 py-3 text-rose-900 appearance-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                    >
                      {insulators.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400" size={18} />
                  </div>
                </div>

                <div className="p-4 bg-white/60 rounded-xl border border-rose-200/50">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">Spessore Necessario (Tetto)</span>
                  {requiredInsulationThickness !== null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-rose-700 font-mono">
                        {requiredInsulationThickness.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-medium text-rose-500">cm</span>
                    </div>
                  ) : (
                    <div className="text-rose-600 text-sm font-medium italic">
                      Impossibile raggiungere il pareggio solo tramite isolamento del tetto.
                    </div>
                  )}
                </div>
                <p className="text-xs text-rose-700/50 leading-relaxed italic">
                  * Calcolo basato sulla riduzione della trasmittanza del tetto per compensare l'intero deficit termico.
                </p>
              </div>
            </div>

            {/* Solution 2: Heating */}
            <div className="bg-white/40 p-6 rounded-2xl border border-rose-700/10 space-y-6">
              <div className="flex items-center gap-2 text-rose-700 font-bold uppercase tracking-wider text-xs">
                <Flame size={16} />
                <span>Soluzione 2: Riscaldamento Artificiale</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">Seleziona Combustibile</label>
                  <div className="relative">
                    <select 
                      value={selectedFuelName}
                      onChange={(e) => setSelectedFuelName(e.target.value)}
                      className="w-full bg-white/80 border border-rose-200 rounded-xl px-4 py-3 text-rose-900 appearance-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none"
                    >
                      {FUELS_DATABASE.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-rose-400" size={18} />
                  </div>
                </div>

                <div className="p-4 bg-white/60 rounded-xl border border-rose-200/50">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-2">Consumo Orario Stimato</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-rose-700 font-mono">
                      {fuelConsumption.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                    </span>
                    <span className="text-sm font-medium text-rose-500">kg/h</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/30 rounded-lg border border-rose-200/30">
                    <span className="text-[9px] font-bold text-rose-500 uppercase block">Potere Cal. (Hi)</span>
                    <span className="text-xs font-mono text-rose-700">
                      {FUELS_DATABASE.find(f => f.name === selectedFuelName)?.kwhPerKg.toFixed(2)} kWh/kg
                    </span>
                  </div>
                  <div className="p-3 bg-white/30 rounded-lg border border-rose-200/30">
                    <span className="text-[9px] font-bold text-rose-500 uppercase block">Rendimento (η)</span>
                    <span className="text-xs font-mono text-rose-700">
                      {((FUELS_DATABASE.find(f => f.name === selectedFuelName)?.efficiency || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-5 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setCurrentView('natural_vent')}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            <Wind size={16} />
            Ventilazione Naturale
          </button>
          <button 
            onClick={() => setCurrentView('forced_vent')}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            <Zap size={16} />
            Ventilazione Forzata
          </button>
        </div>
      </div>
    </motion.div>
  );
}
