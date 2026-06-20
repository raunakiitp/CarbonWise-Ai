"use client";

import { useState } from "react";
import { useCarbonData } from "@/hooks/useCarbonData";
import { formatCo2 } from "@/lib/carbon/calculator";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/emissions";
import type { CarbonInput } from "@/types";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

const STEPS = [
  { id: "transportation", label: "Transportation", icon: "🚗", desc: "How do you get around?" },
  { id: "energy", label: "Home Energy", icon: "⚡", desc: "Your electricity and heating" },
  { id: "food", label: "Food & Diet", icon: "🥗", desc: "Your eating habits" },
  { id: "shopping", label: "Shopping", icon: "🛍️", desc: "Your consumption patterns" },
  { id: "water", label: "Water", icon: "💧", desc: "Your water usage" },
  { id: "waste", label: "Waste", icon: "♻️", desc: "Your waste habits" },
];

const DEFAULT_INPUT: CarbonInput = {
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

export default function AnalyzerPage() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<CarbonInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<Awaited<ReturnType<ReturnType<typeof useCarbonData>["calculateAndSave"]>>>(null);
  const { calculateAndSave, saving } = useCarbonData();

  const updateTransport = (field: string, value: string | number) =>
    setInput((p) => ({ ...p, transportation: { ...p.transportation, [field]: value } }));
  const updateEnergy = (field: string, value: string | number) =>
    setInput((p) => ({ ...p, energy: { ...p.energy, [field]: value } }));
  const updateFood = (field: string, value: string | number) =>
    setInput((p) => ({ ...p, food: { ...p.food, [field]: value } }));
  const updateShopping = (field: string, value: string | number) =>
    setInput((p) => ({ ...p, shopping: { ...p.shopping, [field]: value } }));
  const updateWater = (field: string, value: string | number) =>
    setInput((p) => ({ ...p, water: { ...p.water, [field]: value } }));
  const updateWaste = (field: string, value: string | number | boolean) =>
    setInput((p) => ({ ...p, waste: { ...p.waste, [field]: value } }));

  const handleSubmit = async () => {
    const r = await calculateAndSave(input);
    setResult(r);
  };

  if (result) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="page-header" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">🎉</div>
          <h1 className="page-title">Your Carbon Report</h1>
          <p className="page-subtitle">Here&apos;s a detailed breakdown of your carbon footprint.</p>
        </div>

        {/* Score + totals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
          {[
            { label: "Monthly Total", value: formatCo2(result.totalMonthlyCo2), sub: "kg CO₂e per month", icon: "📅" },
            { label: "Annual Total", value: formatCo2(result.totalAnnualCo2), sub: "kg CO₂e per year", icon: "📆" },
            { label: "Sustainability Score", value: `${result.sustainabilityScore}/100`, sub: result.sustainabilityScore >= 60 ? "Good!" : "Room to improve", icon: "🏆" },
          ].map((kpi) => (
            <div key={kpi.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${kpi.label}: ${kpi.value}`}>
              <div style={{ fontSize: 36, marginBottom: "var(--space-3)" }} aria-hidden="true">{kpi.icon}</div>
              <div style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--weight-extrabold)", color: "var(--color-primary)" }}>{kpi.value}</div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>{kpi.label}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="section-title">Category Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-4)" }}>
            {Object.entries(result.monthly).map(([cat, val]) => {
              const pct = result.totalMonthlyCo2 > 0 ? (val / result.totalMonthlyCo2) * 100 : 0;
              const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
              return (
                <div key={cat} style={{ textAlign: "center", padding: "var(--space-4)", background: "var(--bg-muted)", borderRadius: "var(--radius-lg)" }} aria-label={`${cat}: ${formatCo2(val)}`}>
                  <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</div>
                  <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", color }}>{formatCo2(val)}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "capitalize", marginBottom: "var(--space-2)" }}>{cat}</div>
                  <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotspots */}
        <div className="card" style={{ marginBottom: "var(--space-6)" }}>
          <h2 className="section-title">🔥 Top Recommendations</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {result.hotspots.slice(0, 4).map((h) => (
              <div key={h.category} style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-4)", background: "var(--bg-muted)", borderRadius: "var(--radius-lg)", borderLeft: `3px solid ${CATEGORY_COLORS[h.category] ?? "var(--color-primary)"}` }}>
                <div style={{ fontSize: 24 }} aria-hidden="true">{CATEGORY_ICONS[h.category as keyof typeof CATEGORY_ICONS]}</div>
                <div>
                  <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)", textTransform: "capitalize", marginBottom: "var(--space-1)" }}>{h.category} — {formatCo2(h.value)}/month ({h.percentage.toFixed(0)}%)</div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{h.recommendation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center" }}>
          <button onClick={() => { setResult(null); setStep(0); }} className="btn btn-secondary">Recalculate</button>
          <a href="/coach" className="btn btn-primary">Get AI Coach Advice 🤖</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="page-header">
        <h1 className="page-title">Carbon Footprint Analyzer</h1>
        <p className="page-subtitle">Complete all 6 categories to get your personalized carbon score.</p>
      </div>

      {/* Step Progress */}
      <nav aria-label="Analysis steps" style={{ marginBottom: "var(--space-8)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto" }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-1)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-lg)",
                border: "none",
                cursor: "pointer",
                background: i === step ? "var(--color-primary-100)" : i < step ? "var(--bg-muted)" : "transparent",
                color: i === step ? "var(--color-primary-700)" : i < step ? "var(--color-primary)" : "var(--text-muted)",
                fontWeight: i === step ? "var(--weight-semibold)" : "var(--weight-regular)",
                transition: "all var(--transition-base)",
                whiteSpace: "nowrap",
                minWidth: 80,
              }}
              aria-current={i === step ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${s.label}${i < step ? " (completed)" : ""}`}
            >
              <span style={{ fontSize: 20 }} aria-hidden="true">{i < step ? "✅" : s.icon}</span>
              <span style={{ fontSize: "var(--text-xs)" }}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="progress-bar" style={{ marginTop: "var(--space-3)" }} role="progressbar" aria-valuenow={step} aria-valuemax={STEPS.length - 1}>
          <div className="progress-bar-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </nav>

      {/* Step Form */}
      <div className="card">
        <div style={{ marginBottom: "var(--space-6)" }}>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span aria-hidden="true">{STEPS[step].icon}</span> {STEPS[step].label}
          </h2>
          <p style={{ color: "var(--text-muted)" }}>{STEPS[step].desc}</p>
        </div>

        {/* Step 0: Transportation */}
        {step === 0 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Transportation details</legend>
            <div className="form-group">
              <label htmlFor="carType" className="form-label">Car type</label>
              <select id="carType" className="form-select" value={input.transportation.carType} onChange={(e) => updateTransport("carType", e.target.value)}>
                <option value="none">No car</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="carKm" className="form-label">Car distance per week (km): <strong>{input.transportation.carKmPerWeek}</strong></label>
              <input id="carKm" type="range" min={0} max={1000} step={10} value={input.transportation.carKmPerWeek} onChange={(e) => updateTransport("carKmPerWeek", +e.target.value)} className="form-range" aria-valuemin={0} aria-valuemax={1000} aria-valuenow={input.transportation.carKmPerWeek} />
            </div>
            <div className="form-group">
              <label htmlFor="flights" className="form-label">Flights per year: <strong>{input.transportation.flightsPerYear}</strong></label>
              <input id="flights" type="range" min={0} max={30} step={1} value={input.transportation.flightsPerYear} onChange={(e) => updateTransport("flightsPerYear", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="publicKm" className="form-label">Public transport per week (km): <strong>{input.transportation.publicTransportKmPerWeek}</strong></label>
              <input id="publicKm" type="range" min={0} max={500} step={5} value={input.transportation.publicTransportKmPerWeek} onChange={(e) => updateTransport("publicTransportKmPerWeek", +e.target.value)} className="form-range" />
            </div>
          </fieldset>
        )}

        {/* Step 1: Energy */}
        {step === 1 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Home energy details</legend>
            <div className="form-group">
              <label htmlFor="electricity" className="form-label">Electricity (kWh/month): <strong>{input.energy.electricityKwhPerMonth}</strong></label>
              <input id="electricity" type="range" min={0} max={2000} step={10} value={input.energy.electricityKwhPerMonth} onChange={(e) => updateEnergy("electricityKwhPerMonth", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="heatingType" className="form-label">Heating type</label>
              <select id="heatingType" className="form-select" value={input.energy.heatingType} onChange={(e) => updateEnergy("heatingType", e.target.value)}>
                <option value="gas">Natural Gas</option>
                <option value="electric">Electric</option>
                <option value="oil">Oil/LPG</option>
                <option value="heat-pump">Heat Pump</option>
                <option value="solar">Solar</option>
                <option value="none">None/Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="renewable" className="form-label">Renewable energy %: <strong>{input.energy.renewablePercentage}%</strong></label>
              <input id="renewable" type="range" min={0} max={100} step={5} value={input.energy.renewablePercentage} onChange={(e) => updateEnergy("renewablePercentage", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="household" className="form-label">Household size: <strong>{input.energy.householdSize} people</strong></label>
              <input id="household" type="range" min={1} max={10} step={1} value={input.energy.householdSize} onChange={(e) => updateEnergy("householdSize", +e.target.value)} className="form-range" />
            </div>
          </fieldset>
        )}

        {/* Step 2: Food */}
        {step === 2 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Food and diet details</legend>
            <div className="form-group">
              <label htmlFor="diet" className="form-label">Diet type</label>
              <select id="diet" className="form-select" value={input.food.dietType} onChange={(e) => updateFood("dietType", e.target.value)}>
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="flexitarian">Flexitarian</option>
                <option value="omnivore">Omnivore</option>
                <option value="heavy-meat">High Meat Eater</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="foodWaste" className="form-label">Food wasted: <strong>{input.food.foodWastePercentage}%</strong></label>
              <input id="foodWaste" type="range" min={0} max={60} step={5} value={input.food.foodWastePercentage} onChange={(e) => updateFood("foodWastePercentage", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="local" className="form-label">Local/seasonal food: <strong>{input.food.localFoodPercentage}%</strong></label>
              <input id="local" type="range" min={0} max={100} step={5} value={input.food.localFoodPercentage} onChange={(e) => updateFood("localFoodPercentage", +e.target.value)} className="form-range" />
            </div>
          </fieldset>
        )}

        {/* Step 3: Shopping */}
        {step === 3 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Shopping habits</legend>
            <div className="form-group">
              <label htmlFor="clothing" className="form-label">New clothing items/month: <strong>{input.shopping.clothingItemsPerMonth}</strong></label>
              <input id="clothing" type="range" min={0} max={20} step={1} value={input.shopping.clothingItemsPerMonth} onChange={(e) => updateShopping("clothingItemsPerMonth", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="electronics" className="form-label">Electronics per year: <strong>{input.shopping.electronicsPerYear}</strong></label>
              <input id="electronics" type="range" min={0} max={10} step={1} value={input.shopping.electronicsPerYear} onChange={(e) => updateShopping("electronicsPerYear", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="online" className="form-label">Online orders/week: <strong>{input.shopping.onlineOrdersPerWeek}</strong></label>
              <input id="online" type="range" min={0} max={20} step={1} value={input.shopping.onlineOrdersPerWeek} onChange={(e) => updateShopping("onlineOrdersPerWeek", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="secondHand" className="form-label">Second-hand purchases: <strong>{input.shopping.secondHandPercentage}%</strong></label>
              <input id="secondHand" type="range" min={0} max={100} step={5} value={input.shopping.secondHandPercentage} onChange={(e) => updateShopping("secondHandPercentage", +e.target.value)} className="form-range" />
            </div>
          </fieldset>
        )}

        {/* Step 4: Water */}
        {step === 4 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Water usage</legend>
            <div className="form-group">
              <label htmlFor="showers" className="form-label">Showers per week: <strong>{input.water.showersPerWeek}</strong></label>
              <input id="showers" type="range" min={0} max={14} step={1} value={input.water.showersPerWeek} onChange={(e) => updateWater("showersPerWeek", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="showerDuration" className="form-label">Shower duration: <strong>{input.water.showerDurationMinutes} min</strong></label>
              <input id="showerDuration" type="range" min={1} max={30} step={1} value={input.water.showerDurationMinutes} onChange={(e) => updateWater("showerDurationMinutes", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="laundry" className="form-label">Laundry loads/week: <strong>{input.water.laundryLoadsPerWeek}</strong></label>
              <input id="laundry" type="range" min={0} max={14} step={1} value={input.water.laundryLoadsPerWeek} onChange={(e) => updateWater("laundryLoadsPerWeek", +e.target.value)} className="form-range" />
            </div>
          </fieldset>
        )}

        {/* Step 5: Waste */}
        {step === 5 && (
          <fieldset style={{ border: "none", padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <legend className="sr-only">Waste habits</legend>
            <div className="form-group">
              <label htmlFor="recycling" className="form-label">Recycling rate: <strong>{input.waste.recyclingRate}%</strong></label>
              <input id="recycling" type="range" min={0} max={90} step={5} value={input.waste.recyclingRate} onChange={(e) => updateWaste("recyclingRate", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group">
              <label htmlFor="wasteKg" className="form-label">Waste per week: <strong>{input.waste.wasteKgPerWeek} kg</strong></label>
              <input id="wasteKg" type="range" min={1} max={30} step={0.5} value={input.waste.wasteKgPerWeek} onChange={(e) => updateWaste("wasteKgPerWeek", +e.target.value)} className="form-range" />
            </div>
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center" }}>
              <input
                id="composting"
                type="checkbox"
                checked={input.waste.compostingEnabled}
                onChange={(e) => updateWaste("compostingEnabled", e.target.checked)}
                style={{ width: 20, height: 20, accentColor: "var(--color-primary)", cursor: "pointer" }}
                aria-describedby="composting-desc"
              />
              <label htmlFor="composting" className="form-label" style={{ margin: 0, cursor: "pointer" }}>I compost organic waste</label>
              <span id="composting-desc" className="sr-only">Composting reduces landfill emissions significantly</span>
            </div>
          </fieldset>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "var(--space-8)", alignItems: "center" }}>
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn btn-secondary"
            aria-label="Previous step"
          >
            <ChevronLeft size={16} aria-hidden="true" /> Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn btn-primary" aria-label="Next step">
              Next <ChevronRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="btn btn-primary" aria-label="Calculate my carbon footprint">
              {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              {saving ? "Calculating..." : "Calculate Footprint"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
