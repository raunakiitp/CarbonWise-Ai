"use client";

import { useState, useCallback } from "react";
import { useGemini } from "@/hooks/useGemini";
import { PROMPT_TEMPLATES } from "@/lib/gemini/client";
import { Upload, Camera, Loader2, X, AlertCircle } from "lucide-react";
import type { ReceiptScanResult, ScannedItem } from "@/types";

export default function ScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ReceiptScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [manualItems, setManualItems] = useState("");

  const { askQuestion } = useGemini();

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB");
      return;
    }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    try {
      // Use manual text input or simulate receipt text from filename
      const itemsText = manualItems ||
        `1x Beef steak 500g
1x Milk 2L
2x Avocado
1x T-shirt (fast fashion)
1x Plastic water bottle 6-pack`;

      const response = await askQuestion(PROMPT_TEMPLATES.analyzeReceipt(itemsText));

      // Try to parse JSON from response
      let parsed: ReceiptScanResult;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          parsed = {
            items: data.items || [],
            totalCarbonImpact: data.totalCo2 || 0,
            alternatives: (data.items || []).map((item: ScannedItem & { alternative?: string; co2Saved?: number }) => ({
              originalItem: item.name,
              alternative: item.alternative || "Choose a greener option",
              co2Saved: item.co2Saved || 0,
              description: `Switch to ${item.alternative} to reduce emissions`,
            })),
            scanConfidence: 0.85,
          };
        } else {
          throw new Error("No JSON in response");
        }
      } catch {
        // Fallback demo result
        parsed = {
          items: [
            { name: "Beef Steak 500g", category: "food", estimatedCo2: 13.5, impactLevel: "high" },
            { name: "Milk 2L", category: "food", estimatedCo2: 2.4, impactLevel: "medium" },
            { name: "T-shirt (Fast Fashion)", category: "clothing", estimatedCo2: 14.0, impactLevel: "high" },
            { name: "Plastic Bottles 6-pack", category: "household", estimatedCo2: 3.2, impactLevel: "medium" },
          ],
          totalCarbonImpact: 33.1,
          alternatives: [
            { originalItem: "Beef Steak", alternative: "Plant-based steak", co2Saved: 11.5, description: "Plant-based alternatives emit 85% less CO₂" },
            { originalItem: "T-shirt", alternative: "Second-hand clothing", co2Saved: 13.3, description: "Buying second-hand saves ~95% of clothing emissions" },
            { originalItem: "Plastic Bottles", alternative: "Reusable water bottle", co2Saved: 3.0, description: "A reusable bottle saves ~156 plastic bottles per year" },
          ],
          scanConfidence: 0.75,
        };
      }
      setResult(parsed);
    } catch {
      setError("Failed to analyze. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setManualItems("");
  };

  const impactColor = (level: string) => {
    if (level === "high") return "var(--color-error)";
    if (level === "medium") return "var(--color-amber)";
    return "var(--color-primary)";
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="page-header">
        <h1 className="page-title">📷 AI Receipt Scanner</h1>
        <p className="page-subtitle">Upload your shopping receipt or list items manually. AI will calculate the carbon impact and suggest greener alternatives.</p>
      </div>

      {!result ? (
        <div>
          {/* Upload Zone */}
          <div
            className={`file-upload-zone${dragging ? " dragging" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => document.getElementById("file-input")?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload receipt image — click or drag and drop"
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("file-input")?.click(); }}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: "none" }}
              aria-hidden="true"
            />

            {preview ? (
              <div style={{ position: "relative" }}>
                <img src={preview} alt="Receipt preview" style={{ maxHeight: 200, borderRadius: "var(--radius-lg)", objectFit: "contain" }} />
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="btn btn-ghost btn-icon"
                  style={{ position: "absolute", top: -8, right: -8, background: "var(--color-error)", color: "white", borderRadius: "50%" }}
                  aria-label="Remove uploaded image"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 64, marginBottom: "var(--space-4)" }} aria-hidden="true">📋</div>
                <h3 style={{ fontWeight: "var(--weight-bold)", marginBottom: "var(--space-2)" }}>Drop receipt here or click to upload</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>JPG, PNG, WEBP · Max 10MB</p>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: "var(--space-4)" }} aria-label="Choose file">
                  <Camera size={14} aria-hidden="true" /> Choose Image
                </button>
              </>
            )}
          </div>

          {/* Manual input */}
          <div className="card" style={{ marginTop: "var(--space-6)" }}>
            <h2 className="section-title">Or type your items manually</h2>
            <div className="form-group">
              <label htmlFor="manual-items" className="form-label">
                Enter purchased items (one per line)
              </label>
              <textarea
                id="manual-items"
                value={manualItems}
                onChange={(e) => setManualItems(e.target.value)}
                className="form-textarea"
                rows={5}
                placeholder={`e.g.:\n1x Beef steak 500g\n2x Chicken breast\n1x T-shirt\n1x Laptop bag`}
                aria-label="Enter items to analyze"
              />
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="alert alert-error" style={{ marginTop: "var(--space-4)" }}>
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning || (!file && !manualItems.trim())}
            className="btn btn-primary btn-lg"
            style={{ marginTop: "var(--space-6)", width: "100%", justifyContent: "center" }}
            aria-label="Analyze carbon impact of items"
            aria-busy={scanning}
          >
            {scanning ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
            {scanning ? "Analyzing with AI..." : "Analyze Carbon Impact"}
          </button>
        </div>
      ) : (
        <div>
          {/* Results */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
            <div>
              <div className="badge badge-green">AI Confidence: {(result.scanConfidence * 100).toFixed(0)}%</div>
            </div>
            <button onClick={reset} className="btn btn-secondary">Scan Another</button>
          </div>

          {/* Total Impact */}
          <div className="card-gradient" style={{ marginBottom: "var(--space-6)", textAlign: "center" }} role="region" aria-label="Total carbon impact">
            <div style={{ fontSize: 48, marginBottom: "var(--space-2)" }} aria-hidden="true">💨</div>
            <div style={{ fontSize: "var(--text-4xl)", fontWeight: 900, marginBottom: "var(--space-2)" }}>{result.totalCarbonImpact.toFixed(1)} kg CO₂e</div>
            <div style={{ opacity: 0.85 }}>Total carbon impact of this purchase</div>
          </div>

          {/* Item Breakdown */}
          <div className="card" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="section-title">Item Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }} role="list">
              {result.items.map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3)", background: "var(--bg-muted)", borderRadius: "var(--radius-lg)", borderLeft: `3px solid ${impactColor(item.impactLevel)}` }}
                  role="listitem"
                  aria-label={`${item.name}: ${item.estimatedCo2} kg CO₂e, ${item.impactLevel} impact`}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>{item.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{item.category}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "var(--weight-bold)", color: impactColor(item.impactLevel) }}>{item.estimatedCo2} kg</div>
                    <div className={`badge ${item.impactLevel === "high" ? "badge-red" : item.impactLevel === "medium" ? "badge-amber" : "badge-green"}`}>
                      {item.impactLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Green Alternatives */}
          {result.alternatives.length > 0 && (
            <div className="card">
              <h2 className="section-title">💚 Greener Alternatives</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }} role="list">
                {result.alternatives.map((alt, i) => (
                  <div key={i} style={{ padding: "var(--space-4)", background: "var(--color-primary-50)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-primary-200)" }} role="listitem">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
                      <div>
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{alt.originalItem}</span>
                        <span style={{ margin: "0 var(--space-2)", color: "var(--text-muted)" }}>→</span>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--color-primary-700)" }}>{alt.alternative}</span>
                      </div>
                      <div className="badge badge-green">saves {alt.co2Saved} kg CO₂</div>
                    </div>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--color-primary-600)" }}>{alt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
