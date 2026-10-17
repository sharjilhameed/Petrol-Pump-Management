/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PetrolPumpScene } from './components/3d/PetrolPumpScene';
import { HowToUseGuide } from './components/simulator/HowToUseGuide';
import { DispenserControlDock } from './components/simulator/DispenserControlDock';
import { ExplodedComponentsList } from './components/3d/ExplodedComponentsList';
import { ShiftSettlementCalc } from './components/calculators/ShiftSettlementCalc';
import { TankDipStockCalc } from './components/calculators/TankDipStockCalc';
import { PricingMarginCalc } from './components/calculators/PricingMarginCalc';
import { MileageTripCalc } from './components/calculators/MileageTripCalc';
import { ReceiptGenerator } from './components/receipt/ReceiptGenerator';
import { SafetyGuide } from './components/safety/SafetyGuide';

import { 
  FuelProduct, 
  SimulatorStep, 
  ActiveTab, 
  ShiftRecord, 
  TankDipRecord, 
  ReceiptData 
} from './types/petrol';

import { 
  INITIAL_FUELS, 
  INITIAL_SHIFT_RECORD, 
  INITIAL_TANKS, 
  SAMPLE_RECEIPT 
} from './utils/fuelCalculations';

import { soundEngine } from './utils/audioSynthesizer';

export default function App() {
  // Global State
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₨');
  const [fuels, setFuels] = useState<FuelProduct[]>(INITIAL_FUELS);
  const [shiftRecord, setShiftRecord] = useState<ShiftRecord>(INITIAL_SHIFT_RECORD);
  const [tanks, setTanks] = useState<TankDipRecord[]>(INITIAL_TANKS);
  const [receipt, setReceipt] = useState<ReceiptData>(SAMPLE_RECEIPT);

  // 3D Simulator State
  const [selectedFuel, setSelectedFuel] = useState<FuelProduct>(INITIAL_FUELS[0]);
  const [step, setStep] = useState<SimulatorStep>('safety_check');
  const [dispensedLitres, setDispensedLitres] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [targetPreset, setTargetPreset] = useState<number>(1000); // 1000 currency or 10 Litres
  const [presetType, setPresetType] = useState<'litres' | 'amount' | 'full'>('amount');
  const [isTriggerPressed, setIsTriggerPressed] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<'station' | 'dispenser' | 'nozzle' | 'car' | 'exploded'>('station');
  const [explodedSeparation, setExplodedSeparation] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExplodedSpecsOpen, setIsExplodedSpecsOpen] = useState<boolean>(false);

  // Dispensing timer ref
  const dispensingIntervalRef = useRef<number | null>(null);

  // Step transitions
  const handleNextStep = () => {
    switch (step) {
      case 'safety_check':
        setStep('select_grade');
        setCameraPreset('dispenser');
        break;
      case 'select_grade':
        setStep('set_preset');
        setCameraPreset('dispenser');
        break;
      case 'set_preset':
        setStep('pick_nozzle');
        setCameraPreset('nozzle');
        break;
      case 'pick_nozzle':
        setStep('open_fuel_cap');
        setCameraPreset('car');
        break;
      case 'open_fuel_cap':
        setStep('insert_nozzle');
        setCameraPreset('car');
        break;
      case 'insert_nozzle':
        setStep('dispense');
        setCameraPreset('car');
        break;
      case 'dispense':
        setStep('auto_cutoff');
        break;
      case 'auto_cutoff':
        setStep('return_nozzle');
        setCameraPreset('dispenser');
        break;
      case 'return_nozzle':
        setStep('completed');
        // Update the receipt with final stats
        setReceipt(prev => ({
          ...prev,
          fuelName: selectedFuel.name,
          volumeLitres: Number(dispensedLitres.toFixed(2)),
          ratePerLitre: selectedFuel.pricePerLitre,
          totalAmount: Number(totalCost.toFixed(2)),
          dateTime: new Date().toLocaleString()
        }));
        break;
      case 'completed':
        setActiveTab('receipts');
        break;
      default:
        break;
    }
  };

  const handleResetSimulator = () => {
    if (dispensingIntervalRef.current) {
      clearInterval(dispensingIntervalRef.current);
      dispensingIntervalRef.current = null;
    }
    soundEngine.stopFuelFlowSound();
    setIsTriggerPressed(false);
    setDispensedLitres(0);
    setTotalCost(0);
    setStep('safety_check');
    setCameraPreset('station');
    setExplodedSeparation(0);
  };

  // Dispensing flow loop
  const startDispensing = () => {
    if (step !== 'dispense') return;
    setIsTriggerPressed(true);
    soundEngine.playNozzleClack();
    soundEngine.startFuelFlowSound();

    if (dispensingIntervalRef.current) clearInterval(dispensingIntervalRef.current);

    const flowRatePerSecond = 0.65; // ~39 Litres per min
    const intervalMs = 60;
    const increment = (flowRatePerSecond * intervalMs) / 1000;

    dispensingIntervalRef.current = window.setInterval(() => {
      setDispensedLitres(prevLitres => {
        const nextLitres = prevLitres + increment;
        const nextAmount = nextLitres * selectedFuel.pricePerLitre;
        setTotalCost(nextAmount);

        // Check Target Cutoff
        let reachedCutoff = false;
        if (presetType === 'litres' && nextLitres >= targetPreset) {
          reachedCutoff = true;
        } else if (presetType === 'amount' && nextAmount >= targetPreset) {
          reachedCutoff = true;
        } else if (presetType === 'full' && nextLitres >= 42.5) {
          reachedCutoff = true;
        }

        if (reachedCutoff) {
          stopDispensing();
          soundEngine.playAutoShutoffSnap();
          setStep('auto_cutoff');
        }

        return nextLitres;
      });
    }, intervalMs);
  };

  const stopDispensing = () => {
    setIsTriggerPressed(false);
    if (dispensingIntervalRef.current) {
      clearInterval(dispensingIntervalRef.current);
      dispensingIntervalRef.current = null;
    }
    soundEngine.stopFuelFlowSound();
  };

  useEffect(() => {
    return () => {
      if (dispensingIntervalRef.current) {
        clearInterval(dispensingIntervalRef.current);
      }
      soundEngine.stopFuelFlowSound();
    };
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* Top Station Navigation & Marquee Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        fuels={fuels}
        currencySymbol={currencySymbol}
        onChangeCurrency={setCurrencySymbol}
        stationName="DIL FARAZ PETROLEUM"
      />

      {/* Main Body Content */}
      <main className="relative flex-1 w-full h-[calc(100vh-88px)] overflow-hidden">
        
        {/* TAB 1: 3D Petrol Pump Simulator & How-To Guide */}
        {activeTab === 'simulator' && (
          <div className="relative w-full h-full">
            
            {/* Three.js Canvas Scene */}
            <PetrolPumpScene
              currentFuel={selectedFuel}
              step={step}
              dispensedLitres={dispensedLitres}
              totalCost={totalCost}
              isTriggerPressed={isTriggerPressed}
              cameraPreset={cameraPreset}
              explodedSeparation={explodedSeparation}
              stationName="DIL FARAZ PETROLEUM"
              currencySymbol={currencySymbol}
            />

            {/* Step-by-Step "How to Use" Interactive Guide Panel */}
            <HowToUseGuide
              step={step}
              currentFuel={selectedFuel}
              dispensedLitres={dispensedLitres}
              totalCost={totalCost}
              targetPreset={targetPreset}
              presetType={presetType}
              isTriggerPressed={isTriggerPressed}
              isMuted={isMuted}
              onSetMuted={(muted) => {
                setIsMuted(muted);
                soundEngine.setMuted(muted);
              }}
              onNextStep={handleNextStep}
              onReset={handleResetSimulator}
              onStartDispense={startDispensing}
              onStopDispense={stopDispensing}
              onOpenReceipt={() => setActiveTab('receipts')}
              currencySymbol={currencySymbol}
            />

            {/* Collapsible Bottom Control Dock (Three.js Skill Constitutional Directive) */}
            <DispenserControlDock
              fuels={fuels}
              selectedFuel={selectedFuel}
              onSelectFuel={(f) => {
                setSelectedFuel(f);
                if (step === 'select_grade') {
                  setStep('set_preset');
                }
              }}
              cameraPreset={cameraPreset}
              onSelectCamera={setCameraPreset}
              targetPreset={targetPreset}
              onSetTargetPreset={setTargetPreset}
              presetType={presetType}
              onSetPresetType={setPresetType}
              explodedSeparation={explodedSeparation}
              onSetExplodedSeparation={setExplodedSeparation}
              onOpenExplodedSpecs={() => setIsExplodedSpecsOpen(true)}
              currencySymbol={currencySymbol}
            />

            {/* Exploded Machine Anatomy Modal */}
            <ExplodedComponentsList
              isOpen={isExplodedSpecsOpen}
              onClose={() => setIsExplodedSpecsOpen(false)}
            />

          </div>
        )}

        {/* TAB 2: Shift Settlement & Daily Nozzle Reading */}
        {activeTab === 'meter_shift' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <ShiftSettlementCalc
              shift={shiftRecord}
              onUpdateShift={setShiftRecord}
              fuels={fuels}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 3: Tank Dip Strapping & Stock Reconciliation */}
        {activeTab === 'tank_dip' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <TankDipStockCalc
              tanks={tanks}
              onUpdateTanks={setTanks}
              fuels={fuels}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 4: Price Board & Dealer Margin Manager */}
        {activeTab === 'pricing_profit' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <PricingMarginCalc
              fuels={fuels}
              onUpdateFuels={(updated) => {
                setFuels(updated);
                const current = updated.find(f => f.id === selectedFuel.id);
                if (current) setSelectedFuel(current);
              }}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 5: Vehicle Mileage & Road Trip Planner */}
        {activeTab === 'trip_mileage' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <MileageTripCalc
              fuels={fuels}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 6: Official Station Receipt & Tax Invoice */}
        {activeTab === 'receipts' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <ReceiptGenerator
              receipt={receipt}
              onUpdateReceipt={setReceipt}
              fuels={fuels}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* TAB 7: Station Forecourt Safety SOPs */}
        {activeTab === 'safety' && (
          <div className="w-full h-full overflow-y-auto p-4 md:p-6">
            <SafetyGuide />
          </div>
        )}

      </main>
    </div>
  );
}
