import React from 'react';
import { 
  Fuel, 
  Layers, 
  Calculator, 
  Cylinder, 
  BadgePercent, 
  Navigation, 
  Receipt, 
  ShieldAlert,
  Flame,
  Globe
} from 'lucide-react';
import { ActiveTab, FuelProduct } from '../types/petrol';
import { soundEngine } from '../utils/audioSynthesizer';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  fuels: FuelProduct[];
  currencySymbol: string;
  onChangeCurrency: (symbol: string) => void;
  stationName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  fuels,
  currencySymbol,
  onChangeCurrency,
  stationName = 'DIL FARAZ PETROLEUM'
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'simulator', label: '3D Dispenser & How-To', icon: Fuel },
    { id: 'meter_shift', label: 'Shift Settlement', icon: Calculator },
    { id: 'tank_dip', label: 'Tank Dip & Stock', icon: Cylinder },
    { id: 'pricing_profit', label: 'Rates & Profit', icon: BadgePercent },
    { id: 'trip_mileage', label: 'Mileage & Trip', icon: Navigation },
    { id: 'receipts', label: 'Invoice & Receipt', icon: Receipt },
    { id: 'safety', label: 'Safety SOPs', icon: ShieldAlert }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md text-white select-none">
      
      {/* Top Brand & Live Rates Marquee Bar */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Brand Crest */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-600 to-emerald-500 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wide text-white uppercase flex items-center space-x-1.5 font-sans">
                <span>{stationName}</span>
                <span className="text-[9px] bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                  LIVE
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Live Fuel Rates Badges */}
        <div className="flex items-center space-x-2 overflow-x-auto py-0.5 max-w-full">
          {fuels.map(f => (
            <div 
              key={f.id}
              className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />
              <span className="text-slate-400 font-mono">{f.code}:</span>
              <span className="font-bold text-white font-mono">{currencySymbol}{f.pricePerLitre.toFixed(2)}</span>
            </div>
          ))}

          {/* Currency Switcher */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currencySymbol}
              onChange={(e) => onChangeCurrency(e.target.value)}
              className="bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none"
            >
              <option value="₨">₨ (PKR)</option>
              <option value="$">$ (USD)</option>
              <option value="₹">₹ (INR)</option>
              <option value="د.إ">د.إ (AED)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="px-3 sm:px-4 flex items-center space-x-1 overflow-x-auto py-1.5 no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playKeyBeep(1100);
                onSelectTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 whitespace-nowrap transition cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-600/30 to-sky-600/30 text-white border border-emerald-500/50 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </header>
  );
};
