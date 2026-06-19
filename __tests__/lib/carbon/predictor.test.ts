import { describe, it, expect } from "vitest";
import { generatePredictions, calculateActionImpact } from "@/lib/carbon/predictor";

describe("Carbon Predictor", () => {
  const userId = "test-user";
  const currentMonthly = 400;

  // ─── generatePredictions ──────────────────────────────────────
  describe("generatePredictions", () => {
    it("generates 12 monthly predictions", () => {
      const result = generatePredictions(userId, currentMonthly);
      expect(result.predictions).toHaveLength(12);
      expect(result.scenarioBau).toHaveLength(12);
      expect(result.scenarioOptimistic).toHaveLength(12);
    });

    it("optimistic scenario always lower than or equal to BAU", () => {
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

    it("returns correct userId", () => {
      const result = generatePredictions("user-abc", 300);
      expect(result.userId).toBe("user-abc");
    });

    it("predictions have valid month strings (yyyy-MM format)", () => {
      const result = generatePredictions(userId, currentMonthly);
      result.predictions.forEach((p) => {
        expect(p.month).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it("generatedAt is a recent Date", () => {
      const before = new Date();
      const result = generatePredictions(userId, currentMonthly);
      const after = new Date();
      expect(result.generatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.generatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("uncertainty grows with forecast horizon (upper - lower increases over time)", () => {
      const result = generatePredictions(userId, currentMonthly);
      const firstSpread = result.predictions[0].upper - result.predictions[0].lower;
      const lastSpread = result.predictions[11].upper - result.predictions[11].lower;
      expect(lastSpread).toBeGreaterThan(firstSpread);
    });

    it("trend from historical data affects predictions", () => {
      // Declining trend → predictions should go down over time
      const decliningHistory = Array.from({ length: 6 }, (_, i) => ({
        month: `2024-${(i + 1).toString().padStart(2, "0")}`,
        total: 500 - i * 30, // clear downward trend
      }));
      const result = generatePredictions(userId, 320, decliningHistory);
      // With declining trend, month 12 should be lower than month 1
      expect(result.predictions[11].predicted).toBeLessThan(result.predictions[0].predicted);
    });

    it("handles zero current monthly without crashing", () => {
      const result = generatePredictions(userId, 0);
      result.predictions.forEach((p) => {
        expect(p.predicted).toBeGreaterThanOrEqual(0);
        expect(Number.isNaN(p.predicted)).toBe(false);
      });
    });

    it("less confident with only 1 history point vs 6+", () => {
      const onePoint = generatePredictions(userId, currentMonthly, [{ month: "2024-01", total: 400 }]);
      const sixPoints = generatePredictions(userId, currentMonthly, Array.from({ length: 6 }, (_, i) => ({ month: `2024-0${i + 1}`, total: 400 })));
      expect(onePoint.confidenceScore).toBeLessThan(sixPoints.confidenceScore);
    });
  });

  // ─── calculateActionImpact ────────────────────────────────────
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

    it("returns correct keys for each action", () => {
      const actions = ["switch-to-ev", "public-transport", "renewable-energy", "vegan-diet"];
      const impact = calculateActionImpact(10000, actions);
      actions.forEach((action) => {
        expect(impact).toHaveProperty(action);
      });
    });

    it("vegan-diet has higher impact than reduce-shopping", () => {
      const impact = calculateActionImpact(10000, ["vegan-diet", "reduce-shopping"]);
      expect(impact["vegan-diet"]).toBeGreaterThan(impact["reduce-shopping"]);
    });

    it("returns empty object for empty actions array", () => {
      const impact = calculateActionImpact(10000, []);
      expect(Object.keys(impact)).toHaveLength(0);
    });

    it("returns integer savings values (rounded)", () => {
      const impact = calculateActionImpact(10000, ["switch-to-ev"]);
      expect(Number.isInteger(impact["switch-to-ev"])).toBe(true);
    });

    it("filters out unknown actions while keeping known ones", () => {
      const impact = calculateActionImpact(10000, ["switch-to-ev", "totally-fake-action", "vegan-diet"]);
      expect(impact).toHaveProperty("switch-to-ev");
      expect(impact).toHaveProperty("vegan-diet");
      expect(impact).not.toHaveProperty("totally-fake-action");
    });

    it("zero annual CO₂ yields zero savings for all actions", () => {
      const actions = ["switch-to-ev", "vegan-diet", "renewable-energy"];
      const impact = calculateActionImpact(0, actions);
      Object.values(impact).forEach((v) => expect(v).toBe(0));
    });

    it("handles all known action types without error", () => {
      const allActions = [
        "switch-to-ev",
        "public-transport",
        "renewable-energy",
        "vegan-diet",
        "reduce-flights",
        "efficient-home",
        "reduce-shopping",
      ];
      const impact = calculateActionImpact(12000, allActions);
      expect(Object.keys(impact)).toHaveLength(allActions.length);
    });

    it("switch-to-ev has larger impact than reduce-flights for high-driver profile", () => {
      // switch-to-ev = 15% vs reduce-flights = 10%
      const impact = calculateActionImpact(10000, ["switch-to-ev", "reduce-flights"]);
      expect(impact["switch-to-ev"]).toBeGreaterThan(impact["reduce-flights"]);
    });
  });
});
