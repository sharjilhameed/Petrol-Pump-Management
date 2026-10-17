import React, { useState } from 'react';
import { 
  Camera, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Gauge, 
  Coins, 
  Fuel, 
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { FuelProduct } from '../../types/petrol';
import { soundEngine } from '../../utils/audioSynthesizer';

interface DispenserControlDockProps {
  fuels: FuelProduct[];
  selectedFuel: FuelProduct;
  onSelectFuel: (fuel: FuelProduct) => void;
  cameraPreset: 'station' | 'dispenser' | 'nozzle' | 'car' | 'exploded';
  onSelectCamera: (preset: 'station' | 'dispenser' | 'nozzle' | 'car' | 'exploded') => void;
  targetPreset: number;
  onSetTargetPreset: (val: number) => void;
  presetType: 'litres' | 'amount' | 'full';
  onSetPresetType: (type: 'litres' | 'amount' | 'full') => void;
  explodedSeparation: number;
  onSetExplodedSeparation: (val: number) => void;
  onOpenExplodedSpecs: () => void;
  currencySymbol: string;
}

export const DispenserControlDock: React.FC<DispenserControlDockProps> = ({
  fuels,
  selectedFuel,
  onSelectFuel,
  cameraPreset,
  onSelectCamera,
  targetPreset,
  onSetTargetPreset,
  presetType,
  onSetPresetType,
  explodedSeparation,
  onSetExplodedSeparation,
  onOpenExplodedSpecs,
  currencySymbol
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeDockTab, setActiveDockTab] = useState<'fuel' | 'preset' | 'camera' | 'exploded'>('fuel');

  return (
    <div 
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[94vw] max-w-[920px] transition-transform duration-300 pointer-events-auto ${
        isCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse/Expand Tab Header */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => {
            soundEngine.playKeyBeep(800);
            setIsCollapsed(!isCollapsed);
          }}
          className="px-5 py-1.5 rounded-t-xl bg-slate-900/95 border-t border-x border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 shadow-lg backdrop-blur-md transition cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Show Dispenser Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Controls (Cinema View)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-3 md:p-4 text-white">
        
        {/* Navigation Tabs in Dock */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3 gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => { soundEngine.playKeyBeep(1000); setActiveDockTab('fuel'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                activeDockTab === 'fuel' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Grade Selection</span>
            </button>

            <button
              onClick={() => { soundEngine.playKeyBeep(1000); setActiveDockTab('preset'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                activeDockTab === 'preset' 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Set Presets</span>
            </button>

            <button
              onClick={() => { soundEngine.playKeyBeep(1000); setActiveDockTab('camera'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                activeDockTab === 'camera' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>3D Views</span>
            </button>

            <button
              onClick={() => { soundEngine.playKeyBeep(1000); setActiveDockTab('exploded'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
                activeDockTab === 'exploded' 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Inside Machine (Exploded)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[11px] text-slate-400 font-mono">
            <span>DIL FARAZ PETROLEUM • BAY #1</span>
          </div>
        </div>

        {/* Tab 1: Fuel Grade Selection */}
        {activeDockTab === 'fuel' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {fuels.map(fuel => {
              const isSelected = selectedFuel.id === fuel.id;
              return (
                <button
                  key={fuel.id}
                  onClick={() => {
                    soundEngine.playKeyBeep(1200);
                    onSelectFuel(fuel);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition relative ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30' 
                      : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: fuel.color }}
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{fuel.code}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-1 truncate">{fuel.name}</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {currencySymbol} {fuel.pricePerLitre.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Preset Setting */}
        {activeDockTab === 'preset' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <button
                onClick={() => { soundEngine.playKeyBeep(1100); onSetPresetType('amount'); }}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  presetType === 'amount' 
                    ? 'bg-sky-500 text-slate-950 font-bold' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                By Amount ({currencySymbol})
              </button>
              <button
                onClick={() => { soundEngine.playKeyBeep(1100); onSetPresetType('litres'); }}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  presetType === 'litres' 
                    ? 'bg-sky-500 text-slate-950 font-bold' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                By Litres (L)
              </button>
              <button
                onClick={() => { soundEngine.playKeyBeep(1100); onSetPresetType('full'); }}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  presetType === 'full' 
                    ? 'bg-emerald-500 text-slate-950 font-bold' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Full Tank Auto
              </button>
            </div>

            {presetType !== 'full' ? (
              <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
                {(presetType === 'amount' ? [500, 1000, 2000, 5000] : [5, 10, 20, 40]).map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      soundEngine.playKeyBeep(1300);
                      onSetTargetPreset(val);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                      targetPreset === val 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {presetType === 'amount' ? `${currencySymbol}${val}` : `${val} L`}
                  </button>
                ))}
                
                {/* Custom input */}
                <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={targetPreset}
                    onChange={(e) => onSetTargetPreset(Math.max(1, Number(e.target.value)))}
                    className="w-14 bg-transparent text-xs text-white text-right focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 ml-1">
                    {presetType === 'amount' ? currencySymbol : 'L'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-emerald-400 flex items-center space-x-1 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-cut when car tank nozzle sensor detects full capacity (~45L)</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Camera Angles */}
        {activeDockTab === 'camera' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'station', label: '1. Station View', desc: 'Overhead & Canopy' },
              { id: 'dispenser', label: '2. Dispenser Front', desc: 'LCD Screens & Head' },
              { id: 'nozzle', label: '3. Holster & Grip', desc: 'Trigger & Spout' },
              { id: 'car', label: '4. Car Fuel Bay', desc: 'Tank Flap & Inlet' },
              { id: 'exploded', label: '5. Inside Mechanism', desc: 'Internal Piston Meter' }
            ].map(cam => (
              <button
                key={cam.id}
                onClick={() => {
                  soundEngine.playKeyBeep(1000);
                  onSelectCamera(cam.id as 'station' | 'dispenser' | 'nozzle' | 'car' | 'exploded');
                  if (cam.id === 'exploded' && explodedSeparation === 0) {
                    onSetExplodedSeparation(0.75);
                  }
                }}
                className={`p-2 rounded-xl text-left border transition ${
                  cameraPreset === cam.id 
                    ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/30' 
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-semibold">{cam.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{cam.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 4: Exploded View Slider & Technical Breakdown */}
        {activeDockTab === 'exploded' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 w-full sm:w-2/3">
                <Sliders className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-xs text-slate-300 whitespace-nowrap">Panel Separation:</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={explodedSeparation}
                  onChange={(e) => {
                    onSetExplodedSeparation(parseFloat(e.target.value));
                    if (cameraPreset !== 'exploded') {
                      onSelectCamera('exploded');
                    }
                  }}
                  className="w-full accent-purple-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
                <span className="text-xs font-mono text-purple-400 font-bold w-12 text-right">
                  {Math.round(explodedSeparation * 100)}%
                </span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playKeyBeep(1100);
                  onOpenExplodedSpecs();
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Info className="w-3.5 h-3.5 text-purple-300" />
                <span>View Internal Specs & Anatomy</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Slide to peel open the explosion-proof dispenser panels and reveal the 4-piston positive displacement flow meter, optical pulser, and vapor recovery manifold.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
