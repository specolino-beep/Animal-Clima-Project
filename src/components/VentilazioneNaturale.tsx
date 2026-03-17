import React from 'react';
import { motion } from 'motion/react';
import { Wind, ArrowLeft, Ruler, Settings2 } from 'lucide-react';
import { InputCard, ResultCard } from './Common';
import { NaturalVentParams, View } from '../types';
import { 
  calculateNaturalVentVelocity, 
  calculateRequiredOutletArea, 
  calculateCupolinoWidth, 
  calculateChimneyCount 
} from '../utils/calculations';

interface Props {
  params: NaturalVentParams;
  setParams: React.Dispatch<React.SetStateAction<NaturalVentParams>>;
  indoorTemp: number;
  winterTemp: number;
  vMinProgetto: number;
  vTotalWinter: number;
  heatBalance: number;
  setCurrentView: (view: View) => void;
}

export function VentilazioneNaturale({ 
  params, 
  setParams, 
  indoorTemp, 
  winterTemp, 
  vMinProgetto, 
  vTotalWinter, 
  heatBalance,
  setCurrentView 
}: Props) {
  
  // La portata d'aria richiesta è la ventilazione minima se il bilancio è negativo,
  // altrimenti è la ventilazione totale (minima + addizionale) se il bilancio è positivo.
  const requiredFlowRate = heatBalance <= 0 ? vMinProgetto : vTotalWinter;

  const velocity = calculateNaturalVentVelocity(params.hOut, params.hIn, indoorTemp, winterTemp, params.hExtra, params.alpha);
  const totalArea = calculateRequiredOutletArea(requiredFlowRate, velocity);
  
  const cupolinoWidth = calculateCupolinoWidth(totalArea, params.buildingLength);
  const chimneyCount = calculateChimneyCount(totalArea, params.chimneyDiameter);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione Naturale (Invernale)</h2>
          <p className="text-emerald-300 font-medium">Calcolo effetto camino per il dimensionamento delle aperture d'uscita.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Portata Necessaria (di progetto)</span>
            <p className="text-sm text-emerald-600/80 font-medium">Volume d'aria da asportare per mantenere il bilancio termico o la qualità dell'aria.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-emerald-100">
            <span className="text-2xl font-black text-emerald-700">{requiredFlowRate.toLocaleString('it-IT')} <span className="text-sm font-medium opacity-70">m³/h</span></span>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Ruler className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Geometria e Quote</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputCard 
              label="Quota Uscita (Hout)"
              value={params.hOut}
              readOnly
              unit="m"
              description="Recuperata da Altezza al colmo."
            />
            <InputCard 
              label="Quota Ingresso (Hin)"
              value={params.hIn}
              readOnly
              unit="m"
              description="Calcolata: Altezza gronda - 1/2 Altezza finestre."
            />
            <InputCard 
              label="Innalzamento Quota Uscita"
              value={params.hExtra}
              onChange={(v) => setParams(p => ({ ...p, hExtra: v }))}
              unit="m"
              description="Eventuale rialzo di cupolino o camini rispetto al colmo."
            />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Sistema di Estrazione</h3>
          </div>

          <div className="space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
              <button
                onClick={() => setParams(p => ({ ...p, ventType: 'cupolino' }))}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  params.ventType === 'cupolino' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Cupolino Continuo
              </button>
              <button
                onClick={() => setParams(p => ({ ...p, ventType: 'camini' }))}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  params.ventType === 'camini' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Camini Circolari
              </button>
            </div>

            {params.ventType === 'cupolino' ? (
              <InputCard 
                label="Lunghezza Edificio"
                value={params.buildingLength}
                readOnly
                unit="m"
                description="Recuperata dalla Lunghezza totale della struttura."
              />
            ) : (
              <InputCard 
                label="Diametro Camini"
                value={params.chimneyDiameter}
                onChange={(v) => setParams(p => ({ ...p, chimneyDiameter: v }))}
                unit="m"
                description="Diametro interno dei camini di estrazione."
              />
            )}

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Coefficiente di Efflusso (α)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 0.5, label: 'Standard (0,5)', desc: 'Cupolino continuo, finestre o camini con angoli netti' },
                  { value: 0.6, label: 'Migliorato (0,6)', desc: 'Progettazione accurata delle aperture di uscita' },
                  { value: 0.65, label: 'Ottimizzato (0,65)', desc: 'Aperture con deflettori fluidodinamici' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setParams(p => ({ ...p, alpha: opt.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      params.alpha === opt.value 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`font-bold text-sm mb-1 ${params.alpha === opt.value ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
          <h4 className="text-emerald-900 font-extrabold text-lg mb-6 flex items-center gap-2 font-montserrat">
            <Wind size={22} className="text-emerald-600" />
            Risultati Calcolo
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResultCard 
              label="Portata d'Aria Richiesta"
              value={requiredFlowRate}
              unit="m³/h"
              description={heatBalance <= 0 ? "Basata su ventilazione minima" : "Basata su ventilazione totale"}
            />
            <ResultCard 
              label="Velocità Uscita Aria"
              value={velocity}
              unit="m/s"
              description="Velocità teorica per effetto camino"
            />
            <ResultCard 
              label="Superficie Totale Uscita"
              value={totalArea}
              unit="m²"
              description="Area netta necessaria per l'estrazione"
            />
          </div>

          <div className="mt-8 pt-8 border-t border-emerald-200">
            {params.ventType === 'cupolino' ? (
              <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm max-w-md mx-auto text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Ampiezza Fessura Cupolino</p>
                <p className="text-4xl font-black text-emerald-700">{ (cupolinoWidth * 100).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) } <span className="text-xl font-medium">cm</span></p>
                <p className="text-xs text-emerald-500 mt-2">Dimensionamento calcolato per l'intera lunghezza dell'edificio</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm max-w-md mx-auto text-center">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Numero Camini Necessari</p>
                <p className="text-4xl font-black text-emerald-700">{chimneyCount} <span className="text-xl font-medium">unità</span></p>
                <p className="text-xs text-emerald-500 mt-2">Arrotondato all'intero superiore per sicurezza</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-slate-800 font-bold mb-3 text-sm">Note Tecniche</h4>
          <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
            <li>Coefficiente di efflusso (α): {params.alpha.toLocaleString('it-IT')}</li>
            <li>Il calcolo assume un bilancio di pressione equilibrato</li>
            <li>In estate, l'effetto camino è trascurabile rispetto alla ventilazione forzata o trasversale</li>
            <li>Assicurarsi che le aperture d'ingresso siano almeno pari a quelle d'uscita</li>
          </ul>
        </div>
      </div>

    </motion.div>
  );
}
