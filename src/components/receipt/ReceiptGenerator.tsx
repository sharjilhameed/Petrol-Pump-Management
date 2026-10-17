import React, { useState } from 'react';
import { 
  Receipt, 
  Printer, 
  Download, 
  CheckCircle2, 
  Car, 
  QrCode, 
  Fuel, 
  CreditCard,
  Building,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import { ReceiptData, FuelProduct } from '../../types/petrol';
import { soundEngine } from '../../utils/audioSynthesizer';

interface ReceiptGeneratorProps {
  receipt: ReceiptData;
  onUpdateReceipt: (receipt: ReceiptData) => void;
  fuels: FuelProduct[];
  currencySymbol: string;
}

export const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  receipt,
  onUpdateReceipt,
  fuels,
  currencySymbol
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    soundEngine.playKeyBeep(1200);
    window.print();
  };

  const handleFieldChange = (field: keyof ReceiptData, val: any) => {
    onUpdateReceipt({
      ...receipt,
      [field]: val
    });
  };

  return (
    <div className="space-y-6 text-white max-w-4xl mx-auto pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Receipt className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white">Digital Fuel Receipt & Tax Invoice</h2>
            <p className="text-xs text-slate-400">
              Generate, customize, and print official fuel sales invoice for Dil Faraz Petroleum
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/40 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Thermal Receipt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Editor Form (Left) */}
        <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
            Customize Transaction Data
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400">Station Header</label>
              <input
                type="text"
                value={receipt.stationName}
                onChange={(e) => handleFieldChange('stationName', e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400">Station Branch / Highway Bay</label>
              <input
                type="text"
                value={receipt.branch}
                onChange={(e) => handleFieldChange('branch', e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Pump & Nozzle #</label>
                <div className="flex space-x-2 mt-1">
                  <input
                    type="number"
                    value={receipt.pumpNo}
                    onChange={(e) => handleFieldChange('pumpNo', parseInt(e.target.value) || 1)}
                    className="w-1/2 bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white text-xs"
                    placeholder="Pump"
                  />
                  <input
                    type="number"
                    value={receipt.nozzleNo}
                    onChange={(e) => handleFieldChange('nozzleNo', parseInt(e.target.value) || 1)}
                    className="w-1/2 bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white text-xs"
                    placeholder="Nozzle"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Vehicle Plate #</label>
                <input
                  type="text"
                  value={receipt.vehiclePlate}
                  onChange={(e) => handleFieldChange('vehiclePlate', e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs font-mono uppercase focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Volume Dispensed (L)</label>
                <input
                  type="number"
                  step="0.01"
                  value={receipt.volumeLitres}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value) || 0;
                    handleFieldChange('volumeLitres', vol);
                    handleFieldChange('totalAmount', Number((vol * receipt.ratePerLitre).toFixed(2)));
                  }}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400">Rate / Litre ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={receipt.ratePerLitre}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    handleFieldChange('ratePerLitre', rate);
                    handleFieldChange('totalAmount', Number((receipt.volumeLitres * rate).toFixed(2)));
                  }}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400">Payment Tender</label>
              <select
                value={receipt.paymentMethod}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs focus:outline-none"
              >
                <option value="Cash">Cash Currency</option>
                <option value="Credit/Debit Card">Credit/Debit Card (POS)</option>
                <option value="Fleet Fuel Card">Fleet Account Fuel Card</option>
                <option value="Digital Wallet">Digital Mobile Wallet (QR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Paper Thermal Receipt Preview (Right) */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-[340px] bg-white text-slate-900 rounded-xl p-6 shadow-2xl font-mono text-xs border border-slate-300 relative print:shadow-none print:border-none print:w-full">
            
            {/* Serrated Top Edge */}
            <div className="text-center border-b border-dashed border-slate-400 pb-4">
              <h2 className="text-base font-black tracking-wider uppercase">{receipt.stationName}</h2>
              <p className="text-[11px] text-slate-600 mt-0.5">{receipt.branch}</p>
              <p className="text-[10px] text-slate-500 font-sans">NTN: PK-DFP-884920-A • POS #01</p>
              <p className="text-[10px] text-slate-500 font-sans">Helpline: +92 (042) 555-PETROL</p>
            </div>

            {/* Transaction meta */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{receipt.dateTime}</span>
              </div>
              <div className="flex justify-between">
                <span>PUMP / NOZZLE:</span>
                <span>PUMP #{receipt.pumpNo} / NZ #{receipt.nozzleNo}</span>
              </div>
              <div className="flex justify-between">
                <span>VEHICLE REG:</span>
                <span className="font-bold">{receipt.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span>ATTENDANT:</span>
                <span>{receipt.cashier}</span>
              </div>
            </div>

            {/* Fuel Itemized Line */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5">
              <div className="font-bold text-xs uppercase">{receipt.fuelName}</div>
              <div className="flex justify-between text-slate-700">
                <span>{receipt.volumeLitres.toFixed(2)} Litres @ {currencySymbol}{receipt.ratePerLitre.toFixed(2)}</span>
                <span className="font-bold text-slate-900">{currencySymbol} {receipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between text-sm font-black">
                <span>TOTAL PAID:</span>
                <span>{currencySymbol} {receipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Tender Type:</span>
                <span>{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Tax & PDL Levy:</span>
                <span>INCLUDED IN FUEL PRICE</span>
              </div>
            </div>

            {/* Barcode / QR Section */}
            <div className="pt-4 text-center space-y-2">
              <div className="inline-block p-1.5 bg-slate-100 border border-slate-300 rounded">
                <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                VERIFIED TRANSACTION • SCAN TO VALIDATE
              </p>
              <p className="text-[10px] text-slate-700 italic font-sans font-medium">
                Thank you for refueling at Dil Faraz Petroleum! Have a safe journey.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
