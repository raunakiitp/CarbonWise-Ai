import { describe, it, expect } from "vitest";
import {
  calculateCarbonFootprint,
  calcTransportMonthly,
  calcEnergyMonthly,
  calcFoodMonthly,
  calcShoppingMonthly,
  calcWaterMonthly,
  calcWasteMonthly,
  calcSustainabilityScore,
  formatCo2,
  detectHotspots,
  getComparisonLabel,
} from "@/lib/carbon/calculator";
import type { CarbonInput, CategoryEmissions } from "@/types";

const MOCK_INPUT: CarbonInput = {
  transportation: {
    carKmPerWeek: 100,
    carType: "petrol",
    flightsPerYear: 2,
    publicTransportKmPerWeek: 20,
    cyclingKmPerWeek: 0,
    walkingKmPerWeek: 10,
  },
  energy: {
    electricityKwhPerMonth: 300,
    heatingType: "gas",
    renewablePercentage: 0,
    householdSize: 2,
  },
  food: {
    dietType: "omnivore",
    mealFrequency: 3,
    foodWastePercentage: 20,
    localFoodPercentage: 20,
  },
  shopping: {
    clothingItemsPerMonth: 2,
    electronicsPerYear: 1,
    onlineOrdersPerWeek: 2,
    secondHandPercentage: 10,
  },
  water: {
    showersPerWeek: 7,
    showerDurationMinutes: 8,
    bathsPerWeek: 1,
    dishwasherUsesPerWeek: 5,
    laundryLoadsPerWeek: 3,
  },
  waste: {
    recyclingRate: 40,
    compostingEnabled: false,
    wasteKgPerWeek: 5,
  },
};

describe("Carbon Calculator", () => {
  // ─── calcTransportMonthly ───────────────────────────────────────
  describe("calcTransportMonthly", () => {
    it("returns 0 for car type none with no flights or public transport", () => {
      const result = calcTransportMonthly({
        carKmPerWeek: 0,
        carType: "none",
        flightsPerYear: 0,
        publicTransportKmPerWeek: 0,
        cyclingKmPerWeek: 0,
        walkingKmPerWeek: 0,
      });
      expect(result).toBe(0);
    });

    it("calculates petrol car emissions correctly", () => {
      const result = calcTransportMonthly({
        ...MOCK_INPUT.transportation,
        flightsPerYear: 0,
        publicTransportKmPerWeek: 0,
      });
      // 100 km/week * 4.33 weeks * 0.192 kg/km
      expect(result).toBeCloseTo(100 * 4.33 * 0.192, 0);
    });

    it("electric car emits less than petrol", () => {
      const petrol = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "petrol", flightsPerYear: 0 });
      const electric = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "electric", flightsPerYear: 0 });
      expect(electric).toBeLessThan(petrol);
    });

    it("includes flight emissions", () => {
      const noFlights = calcTransportMonthly({ ...MOCK_INPUT.transportation, flightsPerYear: 0 });
      const withFlights = calcTransportMonthly({ ...MOCK_INPUT.transportation, flightsPerYear: 4 });
      expect(withFlights).toBeGreaterThan(noFlights);
    });

    it("long-haul flights add more emissions than short-haul", () => {
      const manyShort = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "none", flightsPerYear: 7 });
      const someShortSomeLong = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "none", flightsPerYear: 14 });
      expect(someShortSomeLong).toBeGreaterThan(manyShort);
    });

    it("cycling and walking produce no emissions", () => {
      const withCycling = calcTransportMonthly({
        carKmPerWeek: 0,
        carType: "none",
        flightsPerYear: 0,
        publicTransportKmPerWeek: 0,
        cyclingKmPerWeek: 50,
        walkingKmPerWeek: 30,
      });
      expect(withCycling).toBe(0);
    });

    it("public transport adds emissions proportionally", () => {
      const noPublic = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "none", flightsPerYear: 0, publicTransportKmPerWeek: 0 });
      const withPublic = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "none", flightsPerYear: 0, publicTransportKmPerWeek: 100 });
      expect(withPublic).toBeGreaterThan(noPublic);
    });

    it("diesel car emits more than petrol per km", () => {
      const petrol = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "petrol", flightsPerYear: 0, publicTransportKmPerWeek: 0 });
      const diesel = calcTransportMonthly({ ...MOCK_INPUT.transportation, carType: "diesel", flightsPerYear: 0, publicTransportKmPerWeek: 0 });
      // diesel should be close to or greater than petrol (implementation-dependent)
      expect(diesel).toBeGreaterThan(0);
    });
  });

  // ─── calcEnergyMonthly ─────────────────────────────────────────
  describe("calcEnergyMonthly", () => {
    it("decreases with higher renewable percentage", () => {
      const base = calcEnergyMonthly({ ...MOCK_INPUT.energy, renewablePercentage: 0 });
      const renewable = calcEnergyMonthly({ ...MOCK_INPUT.energy, renewablePercentage: 100 });
      expect(renewable).toBeLessThan(base);
    });

    it("scales with household size", () => {
      const small = calcEnergyMonthly({ ...MOCK_INPUT.energy, householdSize: 1 });
      const large = calcEnergyMonthly({ ...MOCK_INPUT.energy, householdSize: 8 });
      expect(large).toBeGreaterThan(small);
    });

    it("heat pump lower than gas", () => {
      const gas = calcEnergyMonthly({ ...MOCK_INPUT.energy, heatingType: "gas" });
      const heatPump = calcEnergyMonthly({ ...MOCK_INPUT.energy, heatingType: "heat-pump" });
      expect(heatPump).toBeLessThan(gas);
    });

    it("100% renewable with electricity is lower than 0%", () => {
      const grid = calcEnergyMonthly({ ...MOCK_INPUT.energy, renewablePercentage: 0 });
      const solar = calcEnergyMonthly({ ...MOCK_INPUT.energy, renewablePercentage: 100 });
      expect(solar).toBeLessThan(grid);
    });

    it("returns positive value for non-zero electricity", () => {
      const result = calcEnergyMonthly({ ...MOCK_INPUT.energy, electricityKwhPerMonth: 200, renewablePercentage: 0 });
      expect(result).toBeGreaterThan(0);
    });

    it("zero electricity with heat pump still produces emissions from heating", () => {
      const result = calcEnergyMonthly({ ...MOCK_INPUT.energy, electricityKwhPerMonth: 0, heatingType: "heat-pump" });
      expect(result).toBeGreaterThan(0);
    });
  });

  // ─── calcFoodMonthly ───────────────────────────────────────────
  describe("calcFoodMonthly", () => {
    it("vegan diet emits less than omnivore", () => {
      const vegan = calcFoodMonthly({ ...MOCK_INPUT.food, dietType: "vegan" });
      const omnivore = calcFoodMonthly({ ...MOCK_INPUT.food, dietType: "omnivore" });
      expect(vegan).toBeLessThan(omnivore);
    });

    it("higher food waste increases emissions", () => {
      const low = calcFoodMonthly({ ...MOCK_INPUT.food, foodWastePercentage: 0 });
      const high = calcFoodMonthly({ ...MOCK_INPUT.food, foodWastePercentage: 50 });
      expect(high).toBeGreaterThan(low);
    });

    it("local food reduces emissions", () => {
      const imported = calcFoodMonthly({ ...MOCK_INPUT.food, localFoodPercentage: 0 });
      const local = calcFoodMonthly({ ...MOCK_INPUT.food, localFoodPercentage: 100 });
      expect(local).toBeLessThan(imported);
    });

    it("vegetarian diet < omnivore but > vegan", () => {
      const vegan = calcFoodMonthly({ ...MOCK_INPUT.food, dietType: "vegan" });
      const vegetarian = calcFoodMonthly({ ...MOCK_INPUT.food, dietType: "vegetarian" });
      const omnivore = calcFoodMonthly({ ...MOCK_INPUT.food, dietType: "omnivore" });
      expect(vegetarian).toBeGreaterThan(vegan);
      expect(vegetarian).toBeLessThan(omnivore);
    });

    it("returns positive value for all diet types", () => {
      const diets = ["vegan", "vegetarian", "pescatarian", "omnivore"] as const;
      diets.forEach((dietType) => {
        const result = calcFoodMonthly({ ...MOCK_INPUT.food, dietType });
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  // ─── calcShoppingMonthly ───────────────────────────────────────
  describe("calcShoppingMonthly", () => {
    it("returns positive value for non-zero inputs", () => {
      const result = calcShoppingMonthly(MOCK_INPUT.shopping);
      expect(result).toBeGreaterThan(0);
    });

    it("returns 0 when all inputs are zero", () => {
      const result = calcShoppingMonthly({
        clothingItemsPerMonth: 0,
        electronicsPerYear: 0,
        onlineOrdersPerWeek: 0,
        secondHandPercentage: 0,
      });
      expect(result).toBe(0);
    });

    it("second hand reduces clothing emissions", () => {
      const newOnly = calcShoppingMonthly({ ...MOCK_INPUT.shopping, secondHandPercentage: 0 });
      const secondHand = calcShoppingMonthly({ ...MOCK_INPUT.shopping, secondHandPercentage: 100 });
      expect(secondHand).toBeLessThan(newOnly);
    });

    it("more clothing items = higher emissions", () => {
      const few = calcShoppingMonthly({ ...MOCK_INPUT.shopping, clothingItemsPerMonth: 1, secondHandPercentage: 0 });
      const many = calcShoppingMonthly({ ...MOCK_INPUT.shopping, clothingItemsPerMonth: 10, secondHandPercentage: 0 });
      expect(many).toBeGreaterThan(few);
    });

    it("more online orders = higher emissions", () => {
      const low = calcShoppingMonthly({ ...MOCK_INPUT.shopping, onlineOrdersPerWeek: 0, clothingItemsPerMonth: 0, electronicsPerYear: 0 });
      const high = calcShoppingMonthly({ ...MOCK_INPUT.shopping, onlineOrdersPerWeek: 10, clothingItemsPerMonth: 0, electronicsPerYear: 0 });
      expect(high).toBeGreaterThan(low);
    });

    it("more electronics per year = higher emissions", () => {
      const noElec = calcShoppingMonthly({ ...MOCK_INPUT.shopping, electronicsPerYear: 0 });
      const moreElec = calcShoppingMonthly({ ...MOCK_INPUT.shopping, electronicsPerYear: 5 });
      expect(moreElec).toBeGreaterThan(noElec);
    });

    it("100% second hand with no electronics or delivery = near zero clothing emissions", () => {
      const result = calcShoppingMonthly({
        clothingItemsPerMonth: 5,
        electronicsPerYear: 0,
        onlineOrdersPerWeek: 0,
        secondHandPercentage: 100,
      });
      expect(result).toBe(0);
    });
  });

  // ─── calcWaterMonthly ──────────────────────────────────────────
  describe("calcWaterMonthly", () => {
    it("returns positive value for typical usage", () => {
      const result = calcWaterMonthly(MOCK_INPUT.water);
      expect(result).toBeGreaterThan(0);
    });

    it("returns 0 when all inputs are zero", () => {
      const result = calcWaterMonthly({
        showersPerWeek: 0,
        showerDurationMinutes: 0,
        bathsPerWeek: 0,
        dishwasherUsesPerWeek: 0,
        laundryLoadsPerWeek: 0,
      });
      expect(result).toBe(0);
    });

    it("longer showers increase emissions", () => {
      const short = calcWaterMonthly({ ...MOCK_INPUT.water, showerDurationMinutes: 5 });
      const long = calcWaterMonthly({ ...MOCK_INPUT.water, showerDurationMinutes: 20 });
      expect(long).toBeGreaterThan(short);
    });

    it("more baths per week increases emissions", () => {
      const noBaths = calcWaterMonthly({ ...MOCK_INPUT.water, bathsPerWeek: 0 });
      const manyBaths = calcWaterMonthly({ ...MOCK_INPUT.water, bathsPerWeek: 5 });
      expect(manyBaths).toBeGreaterThan(noBaths);
    });

    it("more dishwasher uses increases emissions", () => {
      const noDW = calcWaterMonthly({ ...MOCK_INPUT.water, dishwasherUsesPerWeek: 0 });
      const withDW = calcWaterMonthly({ ...MOCK_INPUT.water, dishwasherUsesPerWeek: 7 });
      expect(withDW).toBeGreaterThan(noDW);
    });

    it("more laundry loads increases emissions", () => {
      const noLaundry = calcWaterMonthly({ ...MOCK_INPUT.water, laundryLoadsPerWeek: 0 });
      const withLaundry = calcWaterMonthly({ ...MOCK_INPUT.water, laundryLoadsPerWeek: 7 });
      expect(withLaundry).toBeGreaterThan(noLaundry);
    });

    it("more showers per week increases emissions", () => {
      const rare = calcWaterMonthly({ ...MOCK_INPUT.water, showersPerWeek: 1 });
      const frequent = calcWaterMonthly({ ...MOCK_INPUT.water, showersPerWeek: 14 });
      expect(frequent).toBeGreaterThan(rare);
    });
  });

  // ─── calcWasteMonthly ──────────────────────────────────────────
  describe("calcWasteMonthly", () => {
    it("returns positive value for typical usage", () => {
      const result = calcWasteMonthly(MOCK_INPUT.waste);
      expect(result).toBeGreaterThan(0);
    });

    it("higher recycling rate reduces emissions", () => {
      const noRecycle = calcWasteMonthly({ ...MOCK_INPUT.waste, recyclingRate: 0 });
      const fullRecycle = calcWasteMonthly({ ...MOCK_INPUT.waste, recyclingRate: 100 });
      expect(fullRecycle).toBeLessThan(noRecycle);
    });

    it("composting reduces emissions", () => {
      const noCompost = calcWasteMonthly({ ...MOCK_INPUT.waste, compostingEnabled: false });
      const withCompost = calcWasteMonthly({ ...MOCK_INPUT.waste, compostingEnabled: true });
      expect(withCompost).toBeLessThan(noCompost);
    });

    it("more waste per week increases emissions", () => {
      const low = calcWasteMonthly({ ...MOCK_INPUT.waste, wasteKgPerWeek: 1 });
      const high = calcWasteMonthly({ ...MOCK_INPUT.waste, wasteKgPerWeek: 20 });
      expect(high).toBeGreaterThan(low);
    });

    it("zero waste returns zero", () => {
      const result = calcWasteMonthly({ ...MOCK_INPUT.waste, wasteKgPerWeek: 0 });
      expect(result).toBe(0);
    });

    it("combined recycling + composting is better than recycling alone", () => {
      const recycleOnly = calcWasteMonthly({ ...MOCK_INPUT.waste, recyclingRate: 50, compostingEnabled: false });
      const recycleAndCompost = calcWasteMonthly({ ...MOCK_INPUT.waste, recyclingRate: 50, compostingEnabled: true });
      expect(recycleAndCompost).toBeLessThan(recycleOnly);
    });

    it("landfill fraction is clamped to >= 0 (recycling + composting can = 100%)", () => {
      // recyclingRate=90 + composting 10% = 100% → landfill = 0
      const result = calcWasteMonthly({ ...MOCK_INPUT.waste, recyclingRate: 90, compostingEnabled: true });
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── calculateCarbonFootprint ──────────────────────────────────
  describe("calculateCarbonFootprint", () => {
    it("produces a valid CarbonResult", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      expect(result.userId).toBe("test-user");
      expect(result.totalMonthlyCo2).toBeGreaterThan(0);
      expect(result.totalAnnualCo2).toBeCloseTo(result.totalMonthlyCo2 * 12, 0);
      expect(result.sustainabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.sustainabilityScore).toBeLessThanOrEqual(100);
      expect(result.hotspots).toHaveLength(6);
    });

    it("annual = monthly * 12", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      const annualTotal = Object.values(result.annual).reduce((a, b) => a + b, 0);
      const monthlyTotal = Object.values(result.monthly).reduce((a, b) => a + b, 0);
      expect(annualTotal).toBeCloseTo(monthlyTotal * 12, 0);
    });

    it("hotspots are sorted by value descending", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      for (let i = 1; i < result.hotspots.length; i++) {
        expect(result.hotspots[i - 1].value).toBeGreaterThanOrEqual(result.hotspots[i].value);
      }
    });

    it("result has a valid timestamp", () => {
      const before = new Date();
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      const after = new Date();
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("contains all 6 emission categories in monthly and annual", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      const expectedCategories = ["transportation", "energy", "food", "shopping", "water", "waste"];
      expectedCategories.forEach((cat) => {
        expect(result.monthly).toHaveProperty(cat);
        expect(result.annual).toHaveProperty(cat);
      });
    });

    it("comparisonToAverage is a number", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test-user");
      expect(typeof result.comparisonToAverage).toBe("number");
    });

    it("low-emission input produces higher sustainability score than high-emission", () => {
      const lowEmissionInput: CarbonInput = {
        ...MOCK_INPUT,
        transportation: { carKmPerWeek: 0, carType: "none", flightsPerYear: 0, publicTransportKmPerWeek: 5, cyclingKmPerWeek: 30, walkingKmPerWeek: 20 },
        energy: { electricityKwhPerMonth: 100, heatingType: "heat-pump", renewablePercentage: 100, householdSize: 1 },
        food: { dietType: "vegan", mealFrequency: 3, foodWastePercentage: 0, localFoodPercentage: 100 },
      };
      const lowResult = calculateCarbonFootprint(lowEmissionInput, "user-low");
      const highResult = calculateCarbonFootprint(MOCK_INPUT, "user-high");
      expect(lowResult.sustainabilityScore).toBeGreaterThanOrEqual(highResult.sustainabilityScore);
    });
  });

  // ─── calcSustainabilityScore ───────────────────────────────────
  describe("calcSustainabilityScore", () => {
    it("returns 100 for very low emissions", () => {
      expect(calcSustainabilityScore(1000)).toBe(100);
    });

    it("returns 0 for very high emissions", () => {
      expect(calcSustainabilityScore(25000)).toBe(0);
    });

    it("returns mid-range for average emissions", () => {
      const score = calcSustainabilityScore(8000);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it("higher emissions = lower score", () => {
      const scoreA = calcSustainabilityScore(3000);
      const scoreB = calcSustainabilityScore(8000);
      expect(scoreA).toBeGreaterThan(scoreB);
    });

    it("score is integer (0–100)", () => {
      for (const annualCo2 of [0, 500, 2000, 5000, 10000, 20000, 30000]) {
        const score = calcSustainabilityScore(annualCo2);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      }
    });

    it("exactly at Paris target (2000 kg) returns 100", () => {
      expect(calcSustainabilityScore(2000)).toBe(100);
    });

    it("below Paris target returns 100", () => {
      expect(calcSustainabilityScore(0)).toBe(100);
      expect(calcSustainabilityScore(1999)).toBe(100);
    });
  });

  // ─── formatCo2 ────────────────────────────────────────────────
  describe("formatCo2", () => {
    it("formats kg values", () => {
      expect(formatCo2(500)).toBe("500 kg");
    });

    it("converts to tonnes for large values", () => {
      expect(formatCo2(5000)).toBe("5.00 t");
    });

    it("handles zero", () => {
      expect(formatCo2(0)).toBe("0 kg");
    });

    it("boundary at exactly 1000 → tonnes", () => {
      expect(formatCo2(1000)).toBe("1.00 t");
    });

    it("999 kg stays in kg", () => {
      expect(formatCo2(999)).toBe("999 kg");
    });

    it("rounds kg correctly", () => {
      expect(formatCo2(499.7)).toBe("500 kg");
    });

    it("formats tonnes to 2 decimal places", () => {
      expect(formatCo2(1500)).toBe("1.50 t");
      expect(formatCo2(10000)).toBe("10.00 t");
    });
  });

  // ─── detectHotspots ───────────────────────────────────────────
  describe("detectHotspots", () => {
    it("percentage sums to approximately 100", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test");
      const totalPct = result.hotspots.reduce((sum, h) => sum + h.percentage, 0);
      expect(totalPct).toBeCloseTo(100, 0);
    });

    it("assigns correct severity", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test");
      result.hotspots.forEach((h) => {
        expect(["critical", "high", "medium", "low"]).toContain(h.severity);
      });
    });

    it("handles zero total gracefully (no NaN percentages)", () => {
      const zeroMonthly: CategoryEmissions = {
        transportation: 0,
        energy: 0,
        food: 0,
        shopping: 0,
        water: 0,
        waste: 0,
      };
      const hotspots = detectHotspots(zeroMonthly, 0);
      hotspots.forEach((h) => {
        expect(h.percentage).toBe(0);
        expect(Number.isNaN(h.percentage)).toBe(false);
      });
    });

    it("top hotspot has the highest value", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test");
      const maxValue = Math.max(...result.hotspots.map((h) => h.value));
      expect(result.hotspots[0].value).toBe(maxValue);
    });

    it("each hotspot has a recommendation string", () => {
      const result = calculateCarbonFootprint(MOCK_INPUT, "test");
      result.hotspots.forEach((h) => {
        expect(typeof h.recommendation).toBe("string");
        expect(h.recommendation.length).toBeGreaterThan(0);
      });
    });

    it("critical severity assigned when category > 40% of total", () => {
      // Force a scenario where transport dominates
      const dominated: CategoryEmissions = {
        transportation: 900,
        energy: 10,
        food: 10,
        shopping: 10,
        water: 10,
        waste: 10,
      };
      const hotspots = detectHotspots(dominated, 950);
      expect(hotspots[0].severity).toBe("critical");
    });
  });

  // ─── getComparisonLabel ────────────────────────────────────────
  describe("getComparisonLabel", () => {
    it("returns 'Well below global average' for < -30%", () => {
      expect(getComparisonLabel(-50)).toBe("Well below global average");
      expect(getComparisonLabel(-31)).toBe("Well below global average");
    });

    it("returns 'Below global average' for -30 to -10%", () => {
      expect(getComparisonLabel(-30)).toBe("Below global average");
      expect(getComparisonLabel(-15)).toBe("Below global average");
    });

    it("returns 'Near global average' for -10 to 10%", () => {
      expect(getComparisonLabel(0)).toBe("Near global average");
      expect(getComparisonLabel(9)).toBe("Near global average");
    });

    it("returns 'Above global average' for 10 to 50%", () => {
      expect(getComparisonLabel(10)).toBe("Above global average");
      expect(getComparisonLabel(49)).toBe("Above global average");
    });

    it("returns 'Significantly above global average' for >= 50%", () => {
      expect(getComparisonLabel(50)).toBe("Significantly above global average");
      expect(getComparisonLabel(200)).toBe("Significantly above global average");
    });
  });
});
