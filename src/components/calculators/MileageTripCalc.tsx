import React, { useState } from 'react';
import { 
  Navigation, 
  Car, 
  Users, 
  Fuel, 
  MapPin, 
  DollarSign, 
  Percent, 
  Gauge,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { FuelProduct } from '../../types/petrol';
import { calculateTripFuel } from '../../utils/fuelCalculations';

interface MileageTripCalcProps {
  fuels: FuelProduct[];
  currencySymbol: string;
}

export const MileageTripCalc: React.FC<MileageTripCalcProps> = ({ fuels, currencySymbol }) => {
  const [distanceKm, setDistanceKm] = useState<number>(340); // e.g. Lahore to Islamabad
  const [fuelEfficiency, setFuelEfficiency] = useState<number>(14.5); // km/L
  const [selectedFuelId, setSelectedFuelId] = useState<string>('super');
  const [passengers, setPassengers] = useState<number>(3);
  const [tankCapacityL, setTankCapacityL] = useState<number>(45); // Standard sedan tank

  const currentFuel = fuels.find(f => f.id === selectedFuelId) || fuels[0];

  const results = calculateTripFuel({
    distanceKm,
    fuelEfficiencyKmPerL: fuelEfficiency,
    fuelPricePerLitre: currentFuel.pricePerLitre,
    passengers,
    tankCapacityL
  });

  return (
    <div className="space-y-6 text-white max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center space-x-3">
        <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
          <Navigation className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Vehicle Mileage & Trip Fuel Cost Planner</h2>
          <p className="text-xs text-slate-400">
            Calculate exact fuel consumption, total road trip budget, cost per kilometer and passenger fare splits
          </p>
        </div>
      </div>

      {/* Inputs & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters (Left) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Car className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Vehicle & Route Parameters</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Trip Distance */}
            <div>
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">One-Way / Total Distance (km)</label>
                <span className="font-mono font-bold text-sky-400">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min={10}
                max={2500}
                step={10}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full mt-1.5 accent-sky-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>10 km (City)</span>
                <span>350 km (Motorway)</span>
                <span>2,500 km (Cross Country)</span>
              </div>
            </div>

            {/* Fuel Efficiency */}
            <div>
              <div className="flex justify-between">
                <label className="text-slate-300 font-medium">Vehicle Mileage / Fuel Average</label>
                <span className="font-mono font-bold text-emerald-400">{fuelEfficiency} km / Litre</span>
              </div>
              <input
                type="range"
                min={4}
                max={30}
                step={0.5}
                value={fuelEfficiency}
                onChange={(e) => setFuelEfficiency(Number(e.target.value))}
                className="w-full mt-1.5 accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>6 km/L (Heavy SUV)</span>
                <span>14 km/L (Sedan)</span>
                <span>25 km/L (Hybrid/Bike)</span>
              </div>
            </div>

            {/* Fuel Type Selector */}
            <div>
              <label className="text-slate-300 font-medium">Fuel Grade Used</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {fuels.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFuelId(f.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition ${
                      selectedFuelId === f.id 
                        ? 'border-sky-500 bg-sky-500/10 text-white ring-1 ring-sky-500/30' 
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold truncate">{f.name}</div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      {currencySymbol} {f.pricePerLitre.toFixed(2)}/L
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Passengers & Tank Capacity */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-slate-300 font-medium">Passengers (Car Pool)</label>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={passengers}
                    onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Fuel Tank Size (L)</label>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={tankCapacityL}
                    onChange={(e) => setTankCapacityL(Math.max(5, parseInt(e.target.value) || 45))}
                    className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Results Showcase (Right) */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Hero Trip Total Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Estimated Trip Total Cost</div>
            <div className="text-4xl font-bold font-mono text-emerald-400">
              {currencySymbol} {results.totalCost.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <span>Required Fuel:</span>
              <strong className="text-sky-400 font-mono text-sm">{results.litresNeeded} Litres</strong>
            </div>

            {/* Split Fare Indicator */}
            {passengers > 1 && (
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Split Fare per Passenger ({passengers} travelers):</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {currencySymbol} {results.costPerPassenger.toLocaleString()} / person
                </span>
              </div>
            )}
          </div>

          {/* Efficiency Breakdown Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] text-slate-400">Cost per Kilometer</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {currencySymbol} {results.costPerKm} <span className="text-xs font-normal text-slate-400">/ km</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Running cost baseline</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] text-slate-400">Max Range on Full Tank</div>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                {results.rangeOnFullTank} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Before tank reaches empty</div>
            </div>
          </div>

          {/* Tank Capacity Requirement Gauge */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Tank Fill Percentage Needed</span>
              <span className="font-mono font-bold text-amber-400">
                {results.tankFillPercentage}% of Tank ({tankCapacityL}L)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  results.tankFillPercentage > 100 
                    ? 'bg-rose-500' 
                    : results.tankFillPercentage > 75 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, results.tankFillPercentage)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {results.tankFillPercentage > 100 
                ? `You will need at least ${Math.ceil(results.tankFillPercentage / 100)} refuels on this trip.` 
                : 'A single full tank is sufficient to reach your destination without stopping.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
