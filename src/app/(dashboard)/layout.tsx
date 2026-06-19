"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
            }}
          >
            🌿
          </div>
          <div className="spinner spinner-lg" style={{ margin: "0 auto" }} />
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Loading CarbonWise AI...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="page-content" style={{ flex: 1 }}>
        <TopBar />
        <main id="main-content" role="main" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  );
}
