import React from 'react';
import { 
  Fuel, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { SimulatorStep, FuelProduct } from '../../types/petrol';
import { soundEngine } from '../../utils/audioSynthesizer';

interface HowToUseGuideProps {
  step: SimulatorStep;
  currentFuel: FuelProduct;
  dispensedLitres: number;
  totalCost: number;
  targetPreset: number;
  presetType: 'litres' | 'amount' | 'full';
  isTriggerPressed: boolean;
  isMuted: boolean;
  onSetMuted: (muted: boolean) => void;
  onNextStep: () => void;
  onPrevStep?: () => void;
  onReset: () => void;
  onStartDispense: () => void;
  onStopDispense: () => void;
  onOpenReceipt: () => void;
  currencySymbol: string;
}

export const HowToUseGuide: React.FC<HowToUseGuideProps> = ({
  step,
  currentFuel,
  dispensedLitres,
  totalCost,
  targetPreset,
  presetType,
  isTriggerPressed,
  isMuted,
  onSetMuted,
  onNextStep,
  onReset,
  onStartDispense,
  onStopDispense,
  onOpenReceipt,
  currencySymbol
}) => {
  const stepsList: { key: SimulatorStep; title: string; hint: string }[] = [
    { key: 'safety_check', title: '1. Safety & Grounding', hint: 'Turn off engine, no smoking/cellphones, ground static electricity.' },
    { key: 'select_grade', title: '2. Select Fuel Grade', hint: 'Select Super 92, Diesel Euro-V, or Hi-Octane 97.' },
    { key: 'set_preset', title: '3. Set Target Amount', hint: 'Specify exact litres, total currency amount, or Full Tank.' },
    { key: 'pick_nozzle', title: '4. Lift Nozzle', hint: 'Remove delivery nozzle from pump holster to activate suction pump.' },
    { key: 'open_fuel_cap', title: '5. Open Car Tank Lid', hint: 'Open the vehicle fuel flap and unscrew the safety cap.' },
    { key: 'insert_nozzle', title: '6. Insert Nozzle', hint: 'Insert nozzle spout all the way into the car fuel inlet pipe.' },
    { key: 'dispense', title: '7. Squeeze & Refuel', hint: 'Hold down the trigger lever to pump fuel. Counter starts rolling.' },
    { key: 'auto_cutoff', title: '8. Auto-Cutoff Snapped', hint: 'Venturi air sensor snaps trigger shut when fuel reaches inlet neck.' },
    { key: 'return_nozzle', title: '9. Restow Nozzle', hint: 'Tighten fuel cap, close vehicle lid, and return nozzle to holster.' },
    { key: 'completed', title: '10. Completed & Receipt', hint: 'Transaction complete! Verify totalizer and print tax receipt.' }
  ];

  const currentStepIndex = stepsList.findIndex(s => s.key === step);
  const currentStepData = stepsList[currentStepIndex] || stepsList[0];

  return (
    <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-[440px] z-20 pointer-events-auto">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md text-white">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                How to Use Pump Machine
              </h2>
              <p className="text-xs text-slate-400">Step-by-step Interactive Training</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                soundEngine.playKeyBeep(900);
                onSetMuted(!isMuted);
              }}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                soundEngine.playKeyBeep(600);
                onReset();
              }}
              title="Reset tutorial"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span>Step {currentStepIndex + 1} of {stepsList.length}</span>
            <span className="text-emerald-400 font-semibold">{Math.round(((currentStepIndex + 1) / stepsList.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-sky-500 to-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / stepsList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Instruction Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 p-1 rounded-md bg-sky-500/20 text-sky-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {currentStepData.title}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentStepData.hint}
              </p>
            </div>
          </div>

          {/* Special Contextual Highlights */}
          {step === 'safety_check' && (
            <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center space-x-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Touch the metal grounding pad on dispenser to discharge static sparks before fueling.</span>
            </div>
          )}

          {step === 'dispense' && (
            <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Dispensed: <strong className="text-sky-400 text-sm">{dispensedLitres.toFixed(2)} L</strong></span>
                <span>Amount: <strong className="text-emerald-400 text-sm">{currencySymbol} {totalCost.toFixed(2)}</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Preset Limit: {presetType === 'full' ? 'Full Auto-Shutoff' : `${targetPreset} ${presetType === 'litres' ? 'Litres' : currencySymbol}`}
              </div>
            </div>
          )}

          {step === 'auto_cutoff' && (
            <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>Automatic shut-off triggered! Venturi hole in nozzle sensed fuel surge, preventing any tank overflow.</span>
            </div>
          )}
        </div>

        {/* Action Controls for Current Step */}
        <div className="mt-4">
          {step === 'safety_check' && (
            <button
              onClick={() => {
                soundEngine.playKeyBeep(1200);
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Safety & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'select_grade' && (
            <button
              onClick={() => {
                soundEngine.playKeyBeep(1100);
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Confirm Fuel: {currentFuel.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'set_preset' && (
            <button
              onClick={() => {
                soundEngine.playKeyBeep(1300);
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Accept Preset ({targetPreset} {presetType === 'litres' ? 'L' : currencySymbol})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'pick_nozzle' && (
            <button
              onClick={() => {
                soundEngine.playNozzleClack();
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 flex items-center justify-center space-x-2 transition animate-bounce"
            >
              <Sparkles className="w-4 h-4" />
              <span>Pick Up Nozzle from Holster</span>
            </button>
          )}

          {step === 'open_fuel_cap' && (
            <button
              onClick={() => {
                soundEngine.playNozzleClack();
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Open Car Fuel Flap & Unscrew Cap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'insert_nozzle' && (
            <button
              onClick={() => {
                soundEngine.playNozzleClack();
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Insert Nozzle Deeply into Tank Neck</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'dispense' && (
            <div className="space-y-2">
              <button
                onMouseDown={onStartDispense}
                onMouseUp={onStopDispense}
                onTouchStart={onStartDispense}
                onTouchEnd={onStopDispense}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition select-none ${
                  isTriggerPressed 
                    ? 'bg-emerald-500 text-slate-950 scale-[0.98] ring-4 ring-emerald-400/50' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                <Fuel className={`w-5 h-5 ${isTriggerPressed ? 'animate-spin' : ''}`} />
                <span>{isTriggerPressed ? 'PUMPING FUEL... (HOLD TRIGGER)' : 'PRESS & HOLD TRIGGER TO DISPENSE'}</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Keep holding or click & hold. Motor hums, counter rolls until target reached.
              </p>
            </div>
          )}

          {step === 'auto_cutoff' && (
            <button
              onClick={() => {
                soundEngine.playNozzleClack();
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Remove Nozzle & Tighten Fuel Cap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 'return_nozzle' && (
            <button
              onClick={() => {
                soundEngine.playNozzleClack();
                onNextStep();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 flex items-center justify-center space-x-2 transition"
            >
              <span>Restow Nozzle in Pump Holster</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {step === 'completed' && (
            <div className="space-y-2">
              <button
                onClick={onOpenReceipt}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Official Station Receipt</span>
              </button>
              <button
                onClick={onReset}
                className="w-full py-2 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Start Another Vehicle Refueling
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
