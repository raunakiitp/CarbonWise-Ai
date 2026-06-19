/**
 * @fileoverview IPCC-aligned emission factors for carbon footprint calculation
 * Sources: IPCC AR6, EPA, DEFRA 2023 emission factors
 */

// ============================================================
// TRANSPORTATION EMISSION FACTORS (kg CO₂e per km)
// ============================================================
export const TRANSPORT_FACTORS = {
  petrol: 0.192,     // Average petrol car
  diesel: 0.171,     // Average diesel car
  hybrid: 0.109,     // Hybrid vehicle
  electric: 0.053,   // Electric vehicle (grid average)
  none: 0,
  publicBus: 0.089,  // Local bus
  train: 0.041,      // National rail
  cycling: 0.0,      // Zero emissions
  walking: 0.0,      // Zero emissions
  shortHaulFlight: 0.255,  // per km, economy
  longHaulFlight: 0.195,   // per km, economy
} as const;

// Average flight distance assumptions
export const FLIGHT_DISTANCES = {
  shortHaul: 750,    // km average for domestic/short-haul
  longHaul: 5500,    // km average for international
} as const;

// ============================================================
// ENERGY EMISSION FACTORS (kg CO₂e per kWh)
// ============================================================
export const ENERGY_FACTORS = {
  electricity: 0.233,   // Grid average (UK DEFRA 2023)
  gas: 0.203,           // Natural gas per kWh
  oil: 0.297,           // Heating oil per kWh
  heatPump: 0.058,      // Heat pump (vs electricity)
  solar: 0.012,         // Solar PV lifecycle
  renewable: 0.012,     // Certified renewable energy
} as const;

// Heating type factors (multiplier on top of baseline)
export const HEATING_FACTORS: Record<string, number> = {
  gas: 1.0,
  electric: 1.3,
  oil: 1.5,
  "heat-pump": 0.35,
  solar: 0.05,
  none: 0,
};

// ============================================================
// FOOD EMISSION FACTORS (kg CO₂e per day)
// ============================================================
export const FOOD_FACTORS: Record<string, number> = {
  vegan: 2.89,
  vegetarian: 3.81,
  pescatarian: 4.23,
  flexitarian: 5.09,
  omnivore: 7.19,
  "heavy-meat": 9.07,
} as const;

export const FOOD_WASTE_FACTOR = 0.15; // 15% uplift per 10% food waste

// ============================================================
// SHOPPING EMISSION FACTORS
// ============================================================
export const SHOPPING_FACTORS = {
  clothingItem: 14.0,        // kg CO₂e per new clothing item
  electronicsSmall: 50.0,    // Smartphone equivalent
  electronicsLarge: 300.0,   // Laptop equivalent
  onlineDelivery: 0.5,       // kg CO₂e per delivery
  secondHand: 0.05,          // Near-zero for second-hand
} as const;

// ============================================================
// WATER EMISSION FACTORS
// ============================================================
export const WATER_FACTORS = {
  shower: 0.09,       // kg CO₂e per minute of hot shower
  bath: 0.53,         // kg CO₂e per bath
  dishwasher: 0.74,   // kg CO₂e per cycle
  laundry: 0.60,      // kg CO₂e per load (hot wash)
  coldWash: 0.13,     // kg CO₂e per cold load
} as const;

// ============================================================
// WASTE EMISSION FACTORS
// ============================================================
export const WASTE_FACTORS = {
  landfill: 0.59,     // kg CO₂e per kg of waste to landfill
  recycled: 0.02,     // kg CO₂e per kg recycled
  composted: 0.015,   // kg CO₂e per kg composted
} as const;

// ============================================================
// GREEN ACTION SAVINGS (kg CO₂e saved per action)
// ============================================================
export const ACTION_SAVINGS: Record<string, number> = {
  walking: 0.0,         // per km (vs driving saves TRANSPORT_FACTORS.petrol)
  cycling: 0.192,       // per km saved vs petrol car
  "tree-planting": 25,  // per tree (annual sequestration)
  recycling: 2.1,       // per session
  "public-transport": 5.2, // per day vs car
  "energy-saving": 0.6, // per kWh not used
  "meatless-meal": 2.5, // per meal (vs beef)
  "reusable-bag": 3.0,  // per 100 uses vs plastic
  "cold-wash": 0.47,    // per load vs hot wash
  "local-food": 0.35,   // per meal (vs imported)
} as const;

// ============================================================
// GLOBAL AVERAGES (kg CO₂e)
// ============================================================
export const GLOBAL_AVERAGES = {
  monthlyPerCapita: 370,   // ~4.4 tonnes/year
  annualPerCapita: 4400,   // Global average
  ukAnnual: 6800,
  usAnnual: 14900,
  indiaAnnual: 1900,
  parisTarget: 2000,       // 2 tonnes per person target
} as const;

// ============================================================
// SCORING THRESHOLDS (sustainability score 0-100)
// ============================================================
export const SCORE_THRESHOLDS = {
  excellent: { min: 80, label: "Excellent", color: "#22c55e" },
  good: { min: 60, label: "Good", color: "#84cc16" },
  average: { min: 40, label: "Average", color: "#eab308" },
  belowAverage: { min: 20, label: "Below Average", color: "#f97316" },
  poor: { min: 0, label: "Poor", color: "#ef4444" },
} as const;

// ============================================================
// CATEGORY COLORS
// ============================================================
export const CATEGORY_COLORS = {
  transportation: "#3b82f6",
  energy: "#f59e0b",
  food: "#22c55e",
  shopping: "#a855f7",
  water: "#06b6d4",
  waste: "#6b7280",
} as const;

// ============================================================
// CATEGORY ICONS (emoji)
// ============================================================
export const CATEGORY_ICONS = {
  transportation: "🚗",
  energy: "⚡",
  food: "🥗",
  shopping: "🛍️",
  water: "💧",
  waste: "♻️",
} as const;
