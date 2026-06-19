"use client";

import { useCarbonData } from "@/hooks/useCarbonData";
import { useGoals } from "@/hooks/useGoals";
import { useActions } from "@/hooks/useActions";
import { useAuthContext } from "@/context/AuthContext";
import { formatCo2, getComparisonLabel } from "@/lib/carbon/calculator";
import { GLOBAL_AVERAGES } from "@/constants/emissions";
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Target, Leaf, Zap, Award } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/emissions";

export default function DashboardPage() {
  const { profile } = useAuthContext();
  const { latest, history, loading } = useCarbonData();
  const { activeGoals, totalCarbonSaved: goalCarbonSaved } = useGoals();
  const { totalCarbonSaved: actionCarbonSaved, totalActions } = useActions();

  const totalSaved = goalCarbonSaved + actionCarbonSaved;
  const monthly = latest?.totalMonthlyCo2 ?? 0;
  const annual = latest?.totalAnnualCo2 ?? 0;
  const score = latest?.sustainabilityScore ?? profile?.sustainabilityScore ?? 0;
  const comparison = latest?.comparisonToAverage ?? 0;

  const prevMonthly = history[1]?.totalMonthlyCo2 ?? 0;
  const monthlyChange = prevMonthly > 0 ? ((monthly - prevMonthly) / prevMonthly) * 100 : 0;

  if (loading) {
    return (
      <div style={{ padding: "var(--space-8)" }}>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: "var(--radius-xl)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--space-2) 0" }}>
      {/* Welcome Header */}
      <div className="page-header">
        <h1 className="page-title">
          Welcome back, {profile?.displayName?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="page-subtitle">
          {latest
            ? `Your sustainability score is ${score}/100. ${getComparisonLabel(comparison)}.`
            : "Start by completing your carbon footprint analysis below."}
        </p>
      </div>

      {/* KPI Cards */}
      <section aria-label="Key metrics" className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          {
            icon: "💨",
            label: "Monthly Emissions",
            value: latest ? formatCo2(monthly) : "—",
            sub: monthly > 0 ? `${formatCo2(annual)}/year` : "Not calculated",
            change: monthlyChange !== 0 ? monthlyChange : null,
            color: "var(--color-primary)",
          },
          {
            icon: "🏆",
            label: "Sustainability Score",
            value: latest ? `${score}/100` : "—",
            sub: latest ? getComparisonLabel(comparison) : "Complete analyzer",
            change: null,
            color: score >= 70 ? "var(--color-primary)" : score >= 40 ? "var(--color-amber)" : "var(--color-rose)",
          },
          {
            icon: "🌱",
            label: "Carbon Saved",
            value: totalSaved > 0 ? formatCo2(totalSaved) : "0 kg",
            sub: `${totalActions} eco actions logged`,
            change: null,
            color: "var(--color-accent)",
          },
          {
            icon: "🎯",
            label: "Active Goals",
            value: activeGoals.length.toString(),
            sub: activeGoals.length > 0 ? `${activeGoals[0]?.title}` : "No goals set",
            change: null,
            color: "var(--color-violet)",
          },
        ].map((kpi) => (
          <article key={kpi.label} className="stat-card" aria-label={`${kpi.label}: ${kpi.value}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div style={{ fontSize: 32 }} aria-hidden="true">{kpi.icon}</div>
              {kpi.change !== null && (
                <span
                  className={`kpi-change ${kpi.change < 0 ? "positive" : "negative"}`}
                  aria-label={`${Math.abs(kpi.change).toFixed(1)}% ${kpi.change < 0 ? "decrease" : "increase"} from last month`}
                >
                  {kpi.change < 0 ? <TrendingDown size={12} aria-hidden="true" /> : <TrendingUp size={12} aria-hidden="true" />}
                  {Math.abs(kpi.change).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="kpi-label" style={{ marginTop: "var(--space-1)" }}>{kpi.label}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>{kpi.sub}</div>
          </article>
        ))}
      </section>

      {/* Category Breakdown & Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        {/* Category Breakdown */}
        <section className="card" aria-label="Emission breakdown by category">
          <h2 className="section-title">Emission Breakdown</h2>
          {latest ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {Object.entries(latest.monthly)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, val]) => {
                  const pct = latest.totalMonthlyCo2 > 0 ? (val / latest.totalMonthlyCo2) * 100 : 0;
                  const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
                  const icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS];
                  return (
                    <div key={cat} aria-label={`${cat}: ${pct.toFixed(1)}%`}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)", fontSize: "var(--text-sm)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", textTransform: "capitalize" }}>
                          <span aria-hidden="true">{icon}</span>
                          {cat}
                        </span>
                        <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--text-primary)" }}>
                          {formatCo2(val)}
                        </span>
                      </div>
                      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: "var(--space-4)" }} aria-hidden="true">📊</div>
              <p style={{ marginBottom: "var(--space-4)" }}>No data yet. Complete your carbon analysis to see your breakdown.</p>
              <Link href="/analyzer" className="btn btn-primary">
                Start Analysis <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="card" aria-label="Quick actions">
          <h2 className="section-title">Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[
              { href: "/analyzer", icon: <Zap size={18} />, label: "Run Carbon Analysis", desc: "Update your footprint data", color: "var(--color-primary)" },
              { href: "/coach", icon: <span aria-hidden="true">🤖</span>, label: "Ask Eco Coach", desc: "Get AI-powered advice", color: "var(--color-accent)" },
              { href: "/actions", icon: <Leaf size={18} />, label: "Log Green Action", desc: "Track sustainable habits", color: "var(--color-primary-light)" },
              { href: "/goals", icon: <Target size={18} />, label: "Set a Goal", desc: "Create reduction targets", color: "var(--color-violet)" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--bg-muted)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition: "all var(--transition-base)",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-muted)";
                }}
                aria-label={action.label}
              >
                <div style={{ color: action.color, display: "flex" }} aria-hidden="true">{action.icon}</div>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)" }}>{action.label}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{action.desc}</div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: "auto", color: "var(--text-muted)" }} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Hotspots & Tips */}
      {latest && latest.hotspots.length > 0 && (
        <section className="card" aria-label="Emission hotspots and recommendations">
          <h2 className="section-title">🔥 Emission Hotspots</h2>
          <div className="cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            {latest.hotspots.slice(0, 3).map((h) => (
              <div
                key={h.category}
                style={{
                  padding: "var(--space-4)",
                  background: "var(--bg-muted)",
                  borderRadius: "var(--radius-lg)",
                  borderLeft: `3px solid ${CATEGORY_COLORS[h.category] ?? "var(--color-primary)"}`,
                }}
                role="article"
                aria-label={`${h.category} hotspot: ${h.severity} severity`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                  <span style={{ textTransform: "capitalize", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>
                    {CATEGORY_ICONS[h.category as keyof typeof CATEGORY_ICONS]} {h.category}
                  </span>
                  <span
                    className={`badge ${h.severity === "critical" ? "badge-red" : h.severity === "high" ? "badge-amber" : "badge-green"}`}
                    aria-label={`Severity: ${h.severity}`}
                  >
                    {h.severity}
                  </span>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{h.recommendation}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA if no data */}
      {!latest && (
        <section
          style={{
            background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))",
            borderRadius: "var(--radius-2xl)",
            padding: "var(--space-12)",
            textAlign: "center",
            color: "white",
          }}
          aria-label="Get started prompt"
        >
          <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">🌍</div>
          <h2 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", marginBottom: "var(--space-4)", color: "white" }}>
            Ready to make a difference?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "var(--space-8)", maxWidth: 500, margin: "0 auto var(--space-8)" }}>
            Take 5 minutes to complete your first carbon footprint analysis. Get personalized AI recommendations and start your sustainability journey.
          </p>
          <Link href="/analyzer" className="btn" style={{ background: "white", color: "var(--color-primary-700)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-base)", padding: "var(--space-4) var(--space-8)" }}>
            Calculate My Carbon Footprint <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}
