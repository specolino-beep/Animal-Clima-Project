import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Snowflake, 
  Sun, 
  Home as HomeIcon, 
  ArrowRight,
  MapPin,
  Loader2,
  Info
} from 'lucide-react';
import { View } from '../types';
import { InputCard, ResultCard } from './Common';
import { ITALIAN_CITIES, City } from '../data/cities';
import { SPECIES_DATA, SpeciesData } from '../data/species';

interface ClimateSuggestions {
  winterT: number | null;
  winterRH: number | null;
  summerT: number | null;
  summerRH: number | null;
}

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
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSpeciesType, setSelectedSpeciesType] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ClimateSuggestions>({
    winterT: null,
    winterRH: null,
    summerT: null,
    summerRH: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (city: City) => {
    setIsLoading(true);
    try {
      // Fetching daily data for the last 10 full years (2014-2023) to get a historical series
      const startYear = 2014;
      const endYear = 2023;
      const response = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${startYear}-01-01&end_date=${endYear}-12-31&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min&timezone=Europe%2FRome`
      );
      const data = await response.json();

      if (data.daily) {
        const dates = data.daily.time;
        const tMaxs = data.daily.temperature_2m_max;
        const tMins = data.daily.temperature_2m_min;
        const rhMaxs = data.daily.relative_humidity_2m_max;
        const rhMins = data.daily.relative_humidity_2m_min;

        const winterExtremesT: number[] = [];
        const winterExtremesRH: number[] = [];
        const summerExtremesT: number[] = [];
        const summerExtremesRH: number[] = [];

        for (let year = startYear; year <= endYear; year++) {
          // January extremes for this year
          let yearlyMinT = Infinity;
          let correspondingWinterRH = 0;
          
          // August extremes for this year
          let yearlyMaxT = -Infinity;
          let correspondingSummerRH = 0;

          dates.forEach((dateStr: string, index: number) => {
            const date = new Date(dateStr);
            const dYear = date.getFullYear();
            const dMonth = date.getMonth(); // 0-indexed

            if (dYear === year) {
              if (dMonth === 0) { // January
                if (tMins[index] !== null && tMins[index] < yearlyMinT) {
                  yearlyMinT = tMins[index];
                  correspondingWinterRH = rhMaxs[index]; // RH is usually highest when T is lowest
                }
              } else if (dMonth === 7) { // August
                if (tMaxs[index] !== null && tMaxs[index] > yearlyMaxT) {
                  yearlyMaxT = tMaxs[index];
                  correspondingSummerRH = rhMins[index]; // RH is usually lowest when T is highest
                }
              }
            }
          });

          if (yearlyMinT !== Infinity) {
            winterExtremesT.push(yearlyMinT);
            winterExtremesRH.push(correspondingWinterRH);
          }
          if (yearlyMaxT !== -Infinity) {
            summerExtremesT.push(yearlyMaxT);
            summerExtremesRH.push(correspondingSummerRH);
          }
        }

        const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

        setSuggestions({
          winterT: avg(winterExtremesT),
          winterRH: avg(winterExtremesRH),
          summerT: avg(summerExtremesT),
          summerRH: avg(summerExtremesRH)
        });
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati climatici storici:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const city = ITALIAN_CITIES.find(c => c.name === cityName);
    if (city) {
      fetchSuggestions(city);
    } else {
      setSuggestions({ winterT: null, winterRH: null, summerT: null, summerRH: null });
    }
  };

  const applySuggestion = (type: 'winter' | 'summer') => {
    if (type === 'winter' && suggestions.winterT !== null && suggestions.winterRH !== null) {
      setWinterTemp(Number(suggestions.winterT.toFixed(1)));
      setWinterRH(Number(suggestions.winterRH.toFixed(0)));
    } else if (type === 'summer' && suggestions.summerT !== null && suggestions.summerRH !== null) {
      setSummerTemp(Number(suggestions.summerT.toFixed(1)));
      setSummerRH(Number(suggestions.summerRH.toFixed(0)));
    }
  };

  const applySpeciesSuggestion = (species: SpeciesData) => {
    setIndoorTemp(species.refTemp);
    setIndoorRH(species.refRH);
  };

  const selectedSpecies = SPECIES_DATA.find(s => s.type === selectedSpeciesType);

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

      {/* City Selector */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Suggerimenti per Località</h3>
              <p className="text-xs text-slate-500">Seleziona una città per visualizzare i dati storici medi (Gennaio/Agosto).</p>
            </div>
          </div>
          <div className="relative min-w-[240px]">
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Seleziona una città...</option>
              {ITALIAN_CITIES.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} className="rotate-90" />}
            </div>
          </div>
        </div>
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

          {suggestions.winterT !== null && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-cyan-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600">
                  <Info size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider block">Media Minime Assolute (Gennaio 2014-2023)</span>
                  <span className="text-sm font-medium text-cyan-600">T: {suggestions.winterT.toFixed(1)}°C | UR: {suggestions.winterRH?.toFixed(0)}%</span>
                </div>
              </div>
              <button 
                onClick={() => applySuggestion('winter')}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-cyan-700 transition-colors shadow-sm"
              >
                Applica Suggerimento
              </button>
            </motion.div>
          )}

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

          {/* Species Suggestions Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Suggerimenti per Specie Animale</h3>
                    <p className="text-xs text-slate-500">Seleziona la specie per visualizzare i parametri di riferimento.</p>
                  </div>
                </div>
                <div className="relative min-w-[280px]">
                  <select
                    value={selectedSpeciesType}
                    onChange={(e) => setSelectedSpeciesType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Seleziona una specie...</option>
                    {SPECIES_DATA.map(species => (
                      <option key={species.type} value={species.type}>{species.type}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowRight size={16} className="rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {selectedSpecies && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ZNT (°C)</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">T Rif. (°C)</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">UR Rif. (%)</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Azione</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-indigo-50/30">
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{selectedSpecies.thermoneutrality}</td>
                      <td className="px-6 py-4 text-sm font-bold text-indigo-600">{selectedSpecies.refTemp}</td>
                      <td className="px-6 py-4 text-sm font-bold text-indigo-600">{selectedSpecies.refRH}</td>
                      <td className="px-6 py-4 text-[11px] text-slate-500 max-w-xs leading-relaxed">{selectedSpecies.notes}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => applySpeciesSuggestion(selectedSpecies)}
                          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all uppercase tracking-wider shadow-sm"
                        >
                          Applica Dati
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            )}
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

          {suggestions.summerT !== null && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                  <Info size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Media Massime Assolute (Agosto 2014-2023)</span>
                  <span className="text-sm font-medium text-amber-600">T: {suggestions.summerT.toFixed(1)}°C | UR: {suggestions.summerRH?.toFixed(0)}%</span>
                </div>
              </div>
              <button 
                onClick={() => applySuggestion('summer')}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Applica Suggerimento
              </button>
            </motion.div>
          )}

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

      <div className="flex justify-end items-center pt-6 gap-4">
        <button 
          onClick={() => setCurrentView('ventilation')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
        >
          Ventilazione per il Ricambio dell'aria
          <ArrowRight size={16} />
        </button>
        <button 
          onClick={() => setCurrentView('structure')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
        >
          Vai alla configurazione della struttura
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
