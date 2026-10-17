import React from 'react';
import { X, Cpu, Gauge, Zap, Shield, RotateCw, Wind } from 'lucide-react';

interface ExplodedComponentsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplodedComponentsList: React.FC<ExplodedComponentsListProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const components = [
    {
      title: '1. Flameproof Electric Motor (ATEX Ex d)',
      category: 'Power & Suction',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      description: 'Heavy cast-iron enclosed motor prevents internal electrical arcs from igniting flammable petroleum vapors present around the forecourt.'
    },
    {
      title: '2. Positive Displacement Piston Flow Meter',
      category: 'Metrological Core',
      icon: Gauge,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      description: '4-cylinder opposed piston chamber measuring fuel with ±0.15% accuracy. Each piston displacement represents an exact physical fluid volume calibrated by weights and measures standards (OIML R117).'
    },
    {
      title: '3. Optical Shaft Pulse Encoder (Pulser)',
      category: 'Digital Translation',
      icon: Cpu,
      color: 'text-sky-400',
      bgColor: 'bg-sky-400/10',
      description: 'Connected directly to the meter shaft, emitting 100 to 1,000 optical electronic pulses per litre. The CPU computes instantaneous litres and multiplies by the live unit rate.'
    },
    {
      title: '4. Air & Vapor Separator System',
      category: 'Measurement Integrity',
      icon: Wind,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      description: 'Vortical chamber that removes trapped air bubbles and foam from fuel before reaching the meter, guaranteeing customers are never billed for pumped air.'
    },
    {
      title: '5. Dual-Stage Solenoid Valve',
      category: 'Flow Regulation',
      icon: RotateCw,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      description: 'Delivers full flow rate (~40–45 L/min) during fueling, then throttles to a slow trickle (~4 L/min) during the final 0.5 Litres to stop precisely on the target currency preset without surging.'
    },
    {
      title: '6. Venturi Auto-Shutoff Nozzle Mechanism',
      category: 'Overfill Safety',
      icon: Shield,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      description: 'A tiny secondary sensing tube inside the nozzle spout draws a small vacuum via Venturi effect. When rising fuel in the car tank covers the tip hole, the vacuum trips a spring-loaded diaphragm, instantly snapping the trigger shut!'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Internal Machine Anatomy</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono">
                DIL FARAZ PETROLEUM
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              How modern multi-product dispensers measure, pump, and control petroleum
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {components.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.color} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
          >
            Close & Return to 3D View
          </button>
        </div>
      </div>
    </div>
  );
};
