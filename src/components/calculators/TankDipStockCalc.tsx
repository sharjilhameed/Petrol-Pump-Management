import React, { useState } from 'react';
import { 
  Cylinder, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  Gauge, 
  Truck,
  Layers
} from 'lucide-react';
import { TankDipRecord, FuelProduct } from '../../types/petrol';
import { calculateHorizontalTankVolume, calculateTemperatureCorrection } from '../../utils/fuelCalculations';

interface TankDipStockCalcProps {
  tanks: TankDipRecord[];
  onUpdateTanks: (tanks: TankDipRecord[]) => void;
  fuels: FuelProduct[];
  currencySymbol: string;
}

export const TankDipStockCalc: React.FC<TankDipStockCalcProps> = ({
  tanks,
  onUpdateTanks,
  fuels,
  currencySymbol
}) => {
  const [selectedTankId, setSelectedTankId] = useState(tanks[0]?.tankId || 'TK-01');

  const selectedTank = tanks.find(t => t.tankId === selectedTankId) || tanks[0];
  const fuel = fuels.find(f => f.id === selectedTank.fuelType) || fuels[0];

  const handleTankChange = (field: keyof TankDipRecord, val: number | string) => {
    const updated = tanks.map(t => {
      if (t.tankId === selectedTankId) {
        return {
          ...t,
          [field]: val
        };
      }
      return t;
    });
    onUpdateTanks(updated);
  };

  // Calculations for current tank
  const physicalVolume = calculateHorizontalTankVolume(
    selectedTank.dipReadingCm,
    selectedTank.diameterCm,
    selectedTank.lengthCm
  );

  const tempCorrectedVolume = calculateTemperatureCorrection(
    physicalVolume,
    selectedTank.temperatureC,
    selectedTank.fuelType
  );

  const fillPercentage = Math.min(100, (physicalVolume / selectedTank.capacityLitres) * 100);
  const ullageLitres = Math.max(0, selectedTank.capacityLitres - physicalVolume);
  const varianceLitres = physicalVolume - selectedTank.bookStockLitres;
  const variancePercentage = (varianceLitres / Math.max(1, selectedTank.bookStockLitres)) * 100;
  const varianceValue = varianceLitres * fuel.pricePerLitre;

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cylinder className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">Underground Tank Dip & Stock Reconciliation</h2>
            <p className="text-xs text-slate-400">
              Dip rod height strapping chart, cylindrical geometry, water paste detection & evaporation audit
            </p>
          </div>
        </div>

        {/* Tank Switcher Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          {tanks.map(t => {
            const isSelected = t.tankId === selectedTankId;
            return (
              <button
                key={t.tankId}
                onClick={() => setSelectedTankId(t.tankId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected 
                    ? 'bg-sky-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {t.tankName.split(' ')[0]} {t.tankName.split(' ')[1]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Tank Cutaway Gauge */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">{selectedTank.tankName}</h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {fuel.name} ({fuel.code})
              </span>
            </div>
            <span 
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono"
              style={{ backgroundColor: `${fuel.color}25`, color: fuel.color }}
            >
              {fuel.code}
            </span>
          </div>

          {/* Graphical Tank Cross-Section */}
          <div className="relative w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-end p-4">
            
            {/* Dip Rod Visual */}
            <div className="absolute top-2 right-8 w-2 h-[88%] bg-amber-400/80 rounded-full shadow-lg z-10 flex flex-col justify-between py-1 items-center">
              <span className="text-[9px] text-slate-950 font-mono font-bold">{selectedTank.diameterCm}cm</span>
              <span className="text-[9px] text-slate-950 font-mono font-bold">0cm</span>
            </div>

            {/* Empty Ullage Zone */}
            <div className="text-right pr-10 text-[11px] font-mono text-slate-500 mb-auto pt-2">
              Ullage Space: <strong className="text-slate-300">{ullageLitres.toLocaleString()} L</strong>
            </div>

            {/* Liquid Fill Level */}
            <div 
              className="absolute left-0 right-0 bottom-0 transition-all duration-500 rounded-b-2xl border-t-2"
              style={{ 
                height: `${fillPercentage}%`,
                backgroundColor: `${fuel.color}35`,
                borderColor: fuel.color
              }}
            >
              {/* Waves effect line */}
              <div 
                className="w-full h-1 opacity-70"
                style={{ backgroundColor: fuel.color }}
              />

              {/* Water Layer Indicator at Bottom (if detected) */}
              {selectedTank.waterDipMm > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-rose-600/60 border-t border-rose-400 flex items-center justify-center">
                  <span className="text-[10px] text-rose-200 font-bold tracking-wider uppercase">
                    Water Ingress: {selectedTank.waterDipMm} mm
                  </span>
                </div>
              )}
            </div>

            {/* Overlay readout */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <div className="text-xs text-slate-400">Physical Stock</div>
                <div className="text-3xl font-bold font-mono text-white mt-0.5">
                  {physicalVolume.toLocaleString()} <span className="text-sm font-normal text-slate-400">L</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Tank Capacity</div>
                <div className="text-base font-bold font-mono text-slate-300">
                  {fillPercentage.toFixed(1)}% Full
                </div>
              </div>
            </div>
          </div>

          {/* Dip Rod Slider Control */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span>Dip Rod Reading (Fuel Depth)</span>
              </label>
              <span className="font-mono text-base font-bold text-sky-400">
                {selectedTank.dipReadingCm} cm / {selectedTank.diameterCm} cm
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={selectedTank.diameterCm}
              step={0.5}
              value={selectedTank.dipReadingCm}
              onChange={(e) => handleTankChange('dipReadingCm', parseFloat(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 cm (Empty)</span>
              <span>Halfway: {Math.round(selectedTank.diameterCm / 2)} cm</span>
              <span>Full: {selectedTank.diameterCm} cm</span>
            </div>
          </div>

          {/* Water Paste Detection */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 flex items-center space-x-1.5">
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                <span>Kolor Kut Water Finding Paste</span>
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={selectedTank.waterDipMm}
                  onChange={(e) => handleTankChange('waterDipMm', parseFloat(e.target.value) || 0)}
                  className="w-16 bg-slate-900 border border-slate-700 text-right px-2 py-1 rounded text-white font-mono text-xs focus:outline-none"
                />
                <span className="text-xs text-slate-400">mm</span>
              </div>
            </div>
            {selectedTank.waterDipMm > 0 ? (
              <div className="text-[11px] text-rose-400 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Water detected! Perform suction drainage immediately to avoid engine contamination.</span>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Zero water detected. Underground seal is optimal.</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Physical vs Book Audit & Bows Ordering */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Variance & Audit Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Daily Tank Stock Variance Audit</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Temp: {selectedTank.temperatureC}°C
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Book Stock (System)</div>
                <div className="text-lg font-bold font-mono text-slate-200 mt-1">
                  {selectedTank.bookStockLitres.toLocaleString()} L
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Opening + Inward - Sales</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Physical Dip Stock</div>
                <div className="text-lg font-bold font-mono text-sky-400 mt-1">
                  {physicalVolume.toLocaleString()} L
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Calculated by dip strapping</div>
              </div>

              <div className={`p-3 rounded-xl border ${
                Math.abs(varianceLitres) < 50 
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                  : varianceLitres < 0 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                    : 'bg-blue-950/20 border-blue-500/30 text-blue-300'
              }`}>
                <div className="text-[11px] font-semibold flex items-center justify-between">
                  <span>Stock Variance</span>
                  {varianceLitres < 0 ? <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-lg font-bold font-mono mt-1">
                  {varianceLitres > 0 ? '+' : ''}{varianceLitres.toLocaleString()} L
                </div>
                <div className="text-[10px] mt-0.5">
                  {variancePercentage.toFixed(2)}% ({currencySymbol} {Math.abs(Math.round(varianceValue)).toLocaleString()})
                </div>
              </div>
            </div>

            {/* Editable Book Stock & Temperature */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <label className="text-slate-400">Update Book Stock (Litres)</label>
                <input
                  type="number"
                  value={selectedTank.bookStockLitres}
                  onChange={(e) => handleTankChange('bookStockLitres', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Fuel Temperature (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={selectedTank.temperatureC}
                  onChange={(e) => handleTankChange('temperatureC', parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start space-x-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
              <span>
                Standard industry evaporation and temperature shrinkage allowance is <strong>±0.5%</strong>. 
                Corrected volume at 20°C standard reference: <strong>{tempCorrectedVolume.toLocaleString()} Litres</strong>.
              </span>
            </div>
          </div>

          {/* Tanker Bowser Ordering & Safe Ullage */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Truck className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Fuel Delivery & Tanker Indent Planning</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Available Safe Ullage Space</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {ullageLitres.toLocaleString()} Litres
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Maximum volume you can safely decant without risk of subterranean tank overflow.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400">Recommended Tanker Order</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {ullageLitres >= 40000 
                    ? '40,000L Semi-Trailer' 
                    : ullageLitres >= 20000 
                      ? '20,000L Rigid Bowser' 
                      : ullageLitres >= 10000 
                        ? '10,000L Chamber Decant' 
                        : 'Sufficient Stock (Hold Order)'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Estimated refill cost: {currencySymbol} {(Math.min(ullageLitres, 20000) * fuel.costPerLitre).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
