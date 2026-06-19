/**
 * @fileoverview Core carbon footprint calculation engine
 * Pure functions, fully typed, JSDoc documented.
 * Uses IPCC-aligned emission factors.
 */

import type {
  CarbonInput,
  CarbonResult,
  CategoryEmissions,
  EmissionHotspot,
} from "@/types";
import {
  TRANSPORT_FACTORS,
  FLIGHT_DISTANCES,
  ENERGY_FACTORS,
  HEATING_FACTORS,
  FOOD_FACTORS,
  FOOD_WASTE_FACTOR,
  SHOPPING_FACTORS,
  WATER_FACTORS,
  WASTE_FACTORS,
  GLOBAL_AVERAGES,
} from "@/constants/emissions";

// ============================================================
// INDIVIDUAL CATEGORY CALCULATORS
// ============================================================

/**
 * Calculate monthly transportation emissions in kg CO₂e
 */
export function calcTransportMonthly(input: CarbonInput["transportation"]): number {
  const weeksPerMonth = 4.33;

  // Car emissions
  const carEmissions =
    input.carKmPerWeek * weeksPerMonth * (TRANSPORT_FACTORS[input.carType] ?? 0);

  // Public transport emissions
  const publicTransportEmissions =
    input.publicTransportKmPerWeek * weeksPerMonth * TRANSPORT_FACTORS.publicBus;

  // Flight emissions (annual → monthly)
  const shortHaulFlights = Math.min(input.flightsPerYear, 6);
  const longHaulFlights = Math.max(0, input.flightsPerYear - 6);
  const flightEmissions =
    ((shortHaulFlights * FLIGHT_DISTANCES.shortHaul * TRANSPORT_FACTORS.shortHaulFlight +
      longHaulFlights * FLIGHT_DISTANCES.longHaul * TRANSPORT_FACTORS.longHaulFlight) /
      12);

  return carEmissions + publicTransportEmissions + flightEmissions;
}

/**
 * Calculate monthly energy emissions in kg CO₂e
 */
export function calcEnergyMonthly(input: CarbonInput["energy"]): number {
  // Electricity — account for renewable percentage
  const effectiveElecFactor =
    ENERGY_FACTORS.electricity * (1 - input.renewablePercentage / 100) +
    ENERGY_FACTORS.renewable * (input.renewablePercentage / 100);
  const electricityEmissions = input.electricityKwhPerMonth * effectiveElecFactor;

  // Heating (proportional to household size)
  const heatingMultiplier = HEATING_FACTORS[input.heatingType] ?? 1;
  const baseHeatingEmissions = 45 * heatingMultiplier; // baseline per person/month
  const heatingEmissions = baseHeatingEmissions * Math.sqrt(input.householdSize);

  return electricityEmissions + heatingEmissions;
}

/**
 * Calculate monthly food emissions in kg CO₂e
 */
export function calcFoodMonthly(input: CarbonInput["food"]): number {
  const baseDailyEmissions = FOOD_FACTORS[input.dietType] ?? FOOD_FACTORS.omnivore;
  const baseMonthly = baseDailyEmissions * 30;

  // Food waste uplift
  const wasteUplift = 1 + (input.foodWastePercentage / 100) * FOOD_WASTE_FACTOR * 10;

  // Local food reduction (up to 20% reduction)
  const localReduction = 1 - (input.localFoodPercentage / 100) * 0.2;

  return baseMonthly * wasteUplift * localReduction;
}

/**
 * Calculate monthly shopping emissions in kg CO₂e
 */
export function calcShoppingMonthly(input: CarbonInput["shopping"]): number {
  const secondHandFactor = 1 - input.secondHandPercentage / 100;

  const clothingEmissions =
    input.clothingItemsPerMonth *
    SHOPPING_FACTORS.clothingItem *
    secondHandFactor;

  // Electronics averaged to monthly
  const electronicsEmissions =
    (input.electronicsPerYear * SHOPPING_FACTORS.electronicsSmall) / 12;

  const deliveryEmissions =
    input.onlineOrdersPerWeek * 4.33 * SHOPPING_FACTORS.onlineDelivery;

  return clothingEmissions + electronicsEmissions + deliveryEmissions;
}

/**
 * Calculate monthly water emissions in kg CO₂e
 */
export function calcWaterMonthly(input: CarbonInput["water"]): number {
  const weeksPerMonth = 4.33;

  const showerEmissions =
    input.showersPerWeek * weeksPerMonth * input.showerDurationMinutes * WATER_FACTORS.shower;
  const bathEmissions = input.bathsPerWeek * weeksPerMonth * WATER_FACTORS.bath;
  const dishwasherEmissions =
    input.dishwasherUsesPerWeek * weeksPerMonth * WATER_FACTORS.dishwasher;
  const laundryEmissions =
    input.laundryLoadsPerWeek * weeksPerMonth * WATER_FACTORS.laundry;

  return showerEmissions + bathEmissions + dishwasherEmissions + laundryEmissions;
}

/**
 * Calculate monthly waste emissions in kg CO₂e
 */
export function calcWasteMonthly(input: CarbonInput["waste"]): number {
  const weeksPerMonth = 4.33;
  const monthlyWaste = input.wasteKgPerWeek * weeksPerMonth;

  const recycledFraction = input.recyclingRate / 100;
  const compostedFraction = input.compostingEnabled ? 0.1 : 0;
  const landfillFraction = Math.max(0, 1 - recycledFraction - compostedFraction);

  return (
    monthlyWaste * landfillFraction * WASTE_FACTORS.landfill +
    monthlyWaste * recycledFraction * WASTE_FACTORS.recycled +
    monthlyWaste * compostedFraction * WASTE_FACTORS.composted
  );
}

// ============================================================
// MAIN CALCULATOR
// ============================================================

/**
 * Calculate full carbon footprint from user input
 * @param input - User lifestyle data
 * @param userId - Firebase user ID
 * @returns Complete carbon result with scores and hotspots
 */
export function calculateCarbonFootprint(
  input: CarbonInput,
  userId: string
): CarbonResult {
  const monthly: CategoryEmissions = {
    transportation: calcTransportMonthly(input.transportation),
    energy: calcEnergyMonthly(input.energy),
    food: calcFoodMonthly(input.food),
    shopping: calcShoppingMonthly(input.shopping),
    water: calcWaterMonthly(input.water),
    waste: calcWasteMonthly(input.waste),
  };

  const annual: CategoryEmissions = {
    transportation: monthly.transportation * 12,
    energy: monthly.energy * 12,
    food: monthly.food * 12,
    shopping: monthly.shopping * 12,
    water: monthly.water * 12,
    waste: monthly.waste * 12,
  };

  const totalMonthlyCo2 = Object.values(monthly).reduce((a, b) => a + b, 0);
  const totalAnnualCo2 = totalMonthlyCo2 * 12;

  const hotspots = detectHotspots(monthly, totalMonthlyCo2);
  const sustainabilityScore = calcSustainabilityScore(totalAnnualCo2);
  const comparisonToAverage =
    ((totalAnnualCo2 - GLOBAL_AVERAGES.annualPerCapita) / GLOBAL_AVERAGES.annualPerCapita) * 100;

  return {
    userId,
    timestamp: new Date(),
    input,
    monthly,
    annual,
    totalMonthlyCo2,
    totalAnnualCo2,
    hotspots,
    sustainabilityScore,
    comparisonToAverage,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Detect emission hotspots — categories contributing most
 */
export function detectHotspots(
  monthly: CategoryEmissions,
  total: number
): EmissionHotspot[] {
  const entries = Object.entries(monthly) as [keyof CategoryEmissions, number][];

  return entries
    .map(([category, value]) => {
      const percentage = total > 0 ? (value / total) * 100 : 0;
      return {
        category,
        value,
        percentage,
        severity: getSeverity(percentage),
        recommendation: getRecommendation(category, value),
      };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Map emission percentage to severity level
 */
function getSeverity(percentage: number): EmissionHotspot["severity"] {
  if (percentage >= 40) return "critical";
  if (percentage >= 25) return "high";
  if (percentage >= 15) return "medium";
  return "low";
}

/**
 * Generate a quick recommendation for a category
 */
function getRecommendation(category: keyof CategoryEmissions, value: number): string {
  const recommendations: Record<keyof CategoryEmissions, string> = {
    transportation: "Consider carpooling, public transport, or switching to an EV.",
    energy: "Switch to renewable energy and improve home insulation.",
    food: "Reducing meat consumption by 2 meals/week can save ~90kg CO₂ annually.",
    shopping: "Buy second-hand and extend the life of electronics.",
    water: "Shorter showers and cold-wash laundry reduce water heating emissions.",
    waste: "Increase recycling rate and start composting organic waste.",
  };
  return value > 0 ? recommendations[category] : "Great job keeping this low!";
}

/**
 * Calculate sustainability score (0-100)
 * Based on comparison to the 2-tonne Paris Climate Target
 */
export function calcSustainabilityScore(annualCo2: number): number {
  const parisTarget = GLOBAL_AVERAGES.parisTarget; // 2000 kg
  const worstCase = 20000; // 20 tonnes (very high emitter)

  if (annualCo2 <= parisTarget) return 100;
  if (annualCo2 >= worstCase) return 0;

  const score = 100 * (1 - (annualCo2 - parisTarget) / (worstCase - parisTarget));
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Format kg CO₂e value for display
 */
export function formatCo2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} t`;
  }
  return `${Math.round(kg)} kg`;
}

/**
 * Get carbon footprint comparison label
 */
export function getComparisonLabel(pct: number): string {
  if (pct < -30) return "Well below global average";
  if (pct < -10) return "Below global average";
  if (pct < 10) return "Near global average";
  if (pct < 50) return "Above global average";
  return "Significantly above global average";
}
