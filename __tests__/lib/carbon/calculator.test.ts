import { describe, it, expect } from "vitest";
import {
  calculateCarbonFootprint,
  calcTransportMonthly,
  calcEnergyMonthly,
  calcFoodMonthly,
  calcSustainabilityScore,
  formatCo2,
  detectHotspots,
} from "@/lib/carbon/calculator";
import type { CarbonInput } from "@/types";

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
  describe("calcTransportMonthly", () => {
    it("returns 0 for car type none with no flights", () => {
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
  });

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
  });

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
  });

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
  });

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
  });

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
  });

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
  });
});
