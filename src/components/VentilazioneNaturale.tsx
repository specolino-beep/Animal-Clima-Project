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

  const velocity = calculateNaturalVentVelocity(params.hOut, params.hIn, indoorTemp, winterTemp);
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
      <section className="bg-slate-600 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Ventilazione Naturale</h2>
        <p className="text-emerald-300 font-medium">Calcolo effetto camino per il dimensionamento delle aperture d'uscita.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Ruler className="text-emerald-600" size={20} />
              <h3 className="font-extrabold text-slate-800 font-montserrat">Geometria e Quote</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputCard 
                label="Quota Uscita (Hout)"
                value={params.hOut}
                onChange={(v) => setParams(p => ({ ...p, hOut: v }))}
                unit="m"
                description="Altezza al colmo o quota massima camini."
              />
              <InputCard 
                label="Quota Ingresso (Hin)"
                value={params.hIn}
                onChange={(v) => setParams(p => ({ ...p, hIn: v }))}
                unit="m"
                description="Quota media delle finestrature laterali."
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
                  onChange={(v) => setParams(p => ({ ...p, buildingLength: v }))}
                  unit="m"
                  description="Lunghezza totale della fessura del cupolino."
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
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
            <h4 className="text-emerald-900 font-bold mb-4 flex items-center gap-2">
              <Wind size={18} />
              Risultati Calcolo
            </h4>
            
            <div className="space-y-4">
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

              <div className="pt-4 border-t border-emerald-200">
                {params.ventType === 'cupolino' ? (
                  <div className="bg-white/50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Ampiezza Fessura Cupolino</p>
                    <p className="text-2xl font-black text-emerald-700">{(cupolinoWidth * 100).toFixed(1)} <span className="text-sm font-medium">cm</span></p>
                    <p className="text-[10px] text-emerald-500 mt-1">Dimensionamento per l'intera lunghezza</p>
                  </div>
                ) : (
                  <div className="bg-white/50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Numero Camini Necessari</p>
                    <p className="text-2xl font-black text-emerald-700">{chimneyCount} <span className="text-sm font-medium">unità</span></p>
                    <p className="text-[10px] text-emerald-500 mt-1">Arrotondato all'intero superiore</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="text-slate-800 font-bold mb-3 text-sm">Note Tecniche</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
              <li>Coefficiente di efflusso (Alfa) impostato a 0.5</li>
              <li>Il calcolo assume un bilancio di pressione equilibrato</li>
              <li>In estate, l'effetto camino è trascurabile rispetto alla ventilazione forzata o trasversale</li>
              <li>Assicurarsi che le aperture d'ingresso siano almeno pari a quelle d'uscita</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex justify-start pt-8">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 px-6 py-4 bg-slate-600 text-emerald-300 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
        >
          Torna alla Home
        </button>
      </div>
    </motion.div>
  );
}
