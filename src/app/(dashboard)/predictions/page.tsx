"use client";

import { useMemo } from "react";
import { useCarbonData } from "@/hooks/useCarbonData";
import { generatePredictions } from "@/lib/carbon/predictor";
import { formatCo2 } from "@/lib/carbon/calculator";
import { useAuthContext } from "@/context/AuthContext";
import { GLOBAL_AVERAGES } from "@/constants/emissions";
import { TrendingDown, TrendingUp, Info } from "lucide-react";

export default function PredictionsPage() {
  const { user } = useAuthContext();
  const { latest, history, loading } = useCarbonData();

  const prediction = useMemo(() => {
    if (!latest || !user) return null;
    const historical = history.map((r, i) => ({
      month: `month-${i}`,
      total: r.totalMonthlyCo2,
    }));
    return generatePredictions(user.uid, latest.totalMonthlyCo2, historical);
  }, [latest, history, user]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 48, width: 300, borderRadius: "var(--radius-lg)", marginBottom: "var(--space-4)" }} />
        <div className="skeleton" style={{ height: 300, borderRadius: "var(--radius-xl)" }} />
      </div>
    );
  }

  if (!latest) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-20)" }}>
        <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">🔮</div>
        <h1 className="page-title">Carbon Predictions</h1>
        <p className="page-subtitle" style={{ marginBottom: "var(--space-8)" }}>
          Complete your carbon analysis first to see future predictions.
        </p>
        <a href="/analyzer" className="btn btn-primary">Start Analysis</a>
      </div>
    );
  }

  const yearEndBau = prediction?.scenarioBau[11]?.predicted ?? 0;
  
  const potentialSaving = prediction?.yearlyReductionPotential ?? 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="page-header">
        <h1 className="page-title">🔮 Carbon Predictions</h1>
        <p className="page-subtitle">
          AI-powered 12-month forecast based on your current lifestyle.
          Confidence: {((prediction?.confidenceScore ?? 0) * 100).toFixed(0)}%
        </p>
      </div>

      {/* Key insights */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        <div className="stat-card" aria-label="Current monthly emissions">
          <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">📊</div>
          <div className="kpi-value">{formatCo2(latest.totalMonthlyCo2)}</div>
          <div className="kpi-label">Current Monthly</div>
        </div>
        <div className="stat-card" aria-label="Projected monthly in 12 months">
          <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">📈</div>
          <div className="kpi-value" style={{ color: yearEndBau > latest.totalMonthlyCo2 ? "var(--color-rose)" : "var(--color-primary)" }}>
            {formatCo2(yearEndBau)}
          </div>
          <div className="kpi-label">Projected (12 months)</div>
          <span className={`kpi-change ${yearEndBau < latest.totalMonthlyCo2 ? "positive" : "negative"}`} aria-label={yearEndBau < latest.totalMonthlyCo2 ? "Decreasing trend" : "Increasing trend"}>
            {yearEndBau < latest.totalMonthlyCo2 ? <TrendingDown size={10} aria-hidden="true" /> : <TrendingUp size={10} aria-hidden="true" />}
            {Math.abs(((yearEndBau - latest.totalMonthlyCo2) / latest.totalMonthlyCo2) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="stat-card" aria-label="Potential savings">
          <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">💚</div>
          <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{formatCo2(potentialSaving)}</div>
          <div className="kpi-label">Potential Annual Savings</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>With AI recommendations</div>
        </div>
        <div className="stat-card" aria-label="Paris climate target comparison">
          <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">🎯</div>
          <div className="kpi-value">{formatCo2(GLOBAL_AVERAGES.parisTarget / 12)}</div>
          <div className="kpi-label">Paris Target/Month</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>2 tonnes/year goal</div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <h2 className="section-title">12-Month Forecast</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }} role="table" aria-label="12-month carbon forecast">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                <th scope="col" style={{ textAlign: "left", padding: "var(--space-3)", color: "var(--text-muted)", fontWeight: "var(--weight-semibold)" }}>Month</th>
                <th scope="col" style={{ textAlign: "right", padding: "var(--space-3)", color: "var(--text-muted)", fontWeight: "var(--weight-semibold)" }}>BAU Forecast</th>
                <th scope="col" style={{ textAlign: "right", padding: "var(--space-3)", color: "var(--color-primary)", fontWeight: "var(--weight-semibold)" }}>With Actions</th>
                <th scope="col" style={{ textAlign: "right", padding: "var(--space-3)", color: "var(--text-muted)", fontWeight: "var(--weight-semibold)" }}>Savings</th>
              </tr>
            </thead>
            <tbody>
              {prediction?.scenarioBau.map((bau, i) => {
                const opt = prediction.scenarioOptimistic[i];
                const saving = bau.predicted - (opt?.predicted ?? 0);
                return (
                  <tr key={bau.month} style={{ borderBottom: "1px solid var(--border-muted)", transition: "background var(--transition-fast)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "var(--space-3)", color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}>{bau.month}</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "right", color: "var(--text-secondary)" }}>{formatCo2(bau.predicted)}</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "right", color: "var(--color-primary)", fontWeight: "var(--weight-semibold)" }}>{formatCo2(opt?.predicted ?? 0)}</td>
                    <td style={{ padding: "var(--space-3)", textAlign: "right", color: saving > 0 ? "var(--color-primary)" : "var(--text-muted)" }}>
                      {saving > 0 ? `↓ ${formatCo2(saving)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action items */}
      <div className="card" style={{ background: "linear-gradient(135deg, var(--color-primary-50), var(--bg-surface))" }}>
        <h2 className="section-title">🚀 Unlock the Optimistic Scenario</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
          Take these actions to achieve the green forecast and save {formatCo2(potentialSaving)} per year:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
          {[
            { action: "Switch to public transport 2x/week", saving: "~120kg CO₂/yr", icon: "🚌" },
            { action: "Reduce meat meals by 2/week", saving: "~90kg CO₂/yr", icon: "🥗" },
            { action: "Enable 20% renewable energy", saving: "~140kg CO₂/yr", icon: "☀️" },
            { action: "Halve online shopping deliveries", saving: "~25kg CO₂/yr", icon: "📦" },
          ].map((item) => (
            <div key={item.action} style={{ padding: "var(--space-4)", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-primary-200)" }}>
              <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }} aria-hidden="true">{item.icon}</div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginBottom: "var(--space-1)" }}>{item.action}</div>
              <div className="badge badge-green">{item.saving}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "var(--space-3)" }}>
          <a href="/goals" className="btn btn-primary">Set Reduction Goals</a>
          <a href="/coach" className="btn btn-secondary">Ask Eco Coach</a>
        </div>
      </div>
    </div>
  );
}
