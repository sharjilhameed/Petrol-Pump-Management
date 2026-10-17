import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Coins,
  Receipt,
  Download
} from 'lucide-react';
import { ShiftRecord, FuelProduct, NozzleReading } from '../../types/petrol';
import { calculateShiftSummary } from '../../utils/fuelCalculations';

interface ShiftSettlementCalcProps {
  shift: ShiftRecord;
  onUpdateShift: (shift: ShiftRecord) => void;
  fuels: FuelProduct[];
  currencySymbol: string;
}

export const ShiftSettlementCalc: React.FC<ShiftSettlementCalcProps> = ({
  shift,
  onUpdateShift,
  fuels,
  currencySymbol
}) => {
  const summary = calculateShiftSummary(shift, fuels);

  const handleNozzleChange = (index: number, field: keyof NozzleReading, value: number | string) => {
    const updatedReadings = [...shift.readings];
    updatedReadings[index] = {
      ...updatedReadings[index],
      [field]: value
    };
    onUpdateShift({
      ...shift,
      readings: updatedReadings
    });
  };

  const addNozzle = () => {
    const newNozzle: NozzleReading = {
      nozzleId: `N${shift.readings.length + 1}`,
      pumpNumber: Math.ceil((shift.readings.length + 1) / 2),
      fuelType: 'super',
      openingReading: 0,
      closingReading: 0,
      testingLitres: 5
    };
    onUpdateShift({
      ...shift,
      readings: [...shift.readings, newNozzle]
    });
  };

  const removeNozzle = (index: number) => {
    if (shift.readings.length <= 1) return;
    const updated = shift.readings.filter((_, i) => i !== index);
    onUpdateShift({
      ...shift,
      readings: updated
    });
  };

  const printShiftReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto pb-12">
      
      {/* Top Banner & Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Daily Shift & Nozzle Meter Settlement</span>
              </h2>
              <p className="text-xs text-slate-400">
                Opening vs Closing electronic totalizer readings, cash collections & shortage reconciliation
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">Station:</span> <strong className="text-white ml-1">{shift.stationName}</strong>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">Date:</span> <strong className="text-white ml-1">{shift.date}</strong>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-400">Shift:</span> <strong className="text-white ml-1">{shift.shiftType}</strong>
          </div>
          <button
            onClick={printShiftReport}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export / Print</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400">Total Fuel Dispensed</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
            {summary.totalLitresSold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">Litres</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all active nozzles</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400">Gross Sales Value</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {currencySymbol} {summary.totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Calculated from net meter readings</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="text-xs text-slate-400">Total Money Collected</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {currencySymbol} {summary.totalPaymentsReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cash + Cards + Fleet + Digital</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-lg ${
          summary.isBalanced 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
            : summary.difference < 0 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
              : 'bg-blue-950/20 border-blue-500/30 text-blue-300'
        }`}>
          <div className="text-xs font-semibold flex items-center justify-between">
            <span>Shift Balance Status</span>
            {summary.isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : summary.difference < 0 ? (
              <ArrowDownCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <ArrowUpCircle className="w-4 h-4 text-blue-400" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono mt-1">
            {summary.isBalanced 
              ? 'PERFECT BALANCE' 
              : `${summary.difference < 0 ? '-' : '+'}${currencySymbol} ${Math.abs(summary.difference).toLocaleString()}`}
          </div>
          <div className="text-[11px] mt-1">
            {summary.isBalanced 
              ? 'Collections match meter sales' 
              : summary.difference < 0 
                ? 'Cash Shortage to be recovered from cashier' 
                : 'Cash Surplus recorded'}
          </div>
        </div>
      </div>

      {/* Nozzle Totalizer Readings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Nozzle Totalizer Meter Log (Electronic Counter)</h3>
          </div>
          <button
            onClick={addNozzle}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-1 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Nozzle</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Nozzle / Pump</th>
                <th className="py-3 px-4">Fuel Product</th>
                <th className="py-3 px-4 text-right">Opening Meter</th>
                <th className="py-3 px-4 text-right">Closing Meter</th>
                <th className="py-3 px-4 text-right">Testing (L)</th>
                <th className="py-3 px-4 text-right">Net Litres Sold</th>
                <th className="py-3 px-4 text-right">Rate / L</th>
                <th className="py-3 px-4 text-right">Sale Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {summary.nozzleBreakdowns.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {item.nozzleId} (Pump #{item.pumpNumber})
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={item.fuelType}
                      onChange={(e) => handleNozzleChange(idx, 'fuelType', e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                    >
                      {fuels.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={item.openingReading}
                      onChange={(e) => handleNozzleChange(idx, 'openingReading', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-slate-950 border border-slate-700 text-right px-2 py-1 rounded text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={item.closingReading}
                      onChange={(e) => handleNozzleChange(idx, 'closingReading', parseFloat(e.target.value) || 0)}
                      className="w-24 bg-slate-950 border border-slate-700 text-right px-2 py-1 rounded text-white font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      step="0.01"
                      value={item.testingLitres}
                      onChange={(e) => handleNozzleChange(idx, 'testingLitres', parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-950 border border-slate-700 text-right px-2 py-1 rounded text-slate-300 font-mono text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sky-400">
                    {item.netLitres.toFixed(2)} L
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {currencySymbol} {item.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {currencySymbol} {item.saleAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => removeNozzle(idx)}
                      disabled={shift.readings.length <= 1}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Collections Breakdown & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Collections */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Payment Collections by Tender Type</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300">Physical Cash Handover</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={shift.cashCollected}
                  onChange={(e) => onUpdateShift({ ...shift, cashCollected: parseFloat(e.target.value) || 0 })}
                  className="w-36 bg-slate-950 border border-slate-700 text-right px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-slate-300">Credit / Debit Card POS Receipts</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={shift.cardPayments}
                  onChange={(e) => onUpdateShift({ ...shift, cardPayments: parseFloat(e.target.value) || 0 })}
                  className="w-36 bg-slate-950 border border-slate-700 text-right px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-slate-300">Fleet Account & Credit Customers</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={shift.creditFleetAmount}
                  onChange={(e) => onUpdateShift({ ...shift, creditFleetAmount: parseFloat(e.target.value) || 0 })}
                  className="w-36 bg-slate-950 border border-slate-700 text-right px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-slate-300">Digital QR / Mobile Wallet</label>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={shift.digitalPayments}
                  onChange={(e) => onUpdateShift({ ...shift, digitalPayments: parseFloat(e.target.value) || 0 })}
                  className="w-36 bg-slate-950 border border-slate-700 text-right px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-white">Total Payments Accounted:</span>
              <span className="font-mono text-amber-400">
                {currencySymbol} {summary.totalPaymentsReceived.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses & Sign-off Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Shift Expenses & Sign-off Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300 font-medium">Station Shift Expenses</label>
                <p className="text-[11px] text-slate-500">Generator fuel, petty cash, food, maintenance</p>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-slate-500">{currencySymbol}</span>
                <input
                  type="number"
                  value={shift.expenses}
                  onChange={(e) => onUpdateShift({ ...shift, expenses: parseFloat(e.target.value) || 0 })}
                  className="w-36 bg-slate-950 border border-slate-700 text-right px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-400 text-[11px]">Cashier / Operator</label>
                <input
                  type="text"
                  value={shift.cashierName}
                  onChange={(e) => onUpdateShift({ ...shift, cashierName: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px]">Station Manager</label>
                <input
                  type="text"
                  value={shift.managerName}
                  onChange={(e) => onUpdateShift({ ...shift, managerName: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px]">Shift Handover Log & Observations</label>
              <textarea
                rows={2}
                value={shift.notes}
                onChange={(e) => onUpdateShift({ ...shift, notes: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 p-2 rounded-lg text-slate-200 text-xs focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
