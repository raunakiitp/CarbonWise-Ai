import { describe, it, expect } from "vitest";
import { generatePredictions, calculateActionImpact } from "@/lib/carbon/predictor";

describe("Carbon Predictor", () => {
  const userId = "test-user";
  const currentMonthly = 400;

  describe("generatePredictions", () => {
    it("generates 12 monthly predictions", () => {
      const result = generatePredictions(userId, currentMonthly);
      expect(result.predictions).toHaveLength(12);
      expect(result.scenarioBau).toHaveLength(12);
      expect(result.scenarioOptimistic).toHaveLength(12);
    });

    it("optimistic scenario always lower than BAU", () => {
      const result = generatePredictions(userId, currentMonthly);
      result.predictions.forEach((bau, i) => {
        expect(result.scenarioOptimistic[i].predicted).toBeLessThanOrEqual(bau.predicted);
      });
    });

    it("all predicted values are non-negative", () => {
      const result = generatePredictions(userId, currentMonthly);
      result.predictions.forEach((p) => {
        expect(p.predicted).toBeGreaterThanOrEqual(0);
        expect(p.lower).toBeGreaterThanOrEqual(0);
        expect(p.upper).toBeGreaterThan(0);
      });
    });

    it("confidence interval: lower <= predicted <= upper", () => {
      const result = generatePredictions(userId, currentMonthly);
      result.predictions.forEach((p) => {
        expect(p.lower).toBeLessThanOrEqual(p.predicted);
        expect(p.predicted).toBeLessThanOrEqual(p.upper);
      });
    });

    it("yearly reduction potential is non-negative", () => {
      const result = generatePredictions(userId, currentMonthly);
      expect(result.yearlyReductionPotential).toBeGreaterThanOrEqual(0);
    });

    it("sets confidenceScore = 0.65 with no history", () => {
      const result = generatePredictions(userId, currentMonthly, []);
      expect(result.confidenceScore).toBe(0.65);
    });

    it("sets confidenceScore = 0.85 with 6+ history points", () => {
      const history = Array.from({ length: 6 }, (_, i) => ({
        month: `2024-${(i + 1).toString().padStart(2, "0")}`,
        total: 400 - i * 5,
      }));
      const result = generatePredictions(userId, currentMonthly, history);
      expect(result.confidenceScore).toBe(0.85);
    });

    it("uses currentMonthly as base", () => {
      const result = generatePredictions(userId, currentMonthly);
      expect(result.currentMonthly).toBe(currentMonthly);
    });
  });

  describe("calculateActionImpact", () => {
    it("returns non-negative savings for known actions", () => {
      const impact = calculateActionImpact(10000, ["switch-to-ev", "vegan-diet"]);
      Object.values(impact).forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    });

    it("ignores unknown action types", () => {
      const impact = calculateActionImpact(10000, ["unknown-action"]);
      expect(Object.keys(impact)).toHaveLength(0);
    });

    it("higher annual CO₂ = higher absolute savings", () => {
      const impactLow = calculateActionImpact(2000, ["switch-to-ev"]);
      const impactHigh = calculateActionImpact(20000, ["switch-to-ev"]);
      expect(impactHigh["switch-to-ev"]).toBeGreaterThan(impactLow["switch-to-ev"]);
    });
  });
});
