"use client";

import { useState } from "react";
import { useActions } from "@/hooks/useActions";
import { formatCo2 } from "@/lib/carbon/calculator";
import { ACTION_SAVINGS } from "@/constants/emissions";
import type { ActionType } from "@/types";
import { Loader2, Flame } from "lucide-react";
import { format } from "date-fns";

const ACTION_DEFS: { type: ActionType; icon: string; label: string; desc: string; unit?: string }[] = [
  { type: "cycling", icon: "🚴", label: "Cycling", desc: "Cycling instead of driving", unit: "km" },
  { type: "walking", icon: "🚶", label: "Walking", desc: "Walking instead of driving", unit: "km" },
  { type: "public-transport", icon: "🚌", label: "Public Transport", desc: "Used bus/train today", unit: undefined },
  { type: "tree-planting", icon: "🌳", label: "Tree Planting", desc: "Trees planted", unit: "trees" },
  { type: "recycling", icon: "♻️", label: "Recycling", desc: "Recycling session", unit: undefined },
  { type: "meatless-meal", icon: "🥗", label: "Meatless Meal", desc: "Skipped meat this meal", unit: undefined },
  { type: "energy-saving", icon: "💡", label: "Energy Saving", desc: "Energy saved (kWh)", unit: "kWh" },
  { type: "reusable-bag", icon: "👜", label: "Reusable Bag", desc: "Used reusable bag", unit: undefined },
  { type: "cold-wash", icon: "🧺", label: "Cold Wash", desc: "Cold laundry wash", unit: undefined },
  { type: "local-food", icon: "🥕", label: "Local Food", desc: "Bought local/seasonal food", unit: undefined },
];

export default function ActionsPage() {
  const { actions, streaks, totalCarbonSaved, totalActions, loading, logAction } = useActions();
  const [logging, setLogging] = useState<ActionType | null>(null);
  const [value, setValue] = useState<number>(1);
  const [notes, setNotes] = useState("");

  const handleLog = async (type: ActionType) => {
    setLogging(type);
    await logAction(type, value, notes || undefined);
    setLogging(null);
    setValue(1);
    setNotes("");
  };

  if (loading) {
    return (
      <div className="cards-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-xl)" }} />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌱 Green Actions</h1>
        <p className="page-subtitle">Log your eco-friendly actions and track your cumulative impact.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Total Actions", value: totalActions.toString(), icon: "✅" },
          { label: "Carbon Saved", value: formatCo2(totalCarbonSaved), icon: "💚" },
          { label: "Longest Streak", value: `${Math.max(0, ...Object.values(streaks).map((s) => s.longestStreak))} days`, icon: "🔥" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${s.label}: ${s.value}`}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }} aria-hidden="true">{s.icon}</div>
            <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <section aria-label="Log green actions">
        <h2 className="section-title">Log an Action</h2>
        <div className="cards-grid">
          {ACTION_DEFS.map((def) => {
            const streak = streaks[def.type];
            const saving = ACTION_SAVINGS[def.type] ?? 0;
            const isLogging = logging === def.type;
            return (
              <article
                key={def.type}
                className="card"
                style={{ cursor: "pointer", transition: "all var(--transition-base)" }}
                aria-label={`Log action: ${def.label}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
                  <div style={{ fontSize: 36 }} aria-hidden="true">{def.icon}</div>
                  {streak && streak.currentStreak > 0 && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-amber)", fontSize: "var(--text-xs)", fontWeight: "var(--weight-bold)" }}
                      aria-label={`${streak.currentStreak} day streak`}
                    >
                      <Flame size={14} aria-hidden="true" />
                      {streak.currentStreak}d
                    </div>
                  )}
                </div>
                <h3 style={{ fontWeight: "var(--weight-bold)", marginBottom: "var(--space-1)" }}>{def.label}</h3>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-3)" }}>{def.desc}</p>

                {saving > 0 && (
                  <div className="badge badge-green" style={{ marginBottom: "var(--space-3)" }}>
                    ~{saving}kg CO₂ {def.unit ? `per ${def.unit}` : "saved"}
                  </div>
                )}

                {def.unit && (
                  <div className="form-group" style={{ marginBottom: "var(--space-3)" }}>
                    <label htmlFor={`val-${def.type}`} className="form-label" style={{ fontSize: "var(--text-xs)" }}>
                      {def.unit}:
                    </label>
                    <input
                      id={`val-${def.type}`}
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={value}
                      onChange={(e) => setValue(+e.target.value)}
                      className="form-input"
                      style={{ fontSize: "var(--text-sm)" }}
                      aria-label={`Enter ${def.unit} for ${def.label}`}
                    />
                  </div>
                )}

                <button
                  onClick={() => handleLog(def.type)}
                  disabled={isLogging}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  aria-label={`Log ${def.label} action`}
                  aria-busy={isLogging}
                >
                  {isLogging ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {isLogging ? "Logging..." : "Log Action"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      {actions.length > 0 && (
        <section aria-label="Recent activity" style={{ marginTop: "var(--space-8)" }}>
          <h2 className="section-title">Recent Activity</h2>
          <div className="card">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {actions.slice(0, 15).map((action) => {
                const def = ACTION_DEFS.find((d) => d.type === action.actionType);
                return (
                  <div
                    key={action.id}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)", background: "var(--bg-muted)" }}
                    role="listitem"
                    aria-label={`${def?.label}: ${formatCo2(action.carbonSaved)} saved on ${format(new Date(action.date), "MMM d")}`}
                  >
                    <span style={{ fontSize: 24 }} aria-hidden="true">{def?.icon ?? "✅"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{def?.label ?? action.actionType}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{format(new Date(action.date), "MMM d, yyyy")}</div>
                    </div>
                    <div className="badge badge-green">{formatCo2(action.carbonSaved)} saved</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
