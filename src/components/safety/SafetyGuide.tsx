import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Smartphone, 
  PowerOff, 
  AlertOctagon, 
  Radio, 
  CheckCircle2, 
  Zap, 
  Volume2
} from 'lucide-react';
import { soundEngine } from '../../utils/audioSynthesizer';

export const SafetyGuide: React.FC = () => {
  const [esdTriggered, setEsdTriggered] = useState(false);

  const testESDButton = () => {
    soundEngine.playEmergencySiren();
    setEsdTriggered(true);
    setTimeout(() => {
      setEsdTriggered(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-3">
        <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Forecourt Safety Protocols & Emergency Procedures</h2>
          <p className="text-xs text-slate-400">
            Standard operating procedures for hazardous Class 1 Flammable liquids and emergency ESD systems
          </p>
        </div>
      </div>

      {/* Emergency Shut-Off Switch (ESD) Interactive Test */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-white">Emergency Stop Disconnect (ESD) Simulation</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Every fuel dispenser is wired to a high-priority Emergency Stop circuit. Pressing this instantly cuts power to all submersible turbine pumps, closes solenoid shear valves, and sounds station alarms.
          </p>
          {esdTriggered && (
            <div className="text-xs font-bold text-rose-400 animate-pulse flex items-center space-x-1.5 pt-1">
              <Volume2 className="w-4 h-4" />
              <span>[TEST DRILL] EMERGENCY STOP ACTIVATED: ALL TURBINES SHUT DOWN & VALVES TRIPPED</span>
            </div>
          )}
        </div>

        <button
          onClick={testESDButton}
          className="flex-shrink-0 px-6 py-4 rounded-2xl bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-400 hover:to-rose-600 active:scale-95 text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-rose-950/60 border-2 border-rose-400/40 flex items-center space-x-2.5 transition cursor-pointer"
        >
          <PowerOff className="w-5 h-5" />
          <span>PRESS TO TEST ESD SHUTOFF</span>
        </button>
      </div>

      {/* Safety Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <PowerOff className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Engine Switched Off</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Turn off the vehicle ignition, headlights, and any auxiliary heaters. Running engines produce spark ignition risks near volatile gasoline fumes.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Strictly No Smoking / Open Flame</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Petroleum vapors are heavier than air and linger near ground level. Matches, lighters, and lit cigarettes are forbidden within 50 meters of fuel bays.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Mobile Phones Put Away</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Keep mobile devices inside pockets or vehicles. Lithium-ion batteries with microscopic drops or RF circuits present minor electrical spark potential.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Static Discharge Grounding</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Always touch the metallic body of the car or pump island before touching the nozzle to safely bleed static charges from synthetic clothing or seat sliding.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Never Lock Nozzle Unattended</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Never walk away while dispensing fuel or re-enter your vehicle. Keep one hand on or adjacent to the nozzle to respond instantly if an overfill happens.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-white">Approved Portable Containers</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Only fill certified red polymer or metal jerrycans resting securely on the ground. Never fill containers sitting inside car trunks or truck beds.
          </p>
        </div>

      </div>

    </div>
  );
};
