import React from 'react';
import { motion } from 'motion/react';
import { Wind, Ruler, Settings2, Info, AlertTriangle, CheckCircle2, Zap, Layout, ArrowRight } from 'lucide-react';
import { InputCard, ResultCard } from './Common';
import { CoolingParams, View, BuildingDimensions } from '../types';
import { calculateFanThrow, calculateFansPerRow, calculateCoolingEnergy } from '../utils/calculations';
import { COOLING_FANS } from '../data/coolingFans';

interface Props {
  params: CoolingParams;
  setParams: React.Dispatch<React.SetStateAction<CoolingParams>>;
  setCurrentView: (view: View) => void;
  buildingDimensions: BuildingDimensions;
  numHeads: number;
  avgWeight: number;
  selectedAnimalName: string;
}

export function SistemiRaffrescamento({ 
  params, 
  setParams, 
  setCurrentView, 
  buildingDimensions,
  numHeads,
  avgWeight,
  selectedAnimalName
}: Props) {
  
  const isBovine = selectedAnimalName.toLowerCase().includes('bovini') || selectedAnimalName.toLowerCase().includes('vacche');

  const filteredFans = COOLING_FANS.filter(f => f.type === params.flowType);
  const selectedFan = filteredFans.find(f => f.id === params.selectedFanId) || filteredFans[0];

  // Calcolo suggerito numero di file
  // Orizzontale: raggio d'azione trasversale ~ 2.5 * diametro (basato su espansione del getto d'aria)
  // Verticale: raggio d'azione ~ 2 * diametro (copertura diametro = 4 * diametro)
  const suggestedRows = React.useMemo(() => {
    if (!selectedFan) return 1;
    const coverageWidth = params.flowType === 'horizontal' ? selectedFan.diameter * 2.5 : selectedFan.diameter * 4;
    return Math.max(1, Math.ceil(buildingDimensions.width / coverageWidth));
  }, [buildingDimensions.width, selectedFan, params.flowType]);

  // Aggiorna automaticamente il numero di file quando cambia il suggerimento
  React.useEffect(() => {
    setParams(prev => ({ ...prev, numRows: suggestedRows }));
  }, [suggestedRows, setParams]);

  // Calcoli basati sulla regola della velocità target
  const throwMultiplier = React.useMemo(() => {
    if (params.targetVelocity <= 1.8) return 12;
    if (params.targetVelocity < 2.5) return 11;
    return 10;
  }, [params.targetVelocity]);

  const usefulThrow = params.flowType === 'horizontal' 
    ? calculateFanThrow(selectedFan.diameter, throwMultiplier)
    : selectedFan.diameter * 4; // Copertura HVLS aggiornata a 4x

  const fansPerRow = calculateFansPerRow(buildingDimensions.length, usefulThrow);
  const totalFans = fansPerRow * params.numRows;

  // Consumo Energetico
  const dailyEnergy = calculateCoolingEnergy(totalFans, selectedFan.power, params.hoursPerDay);
  const energyPerCapo = numHeads > 0 ? (dailyEnergy * 1000) / numHeads : 0;
  const totalWeight = numHeads * avgWeight;
  const energyPerWeight = totalWeight > 0 ? (dailyEnergy * 1000) / totalWeight : 0;

  const animalPresets = [
    { name: 'Suini', velocity: 1.8 },
    { name: 'Bovini', velocity: 2.0 },
    { name: 'Avicoli', velocity: 2.5 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Sistemi di Raffrescamento</h2>
            <p className="text-emerald-300 font-medium">Dimensionamento sistema convettivo (Wind-Chill)</p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Input: Schema di Flusso */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Layout className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Schema di Flusso</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const firstH = COOLING_FANS.find(f => f.type === 'horizontal')!;
                setParams(p => ({ ...p, flowType: 'horizontal', selectedFanId: firstH.id }));
              }}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                params.flowType === 'horizontal'
                  ? 'bg-emerald-50 border-emerald-500 shadow-md'
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${params.flowType === 'horizontal' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Wind size={20} />
                </div>
                <span className={`font-bold ${params.flowType === 'horizontal' ? 'text-emerald-900' : 'text-slate-600'}`}>Orizzontale / Obliquo</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ventilatori ad alta velocità che creano una scia d'aria longitudinale. Ideale per tutte le specie.
              </p>
            </button>

            <button
              onClick={() => {
                const firstV = COOLING_FANS.find(f => f.type === 'vertical')!;
                setParams(p => ({ ...p, flowType: 'vertical', selectedFanId: firstV.id }));
              }}
              className={`p-6 rounded-2xl border-2 text-left transition-all relative ${
                params.flowType === 'vertical'
                  ? 'bg-emerald-50 border-emerald-500 shadow-md'
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${params.flowType === 'vertical' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  <Zap size={20} />
                </div>
                <span className={`font-bold ${params.flowType === 'vertical' ? 'text-emerald-900' : 'text-slate-600'}`}>Verticale Discendente</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ventilatori HVLS (High Volume Low Speed) a soffitto. Copertura zenitale per grandi aree.
              </p>
              <div className="mt-3 p-2 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-600 leading-tight">
                  <span className="font-bold text-emerald-600">Nota:</span> Tipicamente usati per bovini in strutture con altezze {'>'} 4-5m.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Input: Parametri di Progetto */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Parametri di Progetto</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Velocità Aria Target</label>
                <select
                  value={[1.8, 2.0, 2.5].includes(params.targetVelocity) ? params.targetVelocity : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'custom') {
                      setParams(p => ({ ...p, targetVelocity: parseFloat(val) }));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                >
                  <option value={1.8}>1,8 m/s</option>
                  <option value={2.0}>2,0 m/s</option>
                  <option value={2.5}>2,5 m/s</option>
                  <option value="custom">Valore Personalizzato</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex gap-3">
                  <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold">Nota tecnica:</span> I valori più bassi (1,8 m/s) sono indicati per i <span className="font-bold">suini</span>, quelli più alti (2,5 m/s) per gli <span className="font-bold">avicoli</span> (polli da carne). Per le <span className="font-bold">vacche da latte</span> è suggerito un valore di <span className="font-bold text-emerald-600">2,0 m/s</span>.
                  </p>
                </div>
              </div>
            </div>

            <InputCard 
              label="Modifica Manuale Velocità"
              value={params.targetVelocity}
              onChange={(v) => setParams(p => ({ ...p, targetVelocity: Math.max(0.1, v) }))}
              unit="m/s"
              description="Regola finemente la velocità dell'aria target."
            />
          </div>
        </section>

        {/* Input: Caratteristiche Ventilatore */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Wind className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Selezione Ventilatore</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modello Ventilatore</label>
              <select
                value={params.selectedFanId}
                onChange={(e) => setParams(p => ({ ...p, selectedFanId: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              >
                {filteredFans.map(fan => (
                  <option key={fan.id} value={fan.id}>
                    Ø {fan.diameter}m - {fan.airflow.toLocaleString()} m³/h ({fan.power} kW)
                  </option>
                ))}
              </select>
            </div>

            <InputCard 
              label="Ore di Funzionamento"
              value={params.hoursPerDay}
              onChange={(v) => setParams(p => ({ ...p, hoursPerDay: Math.min(24, Math.max(0, v)) }))}
              unit="h/giorno"
              description="Valore medio giornaliero stimato."
            />
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="flex gap-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-amber-800 leading-relaxed">
                <span className="font-bold text-amber-900">Nota operativa:</span> Il sistema può essere azionato da <span className="font-bold">termostati</span> (temperatura interna/esterna), <span className="font-bold">temporizzato</span> ad intervalli prestabiliti (cicli on/off) o gestito tramite <span className="font-bold">gruppi di ventilatori</span> con azionamento alternato. Inserire in questa cella il valore stimato del periodo totale di funzionamento medio giornaliero.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Diametro</span>
              <span className="text-sm font-black text-slate-700">{selectedFan?.diameter} m</span>
            </div>
            <div className="text-center border-x border-slate-200">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Portata</span>
              <span className="text-sm font-black text-slate-700">{selectedFan?.airflow.toLocaleString()} m³/h</span>
            </div>
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Potenza</span>
              <span className="text-sm font-black text-slate-700">{selectedFan?.power} kW</span>
            </div>
          </div>
        </section>

        {/* Input: Disposizione Strutturale */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Ruler className="text-emerald-600" size={20} />
            <h3 className="font-extrabold text-slate-800 font-montserrat">Disposizione Strutturale</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Lunghezza Fila</span>
                <span className="text-lg font-black text-slate-700">{buildingDimensions.length} m</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-medium text-slate-400 block italic">Sincronizzato con struttura</span>
              </div>
            </div>

            <InputCard 
              label="Numero di File"
              value={params.numRows}
              onChange={(v) => setParams(p => ({ ...p, numRows: Math.max(1, v) }))}
              unit="n°"
              description={`Valore suggerito: ${suggestedRows} (basato su larghezza ${buildingDimensions.width}m)`}
            />
          </div>
        </section>

        {/* Risultati Dimensionamento */}
        <div className="bg-emerald-500/5 rounded-2xl p-8 border border-emerald-500/10 shadow-sm space-y-8">
          <div>
            <h4 className="text-emerald-900 font-extrabold text-lg mb-6 flex items-center gap-2 font-montserrat">
              <CheckCircle2 size={22} className="text-emerald-600" />
              Dimensionamento Sistema
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResultCard 
                label={params.flowType === 'horizontal' ? "Gittata Utile" : "Raggio d'Azione"}
                value={usefulThrow}
                unit="m"
                description={params.flowType === 'horizontal' ? "Regola 1:10 del diametro" : "Area di copertura HVLS"}
              />
              <ResultCard 
                label="Ventilatori per Fila"
                value={fansPerRow}
                unit="unità"
                description="Copertura longitudinale"
              />
              <ResultCard 
                label="Totale Ventilatori"
                value={totalFans}
                unit="unità"
                description={`Distribuiti su ${params.numRows} file`}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-500/10">
            <h4 className="text-emerald-900 font-extrabold text-lg mb-6 flex items-center gap-2 font-montserrat">
              <Zap size={22} className="text-amber-600" />
              Consumo Energetico Stimato
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ResultCard 
                label="Consumo Totale"
                value={dailyEnergy.toLocaleString('it-IT', { maximumFractionDigits: 2 })}
                unit="kWh/giorno"
                description={`Basato su ${params.hoursPerDay}h di utilizzo`}
              />
              <ResultCard 
                label="Consumo per Capo"
                value={energyPerCapo.toLocaleString('it-IT', { maximumFractionDigits: 1 })}
                unit="Wh/giorno/capo"
                description={`Per ${numHeads} capi totali`}
              />
              <ResultCard 
                label="Consumo per kg PV"
                value={energyPerWeight.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
                unit="Wh/giorno/kg"
                description={`Peso vivo totale: ${(numHeads * avgWeight).toLocaleString()} kg`}
              />
            </div>
          </div>
        </div>

        {/* Note Tecniche */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-slate-400" size={18} />
            <h4 className="text-slate-800 font-bold text-sm">Consigli per il Posizionamento</h4>
          </div>
          <ul className="text-xs text-slate-500 space-y-3 list-disc pl-4">
            <li>
              <span className="font-bold text-slate-700">Inclinazione:</span> I ventilatori devono essere inclinati di circa <span className="text-emerald-600 font-bold">15-20°</span> verso il basso.
            </li>
            <li>
              <span className="font-bold text-slate-700">Puntamento:</span> Puntare verso la schiena dell'animale a metà strada tra un ventilatore e l'altro.
            </li>
            <li>
              <span className="font-bold text-slate-700">Sincronia:</span> Spingere l'aria tutti nella stessa direzione per creare un flusso continuo e laminare.
            </li>
            <li>
              <span className="font-bold text-slate-700">Altezza:</span> Installare i ventilatori a un'altezza tale da non interferire con i mezzi meccanici, ma sufficientemente bassi da investire gli animali.
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
