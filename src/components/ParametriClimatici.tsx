import React from 'react';
import { motion } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Snowflake, 
  Sun, 
  Home as HomeIcon, 
  ArrowRight 
} from 'lucide-react';
import { View } from '../types';
import { InputCard, ResultCard } from './Common';

interface ParametriClimaticiProps {
  winterTemp: number;
  setWinterTemp: (v: number) => void;
  winterRH: number;
  setWinterRH: (v: number) => void;
  summerTemp: number;
  setSummerTemp: (v: number) => void;
  summerRH: number;
  setSummerRH: (v: number) => void;
  indoorTemp: number;
  setIndoorTemp: (v: number) => void;
  indoorRH: number;
  setIndoorRH: (v: number) => void;
  winterHumidity: number;
  summerHumidity: number;
  indoorHumidity: number;
  setCurrentView: (view: View) => void;
}

export function ParametriClimatici({
  winterTemp,
  setWinterTemp,
  winterRH,
  setWinterRH,
  summerTemp,
  setSummerTemp,
  summerRH,
  setSummerRH,
  indoorTemp,
  setIndoorTemp,
  indoorRH,
  setIndoorRH,
  winterHumidity,
  summerHumidity,
  indoorHumidity,
  setCurrentView
}: ParametriClimaticiProps) {
  return (
    <motion.div 
      key="climate"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Parametri Climatici</h2>
        <p className="text-emerald-300 font-medium">
          Configurazione delle condizioni ambientali esterne per il calcolo dell'umidità specifica.
        </p>
      </section>

      <div className="space-y-12">
        {/* Winter Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-cyan-700 border-b border-cyan-100 pb-2">
            <Snowflake size={24} />
            <h3 className="text-lg font-extrabold font-montserrat">Inverno</h3>
          </div>
          <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 text-sm text-cyan-800 leading-relaxed italic">
            "In inverno dovranno essere immesse le condizioni climatiche rappresentative del periodo più freddo dell'anno (es. media delle minime del mese più freddo)."
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputCard 
              label="Temperatura" 
              icon={<Thermometer size={16} />}
              value={winterTemp}
              onChange={setWinterTemp}
              unit="°C"
            />
            <InputCard 
              label="Umidità Relativa" 
              icon={<Droplets size={16} />}
              value={winterRH}
              onChange={setWinterRH}
              unit="%"
            />
            <ResultCard 
              icon={<Wind className="text-cyan-700" size={18} />} 
              label="Umidità Specifica" 
              value={winterHumidity.toLocaleString('it-IT', { maximumFractionDigits: 2 })} 
              unit="g/m³" 
            />
          </div>
        </div>

        {/* Indoor Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-emerald-700 border-b border-emerald-100 pb-2">
            <HomeIcon size={24} />
            <h3 className="text-lg font-extrabold font-montserrat">Ambiente Interno</h3>
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-sm text-emerald-800 leading-relaxed italic">
            "Parametri target per l'ambiente interno, necessari per calcolare il differenziale di umidità e CO2."
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputCard 
              label="Temperatura" 
              icon={<Thermometer size={16} />}
              value={indoorTemp}
              onChange={setIndoorTemp}
              unit="°C"
            />
            <InputCard 
              label="Umidità Relativa" 
              icon={<Droplets size={16} />}
              value={indoorRH}
              onChange={setIndoorRH}
              unit="%"
            />
            <ResultCard 
              icon={<Wind className="text-emerald-700" size={18} />} 
              label="Umidità Specifica" 
              value={indoorHumidity.toLocaleString('it-IT', { maximumFractionDigits: 2 })} 
              unit="g/m³" 
            />
          </div>
        </div>

        {/* Summer Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-amber-600 border-b border-amber-100 pb-2">
            <Sun size={24} />
            <h3 className="text-lg font-extrabold font-montserrat">Estate</h3>
          </div>
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 leading-relaxed italic">
            "In estate dovranno essere immesse le condizioni climatiche rappresentative del periodo più caldo dell'anno (es. media delle massime del mese più caldo)."
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputCard 
              label="Temperatura" 
              icon={<Thermometer size={16} />}
              value={summerTemp}
              onChange={setSummerTemp}
              unit="°C"
            />
            <InputCard 
              label="Umidità Relativa" 
              icon={<Droplets size={16} />}
              value={summerRH}
              onChange={setSummerRH}
              unit="%"
            />
            <ResultCard 
              icon={<Wind className="text-amber-600" size={18} />} 
              label="Umidità Specifica" 
              value={summerHumidity.toLocaleString('it-IT', { maximumFractionDigits: 2 })} 
              unit="g/m³" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center pt-6">
  <button 
    onClick={() => setCurrentView('structure')}
    className="flex items-center gap-1.5 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm shadow-sm group"
  >
    Vai alla configurazione della struttura
    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
  </button>
</div>
    </motion.div>
  );
}
