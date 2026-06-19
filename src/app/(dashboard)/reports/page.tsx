"use client";

import { useState } from "react";
import { useCarbonData } from "@/hooks/useCarbonData";
import { useActions } from "@/hooks/useActions";
import { useGoals } from "@/hooks/useGoals";
import { useGemini } from "@/hooks/useGemini";
import { PROMPT_TEMPLATES } from "@/lib/gemini/client";
import { formatCo2 } from "@/lib/carbon/calculator";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/constants/emissions";
import { format } from "date-fns";
import { Download, FileText, Loader2, Sparkles } from "lucide-react";

export default function ReportsPage() {
  const { latest, history } = useCarbonData();
  const { totalCarbonSaved: actionSaved, totalActions } = useActions();
  const { completedGoals } = useGoals();
  const [generating, setGenerating] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);

  const { askQuestion } = useGemini();

  const currentMonth = format(new Date(), "MMMM yyyy");
  const prevMonth = history[1];

  const handleGenerateReport = async () => {
    if (!latest) return;
    setGenerating(true);
    const report = await askQuestion(
      PROMPT_TEMPLATES.generateReport({
        month: currentMonth,
        total: latest.totalMonthlyCo2,
        previousTotal: prevMonth?.totalMonthlyCo2 ?? latest.totalMonthlyCo2,
        categories: latest.monthly as unknown as Record<string, number>,
        actionsCount: totalActions,
        carbonSaved: actionSaved,
      })
    );
    setNarrative(report);
    setGenerating(false);
  };

  const handleExportCSV = () => {
    if (!latest) return;
    const rows = [
      ["Category", "Monthly (kg CO2e)", "Annual (kg CO2e)"],
      ...Object.entries(latest.monthly).map(([cat, val]) => [
        cat,
        val.toFixed(2),
        (val * 12).toFixed(2),
      ]),
      ["TOTAL", latest.totalMonthlyCo2.toFixed(2), latest.totalAnnualCo2.toFixed(2)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carbonwise-report-${format(new Date(), "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setTextColor(22, 163, 74);
      doc.text("CarbonWise AI — Sustainability Report", 20, 25);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Report for: ${currentMonth}`, 20, 40);
      doc.text(`Generated: ${format(new Date(), "PPP")}`, 20, 50);

      if (latest) {
        doc.setFontSize(16);
        doc.text("Carbon Footprint Summary", 20, 70);
        doc.setFontSize(12);
        doc.text(`Monthly Total: ${formatCo2(latest.totalMonthlyCo2)}`, 20, 85);
        doc.text(`Annual Total: ${formatCo2(latest.totalAnnualCo2)}`, 20, 95);
        doc.text(`Sustainability Score: ${latest.sustainabilityScore}/100`, 20, 105);

        doc.setFontSize(16);
        doc.text("Category Breakdown", 20, 125);
        let y = 140;
        for (const [cat, val] of Object.entries(latest.monthly)) {
          doc.setFontSize(12);
          doc.text(`${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${formatCo2(val)}/month`, 20, y);
          y += 12;
        }
      }

      if (narrative) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("AI Analysis", 20, 25);
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(narrative, 170);
        doc.text(lines, 20, 40);
      }

      doc.save(`carbonwise-report-${format(new Date(), "yyyy-MM")}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  };

  if (!latest) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-20)" }}>
        <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">📊</div>
        <h1 className="page-title">Monthly Reports</h1>
        <p className="page-subtitle" style={{ marginBottom: "var(--space-8)" }}>
          Complete your carbon analysis to generate detailed reports.
        </p>
        <a href="/analyzer" className="btn btn-primary">Start Analysis</a>
      </div>
    );
  }

  const changeFromLast = prevMonth
    ? ((latest.totalMonthlyCo2 - prevMonth.totalMonthlyCo2) / prevMonth.totalMonthlyCo2) * 100
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">📊 Monthly Reports</h1>
          <p className="page-subtitle">Detailed sustainability analysis for {currentMonth}</p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" aria-label="Export as CSV">
            <FileText size={14} aria-hidden="true" /> CSV
          </button>
          <button onClick={handleExportPDF} disabled={exportingPdf} className="btn btn-secondary btn-sm" aria-label="Export as PDF">
            {exportingPdf ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Monthly Emissions", value: formatCo2(latest.totalMonthlyCo2), icon: "💨", sub: changeFromLast !== 0 ? `${changeFromLast > 0 ? "+" : ""}${changeFromLast.toFixed(1)}% vs last month` : "First calculation" },
          { label: "Annual Projection", value: formatCo2(latest.totalAnnualCo2), icon: "📅", sub: "Based on current data" },
          { label: "Sustainability Score", value: `${latest.sustainabilityScore}/100`, icon: "🏆", sub: "Global position" },
          { label: "Actions Completed", value: totalActions.toString(), icon: "✅", sub: `${formatCo2(actionSaved)} CO₂ saved` },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${s.label}: ${s.value}`}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }} aria-hidden="true">{s.icon}</div>
            <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Category Table */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <h2 className="section-title">Category Breakdown</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }} role="table" aria-label="Emission category breakdown">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                {["Category", "Monthly", "Annual", "% of Total"].map((h) => (
                  <th key={h} scope="col" style={{ textAlign: h === "Category" ? "left" : "right", padding: "var(--space-3)", color: "var(--text-muted)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(latest.monthly).map(([cat, val]) => {
                const pct = latest.totalMonthlyCo2 > 0 ? (val / latest.totalMonthlyCo2) * 100 : 0;
                return (
                  <tr key={cat} style={{ borderBottom: "1px solid var(--border-muted)" }}>
                    <td style={{ padding: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS], flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: "var(--text-sm)", textTransform: "capitalize" }}>
                        {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {cat}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>{formatCo2(val)}</td>
                    <td style={{ textAlign: "right", padding: "var(--space-3)", fontSize: "var(--text-sm)" }}>{formatCo2(val * 12)}</td>
                    <td style={{ textAlign: "right", padding: "var(--space-3)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-primary)" }}>{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: "var(--bg-muted)" }}>
                <td style={{ padding: "var(--space-3)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-sm)" }}>TOTAL</td>
                <td style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-bold)" }}>{formatCo2(latest.totalMonthlyCo2)}</td>
                <td style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-bold)" }}>{formatCo2(latest.totalAnnualCo2)}</td>
                <td style={{ textAlign: "right", padding: "var(--space-3)", fontWeight: "var(--weight-bold)" }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Narrative */}
      <div className="card" style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <h2 className="section-title" style={{ margin: 0 }}>AI Report Narrative</h2>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="btn btn-primary btn-sm"
            aria-label="Generate AI narrative for this report"
            aria-busy={generating}
          >
            {generating ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
            {generating ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        {narrative ? (
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "var(--leading-relaxed)", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }} role="region" aria-label="AI generated report narrative">
            {narrative}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
            <Sparkles size={32} style={{ margin: "0 auto var(--space-3)" }} aria-hidden="true" />
            <p>Click &quot;Generate with AI&quot; to get a personalized narrative analysis of your sustainability performance this month.</p>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      {completedGoals.length > 0 && (
        <div className="card">
          <h2 className="section-title">Goals Completed This Period</h2>
          {completedGoals.map((goal) => (
            <div key={goal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3)", background: "var(--color-primary-50)", borderRadius: "var(--radius-lg)", marginBottom: "var(--space-2)" }}>
              <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)" }}>✅ {goal.title}</span>
              <span className="badge badge-green">{formatCo2(goal.carbonSaved)} saved</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
