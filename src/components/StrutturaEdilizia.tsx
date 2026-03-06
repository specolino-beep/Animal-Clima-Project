import React from 'react';
import { motion } from 'motion/react';
import { 
  Maximize, 
  Layers, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ArrowRight 
} from 'lucide-react';
import { MATERIAL_DATABASE } from '../data/materials';
import { BuildingElement, Layer, View, BuildingDimensions } from '../types';
import { InputCard } from './Common';

interface StrutturaEdiliziaProps {
  elements: BuildingElement[];
  updateElement: (id: string, updates: Partial<BuildingElement>) => void;
  addLayer: (id: string) => void;
  removeLayer: (elementId: string, layerId: string) => void;
  updateLayer: (elementId: string, layerId: string, updates: Partial<Layer>) => void;
  calculateElementThermal: (element: BuildingElement) => { uValue: number };
  umBuilding: number;
  setCurrentView: (view: View) => void;
  dimensions: BuildingDimensions;
  setDimensions: (dimensions: BuildingDimensions) => void;
}

export function StrutturaEdilizia({
  elements,
  updateElement,
  addLayer,
  removeLayer,
  updateLayer,
  calculateElementThermal,
  umBuilding,
  setCurrentView,
  dimensions,
  setDimensions
}: StrutturaEdiliziaProps) {
  const roofSlope = dimensions.width > 0 
    ? ((dimensions.ridgeHeight - dimensions.eaveHeight) / (dimensions.width / 2)) * 100 
    : 0;

  const areaTrasversale = ((dimensions.ridgeHeight + dimensions.eaveHeight) / 2) * dimensions.length;
  const areaLongitudinale = ((dimensions.ridgeHeight + dimensions.eaveHeight) / 2) * dimensions.width;

  return (
    <motion.div 
      key="structure"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <section className="bg-slate-600 rounded-2xl border border-slate-700 p-8 shadow-sm">
        <h2 className="text-2xl font-extrabold text-white mb-2 font-montserrat">Struttura Edilizia</h2>
        <p className="text-emerald-300 font-medium">
          Definisci le dimensioni della struttura, le superfici disperdenti e la stratigrafia dei materiali per il calcolo della trasmittanza termica.
        </p>
      </section>

      {/* Building Dimensions */}
      <section className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-montserrat">Dimensioni Struttura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputCard 
            label="Lunghezza totale (m)"
            icon={<Maximize size={14} />}
            content={
              <input
                type="number"
                min="0"
                value={dimensions.length}
                onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            }
          />
          <InputCard 
            label="Larghezza totale (m)"
            icon={<Maximize size={14} />}
            content={
              <input
                type="number"
                min="0"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            }
          />
          <InputCard 
            label="Altezza al colmo (m)"
            icon={<Maximize size={14} />}
            content={
              <input
                type="number"
                min="0"
                value={dimensions.ridgeHeight}
                onChange={(e) => setDimensions({ ...dimensions, ridgeHeight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            }
          />
          <InputCard 
            label="Altezza in gronda (m)"
            icon={<Maximize size={14} />}
            content={
              <input
                type="number"
                min="0"
                value={dimensions.eaveHeight}
                onChange={(e) => setDimensions({ ...dimensions, eaveHeight: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pendenza Falde</span>
            <span className="text-xl font-bold text-slate-900">{roofSlope.toLocaleString('it-IT', { maximumFractionDigits: 1 })}%</span>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sezione Trasversale (Media)</span>
            <span className="text-xl font-bold text-slate-900">{areaTrasversale.toLocaleString('it-IT', { maximumFractionDigits: 1 })} m²</span>
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sezione Longitudinale (Media)</span>
            <span className="text-xl font-bold text-slate-900">{areaLongitudinale.toLocaleString('it-IT', { maximumFractionDigits: 1 })} m²</span>
          </div>
        </div>
      </section>

      {/* Surfaces Input */}
      <section className="space-y-4">
        <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-montserrat">Superfici Disperdenti (m²)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {elements.map(el => (
            <div key={el.id}>
              <InputCard 
                label={el.name}
                icon={<Maximize size={14} />}
                content={
                  <input
                    type="number"
                    min="0"
                    value={el.surface}
                    onChange={(e) => updateElement(el.id, { surface: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                  />
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stratigraphy */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest font-montserrat">Stratigrafia Materiali</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elements.map(el => (
            <div key={el.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  <span className="font-bold text-slate-900">{el.name}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  U: {calculateElementThermal(el).uValue.toLocaleString('it-IT', { maximumFractionDigits: 3 })} W/m²K
                </div>
              </div>
              
              <div className="p-4 space-y-4 flex-grow">
                {el.layers.map((layer, idx) => (
                  <div key={layer.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-1 text-[10px] font-bold text-slate-300 mb-3">#{idx + 1}</div>
                    <div className="col-span-7 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Materiale</label>
                      <div className="relative">
                        <select
                          value={layer.materialName}
                          onChange={(e) => updateLayer(el.id, layer.id, { materialName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium"
                        >
                          {MATERIAL_DATABASE.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={14} />
                      </div>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Spess. (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={layer.thickness}
                        onChange={(e) => updateLayer(el.id, layer.id, { thickness: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium"
                      />
                    </div>
                    <div className="col-span-1 mb-1">
                      <button 
                        onClick={() => removeLayer(el.id, layer.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => addLayer(el.id)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <Plus size={14} />
                  Aggiungi Strato
                </button>
              </div>

              {el.id === 'floor' && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">R Terreno (m²K/W)</label>
                    <input
                      type="number"
                      value={el.rGround || 0}
                      onChange={(e) => updateElement(el.id, { rGround: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">T Falda (°C)</label>
                    <input
                      type="number"
                      value={el.tGroundwater || 0}
                      onChange={(e) => updateElement(el.id, { tGroundwater: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Um Building Result - Prominent at the bottom */}
      <div className="bg-emerald-500/10 p-8 rounded-2xl border border-emerald-500/20 shadow-sm">
        <span className="text-xs font-bold text-emerald-800 uppercase block mb-2 tracking-widest">
          Um - Coefficiente globale di trasmissione termica media
        </span>
        <div className="flex items-baseline gap-2">
          <h4 className="text-6xl font-bold font-mono tracking-tighter text-emerald-900">
            {umBuilding.toLocaleString('it-IT', { maximumFractionDigits: 3 })}
          </h4>
          <span className="text-2xl font-medium text-emerald-700">W/m²K</span>
        </div>
        <p className="mt-4 text-emerald-700/80 text-sm italic leading-relaxed font-medium">
          Rappresenta il valore medio della trasmittanza termica di tutti gli elementi costruttivi che compongono l'involucro dell'edificio.
        </p>
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
