import React, { useState } from 'react';
import { 
  BadgePercent, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  Save, 
  RefreshCw, 
  Check, 
  Sparkles,
  Building2,
  PieChart
} from 'lucide-react';
import { FuelProduct } from '../../types/petrol';
import { soundEngine } from '../../utils/audioSynthesizer';

interface PricingMarginCalcProps {
  fuels: FuelProduct[];
  onUpdateFuels: (fuels: FuelProduct[]) => void;
  currencySymbol: string;
}

export const PricingMarginCalc: React.FC<PricingMarginCalcProps> = ({
  fuels,
  onUpdateFuels,
  currencySymbol
}) => {
  const [localFuels, setLocalFuels] = useState<FuelProduct[]>(fuels);
  const [dailySalesVolumeL, setDailySalesVolumeL] = useState<number>(18000);
  const [dailyOverheads, setDailyOverheads] = useState<number>(35000); // Staff, electricity, diesel generator, maintenance
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handlePriceChange = (id: string, field: keyof FuelProduct, val: number) => {
    setLocalFuels(prev => prev.map(f => {
      if (f.id === id) {
        const updated = { ...f, [field]: val };
        // If price or cost updated, recalculate dealer margin
        if (field === 'pricePerLitre' || field === 'costPerLitre') {
          updated.dealerMargin = Number((updated.pricePerLitre - updated.costPerLitre).toFixed(2));
        }
        return updated;
      }
      return f;
    }));
  };

  const saveAndSync = () => {
    soundEngine.playKeyBeep(1400);
    onUpdateFuels(localFuels);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Profit calculations
  const weightedDealerMargin = localFuels.reduce((acc, f) => acc + f.dealerMargin, 0) / localFuels.length;
  const estimatedDailyGrossProfit = dailySalesVolumeL * weightedDealerMargin;
  const estimatedDailyNetProfit = estimatedDailyGrossProfit - dailyOverheads;
  const estimatedMonthlyNetProfit = estimatedDailyNetProfit * 30;
  const estimatedYearlyNetProfit = estimatedMonthlyNetProfit * 12;

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BadgePercent className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">Fuel Rates & Dealer Profit Margin Manager</h2>
            <p className="text-xs text-slate-400">
              Manage live retail price boards, dealer commissions per litre, and forecourt revenue forecasting
            </p>
          </div>
        </div>

        <button
          onClick={saveAndSync}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40 transition"
        >
          {isSavedNotice ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Synced to 3D Totem & Pumps!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Sync to 3D Totem Board</span>
            </>
          )}
        </button>
      </div>

      {/* Fuel Product Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {localFuels.map(fuel => (
          <div 
            key={fuel.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-4 relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: fuel.color }}
            />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{fuel.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono uppercase">{fuel.code}</span>
              </div>
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: fuel.color }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px]">Retail Selling Price / L</label>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-slate-500 font-mono">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.10"
                    value={fuel.pricePerLitre}
                    onChange={(e) => handlePriceChange(fuel.id, 'pricePerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px]">Wholesale Cost / L (Refinery)</label>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-slate-500 font-mono">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.10"
                    value={fuel.costPerLitre}
                    onChange={(e) => handlePriceChange(fuel.id, 'costPerLitre', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Dealer Margin / L:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {currencySymbol} {fuel.dealerMargin.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Forecourt Profit Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Station Net Profit Forecast Calculator</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            Dil Faraz Petroleum Forecourt Model
          </span>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Average Daily Station Sales Volume</span>
              </label>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {dailySalesVolumeL.toLocaleString()} Litres / Day
              </span>
            </div>
            <input
              type="range"
              min={2000}
              max={60000}
              step={500}
              value={dailySalesVolumeL}
              onChange={(e) => setDailySalesVolumeL(parseInt(e.target.value))}
              className="w-full accent-sky-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2,000 L</span>
              <span>20,000 L (Average)</span>
              <span>60,000 L (High Traffic)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Daily Station Operational Overheads</span>
              </label>
              <span className="font-mono font-bold text-rose-400 text-sm">
                {currencySymbol} {dailyOverheads.toLocaleString()} / Day
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={120000}
              step={1000}
              value={dailyOverheads}
              onChange={(e) => setDailyOverheads(parseInt(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>{currencySymbol} 5,000</span>
              <span>Staff, Diesel Gen, Taxes</span>
              <span>{currencySymbol} 120,000</span>
            </div>
          </div>
        </div>

        {/* Forecast Output Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Daily Net Dealer Profit</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${estimatedDailyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currencySymbol} {estimatedDailyNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              After deducting operational expenses
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Monthly Net Dealer Profit</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${estimatedMonthlyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currencySymbol} {estimatedMonthlyNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Estimated 30-day billing cycle
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400">Annual Net Dealer Earnings</div>
            <div className={`text-2xl font-bold font-mono mt-1 ${estimatedYearlyNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currencySymbol} {estimatedYearlyNetProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Annualized commercial return
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
