export type FuelType = 'super' | 'diesel' | 'hioctane' | 'cng';

export interface FuelProduct {
  id: FuelType;
  name: string;
  code: string;
  color: string; // hex
  accentBg: string;
  pricePerLitre: number;
  costPerLitre: number;
  dealerMargin: number;
  tankCapacity: number; // litres
  currentStock: number; // litres
  unit: string;
  description: string;
}

export type SimulatorStep = 
  | 'safety_check'
  | 'select_grade'
  | 'set_preset'
  | 'pick_nozzle'
  | 'open_fuel_cap'
  | 'insert_nozzle'
  | 'dispense'
  | 'auto_cutoff'
  | 'return_nozzle'
  | 'completed';

export interface NozzleReading {
  nozzleId: string;
  pumpNumber: number;
  fuelType: FuelType;
  openingReading: number;
  closingReading: number;
  testingLitres: number;
}

export interface ShiftRecord {
  id: string;
  stationName: string;
  shiftType: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)';
  date: string;
  cashierName: string;
  managerName: string;
  readings: NozzleReading[];
  cashCollected: number;
  cardPayments: number;
  creditFleetAmount: number;
  digitalPayments: number;
  expenses: number;
  notes: string;
}

export interface TankDipRecord {
  tankId: string;
  tankName: string;
  fuelType: FuelType;
  capacityLitres: number;
  diameterCm: number;
  lengthCm: number;
  dipReadingCm: number;
  waterDipMm: number;
  bookStockLitres: number;
  temperatureC: number;
}

export interface ReceiptData {
  receiptNo: string;
  stationName: string;
  branch: string;
  dateTime: string;
  pumpNo: number;
  nozzleNo: number;
  fuelName: string;
  volumeLitres: number;
  ratePerLitre: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Credit/Debit Card' | 'Fleet Fuel Card' | 'Digital Wallet';
  vehiclePlate: string;
  cashier: string;
  taxAmount: number;
}

export type ActiveTab = 
  | 'simulator'
  | 'meter_shift'
  | 'tank_dip'
  | 'pricing_profit'
  | 'trip_mileage'
  | 'receipts'
  | 'safety';
