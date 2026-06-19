"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAccount, signInWithGoogle } from "@/lib/firebase/auth";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = [
    { label: "At least 8 characters", ok: form.password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(form.password) },
    { label: "Passwords match", ok: form.password === form.confirmPassword && form.password !== "" },
  ];
  const valid = passwordChecks.every((c) => c.ok) && form.name && form.email;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await createAccount(form.email, form.password, form.name);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(
        msg.includes("email-already-in-use")
          ? "An account with this email already exists."
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("popup-closed")) {
        setError("Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0f1e 0%, #0d2a1a 50%, #0f172a 100%)",
        padding: "var(--space-8)",
      }}
      role="main"
    >
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-10)",
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-8)", textDecoration: "none" }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg, #16a34a, #15803d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🌿</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-xl)", color: "white" }}>CarbonWise AI</span>
        </Link>

        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-extrabold)", color: "white", marginBottom: "var(--space-2)" }}>Start your journey</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "var(--space-8)" }}>Join thousands reducing their carbon footprint</p>

        {/* Google */}
        <button onClick={handleGoogleSignUp} disabled={googleLoading} className="btn" style={{ width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white", marginBottom: "var(--space-6)" }}>
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : (
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          )}
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "var(--text-xs)" }}>or create with email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {error && <div role="alert" className="alert alert-error" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", marginBottom: "var(--space-4)" }}>⚠️ {error}</div>}

        <form onSubmit={handleRegister} noValidate>
          {[
            { id: "name", label: "Full name", type: "text", value: form.name, placeholder: "Jane Doe", autoComplete: "name" },
            { id: "email", label: "Email address", type: "email", value: form.email, placeholder: "you@example.com", autoComplete: "email" },
          ].map((field) => (
            <div key={field.id} className="form-group" style={{ marginBottom: "var(--space-4)" }}>
              <label htmlFor={field.id} style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "var(--space-2)" }}>{field.label}</label>
              <input id={field.id} type={field.type} value={field.value} autoComplete={field.autoComplete} onChange={(e) => setForm((p) => ({ ...p, [field.id]: e.target.value }))} className="form-input" placeholder={field.placeholder} required style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }} />
            </div>
          ))}

          <div className="form-group" style={{ marginBottom: "var(--space-2)" }}>
            <label htmlFor="password" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "var(--space-2)" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="form-input" placeholder="••••••••" autoComplete="new-password" required style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "white", paddingRight: "var(--space-10)" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="confirmPassword" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "var(--space-2)" }}>Confirm password</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="form-input" placeholder="••••••••" autoComplete="new-password" required style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }} />
          </div>

          {/* Password checks */}
          <ul style={{ listStyle: "none", marginBottom: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }} aria-label="Password requirements">
            {passwordChecks.map((check) => (
              <li key={check.label} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "var(--text-xs)", color: check.ok ? "#4ade80" : "rgba(255,255,255,0.4)" }}>
                <Check size={12} aria-hidden="true" />
                {check.label}
              </li>
            ))}
          </ul>

          <button type="submit" disabled={loading || !valid} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "var(--space-6)", color: "rgba(255,255,255,0.4)", fontSize: "var(--text-sm)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#4ade80", fontWeight: "var(--weight-semibold)" }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
