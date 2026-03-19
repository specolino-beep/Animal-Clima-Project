import React from 'react';
import { motion } from 'motion/react';
import { 
  Info, 
  ChevronDown, 
  Calculator, 
  Activity, 
  Thermometer, 
  Droplets, 
  Wind, 
  ArrowRight 
} from 'lucide-react';
import { ANIMAL_DATABASE } from '../data/animals';
import { AnimalEntry, View } from '../types';
import { InputCard, ResultCard } from './Common';

interface ConfigurazioneAnimaliProps {
  selectedAnimalName: string;
  setSelectedAnimalName: (name: string) => void;
  numHeads: number;
  setNumHeads: (num: number) => void;
  avgWeight: number;
  setAvgWeight: (weight: number) => void;
  selectedAnimal: AnimalEntry;
  calculateAnimalTotal: (value: number) => string;
  setCurrentView: (view: View) => void;
}

export function ConfigurazioneAnimali({
  selectedAnimalName,
  setSelectedAnimalName,
  numHeads,
  setNumHeads,
  avgWeight,
  setAvgWeight,
  selectedAnimal,
  calculateAnimalTotal,
  setCurrentView
}: ConfigurazioneAnimaliProps) {
  return (
    <motion.div 
      key="animals"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Configurazione Animali</h2>
        <p className="text-emerald-300 font-medium">Gestisci i dati della mandria per calcolare i parametri ambientali.</p>
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
        <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-montserrat">Risultati Animali</h3>
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

      <div className="flex justify-end items-center pt-5">
        <button 
          onClick={() => setCurrentView('climate')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
        >
          Vai all'inserimento dei dati climatici
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
