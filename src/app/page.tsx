"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" role="main">
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #0a0f1e 0%, #0d2a1a 40%, #0f172a 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "var(--space-20) var(--space-8)",
        }}
        aria-label="Hero section"
      >
        {/* Background decoration */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 25% 50%, rgba(22, 163, 74, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 400,
            height: 400,
            background: "rgba(22, 163, 74, 0.05)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                background: "rgba(22, 163, 74, 0.15)",
                border: "1px solid rgba(22, 163, 74, 0.3)",
                borderRadius: "var(--radius-full)",
                padding: "var(--space-2) var(--space-4)",
                marginBottom: "var(--space-8)",
                color: "#4ade80",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--weight-semibold)",
              }}
              aria-label="Powered by Google Gemini AI"
            >
              <span aria-hidden="true">✨</span>
              Powered by Google Gemini AI
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 900,
                color: "white",
                marginBottom: "var(--space-6)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                fontFamily: "var(--font-display)",
              }}
            >
              Your Personal{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Sustainability
              </span>{" "}
              Coach
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "var(--text-xl)",
                color: "rgba(255,255,255,0.65)",
                marginBottom: "var(--space-10)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Measure, understand, and reduce your carbon footprint with AI-powered
              personalized insights. Make sustainability simple, measurable, and
              rewarding.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/register"
                className="btn btn-primary btn-lg"
                aria-label="Get started with CarbonWise AI"
              >
                <span aria-hidden="true">🌿</span>
                Start for Free
              </Link>
              <Link
                href="/login"
                className="btn btn-secondary btn-lg"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                Sign In
              </Link>
            </div>

            {/* Social Proof */}
            <p
              style={{
                marginTop: "var(--space-8)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "var(--text-sm)",
              }}
            >
              🌍 Join 50,000+ people reducing their carbon footprint
            </p>
          </div>

          {/* Feature Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--space-6)",
              marginTop: "var(--space-20)",
            }}
            aria-label="Key features"
          >
            {[
              {
                icon: "🤖",
                title: "AI Eco Coach",
                desc: "Powered by Google Gemini for personalized guidance",
              },
              {
                icon: "📊",
                title: "Carbon Analytics",
                desc: "Detailed breakdowns with interactive charts",
              },
              {
                icon: "🎯",
                title: "Smart Goals",
                desc: "Set and track meaningful reduction targets",
              },
              {
                icon: "🏆",
                title: "Community",
                desc: "Join challenges and climb leaderboards",
              },
            ].map((f) => (
              <article
                key={f.title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-6)",
                  transition: "transform var(--transition-base), background var(--transition-base)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <div style={{ fontSize: 36, marginBottom: "var(--space-3)" }} aria-hidden="true">
                  {f.icon}
                </div>
                <h2
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: "var(--weight-bold)",
                    color: "white",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {f.title}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
                  {f.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
