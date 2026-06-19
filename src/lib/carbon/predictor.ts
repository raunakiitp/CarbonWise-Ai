/**
 * @fileoverview Carbon footprint predictor using trend analysis
 * Generates 12-month forecasts with confidence intervals
 */

import type { CarbonPrediction, MonthlyPrediction } from "@/types";
import { format, addMonths } from "date-fns";

interface HistoricalDataPoint {
  month: string;
  total: number;
}

/**
 * Generate carbon footprint predictions for next 12 months
 * Uses linear regression + seasonal adjustment
 */
export function generatePredictions(
  userId: string,
  currentMonthly: number,
  historicalData: HistoricalDataPoint[] = []
): CarbonPrediction {
  const now = new Date();

  // If we have historical data, use linear regression
  // Otherwise use current value with gentle trend
  const trend = historicalData.length >= 3
    ? calculateTrend(historicalData)
    : -0.005; // Default: slight downward trend with engagement

  const predictions = generateMonthlyPredictions(currentMonthly, trend, now, "bau");
  const scenarioBau = predictions;
  const scenarioOptimistic = generateMonthlyPredictions(
    currentMonthly,
    trend - 0.03, // 3% additional monthly reduction with action
    now,
    "optimistic"
  );

  const yearlyReductionPotential =
    (predictions[11].predicted - scenarioOptimistic[11].predicted) * 12;

  return {
    userId,
    generatedAt: now,
    currentMonthly,
    predictions,
    scenarioBau,
    scenarioOptimistic,
    yearlyReductionPotential: Math.max(0, yearlyReductionPotential),
    confidenceScore: historicalData.length >= 6 ? 0.85 : 0.65,
  };
}

/**
 * Generate array of monthly predictions
 */
function generateMonthlyPredictions(
  baseMonthly: number,
  monthlyTrend: number,
  startDate: Date,
  scenario: string
): MonthlyPrediction[] {
  const predictions: MonthlyPrediction[] = [];

  for (let i = 1; i <= 12; i++) {
    const forecastDate = addMonths(startDate, i);
    const month = format(forecastDate, "yyyy-MM");

    // Apply trend with seasonal variation (higher in winter months)
    const seasonalFactor = getSeasonalFactor(forecastDate.getMonth());
    const trendFactor = Math.pow(1 + monthlyTrend, i);
    const predicted = Math.max(0, baseMonthly * trendFactor * seasonalFactor);

    // Uncertainty grows with time horizon
    const uncertainty = predicted * 0.05 * Math.sqrt(i);

    predictions.push({
      month,
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.max(0, Math.round((predicted - uncertainty) * 100) / 100),
      upper: Math.round((predicted + uncertainty) * 100) / 100,
    });
  }

  return predictions;
}

/**
 * Seasonal adjustment factor (Northern Hemisphere)
 * Winter months have higher energy demand
 */
function getSeasonalFactor(monthIndex: number): number {
  const seasonalFactors = [
    1.15, // Jan - winter peak
    1.12, // Feb
    1.05, // Mar
    0.98, // Apr
    0.95, // May
    0.92, // Jun - summer low
    0.90, // Jul
    0.91, // Aug
    0.96, // Sep
    1.02, // Oct
    1.10, // Nov
    1.14, // Dec - winter peak
  ];
  return seasonalFactors[monthIndex] ?? 1.0;
}

/**
 * Calculate trend from historical data using linear regression
 * Returns monthly growth rate (negative = decreasing)
 */
function calculateTrend(data: HistoricalDataPoint[]): number {
  if (data.length < 2) return -0.005;

  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data.map((d) => d.total);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgY = sumY / n;

  // Convert slope to monthly rate
  return avgY > 0 ? slope / avgY : -0.005;
}

/**
 * Calculate potential savings from specific actions
 */
export function calculateActionImpact(
  currentAnnual: number,
  actions: string[]
): Record<string, number> {
  const impactMap: Record<string, number> = {
    "switch-to-ev": currentAnnual * 0.15,
    "public-transport": currentAnnual * 0.08,
    "renewable-energy": currentAnnual * 0.12,
    "vegan-diet": currentAnnual * 0.20,
    "reduce-flights": currentAnnual * 0.10,
    "efficient-home": currentAnnual * 0.08,
    "reduce-shopping": currentAnnual * 0.05,
  };

  return Object.fromEntries(
    actions
      .filter((a) => a in impactMap)
      .map((a) => [a, Math.round(impactMap[a])])
  );
}
