import { FuelType, FuelProduct, ShiftRecord, TankDipRecord, ReceiptData } from '../types/petrol';

export const INITIAL_FUELS: FuelProduct[] = [
  {
    id: 'super',
    name: 'Super Unleaded 92',
    code: 'PMS-92',
    color: '#10b981', // Emerald green
    accentBg: 'rgba(16, 185, 129, 0.15)',
    pricePerLitre: 268.50,
    costPerLitre: 261.20,
    dealerMargin: 7.30,
    tankCapacity: 45000,
    currentStock: 32450,
    unit: 'Litre',
    description: 'High-combustion unleaded petrol for modern EFI passenger vehicles and motorcycles.'
  },
  {
    id: 'diesel',
    name: 'High-Speed Diesel Euro-V',
    code: 'HSD-V',
    color: '#f59e0b', // Amber/Yellow
    accentBg: 'rgba(245, 158, 11, 0.15)',
    pricePerLitre: 279.80,
    costPerLitre: 271.90,
    dealerMargin: 7.90,
    tankCapacity: 50000,
    currentStock: 38900,
    unit: 'Litre',
    description: 'Ultra-low sulfur Euro-V diesel designed for commercial trucks, buses, and diesel SUVs.'
  },
  {
    id: 'hioctane',
    name: 'Hi-Octane RON-97 (HOBC)',
    code: 'RON-97',
    color: '#06b6d4', // Cyan/Sky
    accentBg: 'rgba(6, 182, 212, 0.15)',
    pricePerLitre: 308.00,
    costPerLitre: 298.50,
    dealerMargin: 9.50,
    tankCapacity: 25000,
    currentStock: 18200,
    unit: 'Litre',
    description: 'High octane premium booster for luxury sports cars, turbo engines, and high compression.'
  },
  {
    id: 'cng',
    name: 'AutoGas CNG Clean Energy',
    code: 'CNG-G',
    color: '#8b5cf6', // Violet
    accentBg: 'rgba(139, 92, 246, 0.15)',
    pricePerLitre: 215.00,
    costPerLitre: 206.00,
    dealerMargin: 9.00,
    tankCapacity: 15000,
    currentStock: 11400,
    unit: 'Kg/L',
    description: 'Compressed natural gas eco fuel option for dual-fuel taxi fleets and economy commuters.'
  }
];

export const INITIAL_SHIFT_RECORD: ShiftRecord = {
  id: 'DFP-SHIFT-2026-1017-M',
  stationName: 'Dil Faraz Petroleum',
  shiftType: 'Morning (06:00 - 14:00)',
  date: '2026-10-17',
  cashierName: 'Muhammad Faraz',
  managerName: 'Chaudhry Dil Faraz',
  readings: [
    {
      nozzleId: 'N1',
      pumpNumber: 1,
      fuelType: 'super',
      openingReading: 45820.50,
      closingReading: 47910.20,
      testingLitres: 10.00
    },
    {
      nozzleId: 'N2',
      pumpNumber: 1,
      fuelType: 'diesel',
      openingReading: 82140.00,
      closingReading: 84635.50,
      testingLitres: 10.00
    },
    {
      nozzleId: 'N3',
      pumpNumber: 2,
      fuelType: 'super',
      openingReading: 31200.10,
      closingReading: 32980.60,
      testingLitres: 10.00
    },
    {
      nozzleId: 'N4',
      pumpNumber: 2,
      fuelType: 'hioctane',
      openingReading: 14500.00,
      closingReading: 15320.40,
      testingLitres: 5.00
    }
  ],
  cashCollected: 1150000,
  cardPayments: 380450,
  creditFleetAmount: 210000,
  digitalPayments: 75000,
  expenses: 12500,
  notes: 'All 4 nozzles calibrated at 06:15 with 5L measure jar. Smooth operations.'
};

export const INITIAL_TANKS: TankDipRecord[] = [
  {
    tankId: 'TK-01',
    tankName: 'Underground Tank 1 (Super 92)',
    fuelType: 'super',
    capacityLitres: 45000,
    diameterCm: 250,
    lengthCm: 920,
    dipReadingCm: 182,
    waterDipMm: 0,
    bookStockLitres: 32600,
    temperatureC: 28.5
  },
  {
    tankId: 'TK-02',
    tankName: 'Underground Tank 2 (Diesel Euro-V)',
    fuelType: 'diesel',
    capacityLitres: 50000,
    diameterCm: 260,
    lengthCm: 950,
    dipReadingCm: 204,
    waterDipMm: 2,
    bookStockLitres: 39150,
    temperatureC: 28.0
  },
  {
    tankId: 'TK-03',
    tankName: 'Underground Tank 3 (Hi-Octane 97)',
    fuelType: 'hioctane',
    capacityLitres: 25000,
    diameterCm: 220,
    lengthCm: 660,
    dipReadingCm: 161,
    waterDipMm: 0,
    bookStockLitres: 18350,
    temperatureC: 29.0
  }
];

/**
 * Calculates volume of liquid in a horizontal cylindrical tank given dip height (h).
 * Formula:
 * Radius r = diameter / 2
 * Area of segment A = r^2 * arccos((r - h) / r) - (r - h) * sqrt(2*r*h - h^2)
 * Volume V = A * length
 * Converts cm^3 to Litres (1 L = 1000 cm^3)
 */
export function calculateHorizontalTankVolume(
  dipHeightCm: number,
  diameterCm: number,
  lengthCm: number
): number {
  if (dipHeightCm <= 0) return 0;
  if (dipHeightCm >= diameterCm) {
    // Tank is 100% full
    const radius = diameterCm / 2;
    const totalVolumeCm3 = Math.PI * radius * radius * lengthCm;
    return Math.round(totalVolumeCm3 / 1000);
  }

  const r = diameterCm / 2;
  const h = Math.min(dipHeightCm, diameterCm);

  // Cosine term clamped between -1 and 1
  const cosArg = (r - h) / r;
  const clampedCos = Math.max(-1, Math.min(1, cosArg));
  const theta = Math.acos(clampedCos);

  const segmentArea = r * r * theta - (r - h) * Math.sqrt(Math.max(0, 2 * r * h - h * h));
  const volumeCm3 = segmentArea * lengthCm;

  return Math.round(volumeCm3 / 1000);
}

/**
 * Temperature correction factor for petroleum (ASTM Table 54B approx)
 * Base reference is 15°C or 20°C
 */
export function calculateTemperatureCorrection(
  volumeLitres: number,
  temperatureC: number,
  fuelType: FuelType
): number {
  const coefficient = fuelType === 'super' || fuelType === 'hioctane' 
    ? 0.0012 
    : 0.00085; // Diesel thermal expansion is lower
  const deltaT = temperatureC - 20;
  return Math.round(volumeLitres * (1 - coefficient * deltaT));
}

/**
 * Shift reconciliation calculation
 */
export function calculateShiftSummary(shift: ShiftRecord, fuels: FuelProduct[]) {
  const fuelMap = new Map(fuels.map(f => [f.id, f]));

  let totalLitresSold = 0;
  let totalGrossRevenue = 0;

  const nozzleBreakdowns = shift.readings.map(r => {
    const fuel = fuelMap.get(r.fuelType);
    const price = fuel ? fuel.pricePerLitre : 0;
    const rawLitres = Math.max(0, r.closingReading - r.openingReading);
    const netLitres = Math.max(0, rawLitres - r.testingLitres);
    const saleAmount = netLitres * price;

    totalLitresSold += netLitres;
    totalGrossRevenue += saleAmount;

    return {
      ...r,
      rawLitres,
      netLitres,
      price,
      saleAmount,
      fuelName: fuel ? fuel.name : r.fuelType
    };
  });

  const totalPaymentsReceived = 
    shift.cashCollected + 
    shift.cardPayments + 
    shift.creditFleetAmount + 
    shift.digitalPayments;

  const netCashDue = totalGrossRevenue - shift.expenses;
  const difference = totalPaymentsReceived - netCashDue;

  return {
    nozzleBreakdowns,
    totalLitresSold,
    totalGrossRevenue,
    totalPaymentsReceived,
    netCashDue,
    difference, // positive = surplus, negative = shortage
    isBalanced: Math.abs(difference) < 10
  };
}

/**
 * Vehicle Mileage & Trip Cost Calculator
 */
export function calculateTripFuel(params: {
  distanceKm: number;
  fuelEfficiencyKmPerL: number;
  fuelPricePerLitre: number;
  passengers: number;
  tankCapacityL: number;
}) {
  const litresNeeded = params.distanceKm / Math.max(0.1, params.fuelEfficiencyKmPerL);
  const totalCost = litresNeeded * params.fuelPricePerLitre;
  const costPerKm = totalCost / Math.max(1, params.distanceKm);
  const costPerPassenger = totalCost / Math.max(1, params.passengers);
  const tankFillPercentage = (litresNeeded / Math.max(1, params.tankCapacityL)) * 100;
  const rangeOnFullTank = params.tankCapacityL * params.fuelEfficiencyKmPerL;

  return {
    litresNeeded: Number(litresNeeded.toFixed(2)),
    totalCost: Math.round(totalCost),
    costPerKm: Number(costPerKm.toFixed(2)),
    costPerPassenger: Math.round(costPerPassenger),
    tankFillPercentage: Math.min(100, Number(tankFillPercentage.toFixed(1))),
    rangeOnFullTank: Math.round(rangeOnFullTank)
  };
}

export const SAMPLE_RECEIPT: ReceiptData = {
  receiptNo: 'DFP-TX-984210',
  stationName: 'Dil Faraz Petroleum',
  branch: 'GT Highway Main Service Bay, Unit 4',
  dateTime: '2026-10-17 12:45:12',
  pumpNo: 1,
  nozzleNo: 2,
  fuelName: 'Super Unleaded 92',
  volumeLitres: 25.40,
  ratePerLitre: 268.50,
  totalAmount: 6819.90,
  paymentMethod: 'Cash',
  vehiclePlate: 'LES-26-8891',
  cashier: 'M. Faraz (Operator #03)',
  taxAmount: 0 // Fuel price inclusive of levies
};
