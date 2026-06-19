"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useAuthContext } from "@/context/AuthContext";
import { formatCo2 } from "@/lib/carbon/calculator";
import type { Goal } from "@/types";
import { Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = ["overall", "transportation", "energy", "food", "shopping", "water", "waste"] as const;

const CAT_ICONS: Record<string, string> = {
  overall: "🌍", transportation: "🚗", energy: "⚡", food: "🥗", shopping: "🛍️", water: "💧", waste: "♻️",
};

export default function GoalsPage() {
  const { user } = useAuthContext();
  const { goals, activeGoals, completedGoals, totalCarbonSaved, loading, addGoal, editGoal, removeGoal } = useGoals();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    title: "",
    description: "",
    category: "overall" as Goal["category"],
    targetReduction: 100,
    targetDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    await addGoal({
      userId: user.uid,
      title: form.title,
      description: form.description,
      category: form.category,
      targetReduction: form.targetReduction,
      targetDate: new Date(form.targetDate),
      startDate: new Date(),
      currentProgress: 0,
      status: "active",
      milestones: [],
      carbonSaved: 0,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ title: "", description: "", category: "overall", targetReduction: 100, targetDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") });
  };

  const markComplete = async (goal: Goal) => {
    await editGoal(goal.id, { status: "completed", currentProgress: goal.targetReduction });
  };

  if (loading) {
    return (
      <div className="cards-grid">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-xl)" }} />)}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">🎯 Smart Goals</h1>
          <p className="page-subtitle">Set meaningful carbon reduction targets and track your progress.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" aria-label="Create a new goal">
          <Plus size={16} aria-hidden="true" /> New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Active Goals", value: activeGoals.length.toString(), icon: "🎯" },
          { label: "Completed", value: completedGoals.length.toString(), icon: "✅" },
          { label: "Carbon Saved", value: formatCo2(totalCarbonSaved), icon: "💚" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${s.label}: ${s.value}`}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }} aria-hidden="true">{s.icon}</div>
            <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <section aria-label="Active goals" style={{ marginBottom: "var(--space-8)" }}>
          <h2 className="section-title">Active Goals</h2>
          <div className="cards-grid">
            {activeGoals.map((goal) => {
              const pct = Math.min(100, goal.targetReduction > 0 ? (goal.currentProgress / goal.targetReduction) * 100 : 0);
              return (
                <article key={goal.id} className="card" style={{ position: "relative" }} aria-label={`Goal: ${goal.title}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ fontSize: 28 }} aria-hidden="true">{CAT_ICONS[goal.category] ?? "🌍"}</div>
                      <div>
                        <div style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-base)" }}>{goal.title}</div>
                        <div className="badge badge-green" style={{ marginTop: "var(--space-1)" }}>{goal.category}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button onClick={() => markComplete(goal)} className="btn btn-ghost btn-icon" aria-label={`Mark ${goal.title} as complete`} title="Mark complete">
                        <CheckCircle size={16} style={{ color: "var(--color-primary)" }} aria-hidden="true" />
                      </button>
                      <button onClick={() => removeGoal(goal.id)} className="btn btn-ghost btn-icon" aria-label={`Delete ${goal.title}`} title="Delete goal">
                        <Trash2 size={16} style={{ color: "var(--color-error)" }} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {goal.description && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-4)" }}>{goal.description}</p>}

                  {/* Progress */}
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)", marginBottom: "var(--space-2)" }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-primary)" }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${pct.toFixed(0)}% complete`}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                    <span>Target: {formatCo2(goal.targetReduction)} reduction</span>
                    <span>Due: {format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <section aria-label="Completed goals">
          <h2 className="section-title">✅ Completed Goals</h2>
          <div className="cards-grid">
            {completedGoals.map((goal) => (
              <article key={goal.id} className="card" style={{ opacity: 0.7, borderColor: "var(--color-primary-200)" }} aria-label={`Completed goal: ${goal.title}`}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <div style={{ fontSize: 28 }} aria-hidden="true">✅</div>
                    <div>
                      <div style={{ fontWeight: "var(--weight-bold)" }}>{goal.title}</div>
                      <div className="badge badge-green">{formatCo2(goal.carbonSaved)} saved</div>
                    </div>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="btn btn-ghost btn-icon" aria-label={`Delete completed goal ${goal.title}`}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div style={{ textAlign: "center", padding: "var(--space-20)" }}>
          <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">🎯</div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-4)" }}>Set your first goal</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-8)" }}>Goals help you stay accountable and measure real impact on your carbon footprint.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-lg">Create Your First Goal</button>
        </div>
      )}

      {/* Create Goal Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">Create New Goal</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon" aria-label="Close modal">✕</button>
            </div>

            <form onSubmit={handleCreate} noValidate>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label htmlFor="goal-title" className="form-label required">Goal title</label>
                <input id="goal-title" type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="form-input" placeholder="e.g., Reduce car usage by 30%" required aria-required="true" />
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label htmlFor="goal-desc" className="form-label">Description (optional)</label>
                <textarea id="goal-desc" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="form-textarea" rows={2} placeholder="How will you achieve this goal?" />
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label htmlFor="goal-cat" className="form-label required">Category</label>
                <select id="goal-cat" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Goal["category"] }))} className="form-select" required>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
                <label htmlFor="goal-target" className="form-label">CO₂ reduction target: <strong>{form.targetReduction} kg</strong></label>
                <input id="goal-target" type="range" min={10} max={5000} step={10} value={form.targetReduction} onChange={(e) => setForm((p) => ({ ...p, targetReduction: +e.target.value }))} className="form-range" aria-valuemin={10} aria-valuemax={5000} aria-valuenow={form.targetReduction} />
              </div>
              <div className="form-group" style={{ marginBottom: "var(--space-6)" }}>
                <label htmlFor="goal-date" className="form-label required">Target date</label>
                <input id="goal-date" type="date" value={form.targetDate} onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))} className="form-input" required aria-required="true" min={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={saving || !form.title} className="btn btn-primary">
                  {saving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null}
                  {saving ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
