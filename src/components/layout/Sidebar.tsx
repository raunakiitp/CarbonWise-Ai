"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useThemeContext } from "@/context/ThemeContext";
import { useAuthContext } from "@/context/AuthContext";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Target,
  Leaf,
  MapPin,
  Camera,
  Users,
  BookOpen,
  FileText,
  LogOut,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/analyzer", icon: BarChart3, label: "Carbon Analyzer" },
    ],
  },
  {
    section: "AI Features",
    items: [
      { href: "/coach", icon: MessageSquare, label: "Eco Coach" },
      { href: "/predictions", icon: TrendingUp, label: "Predictions" },
      { href: "/scanner", icon: Camera, label: "Receipt Scanner" },
    ],
  },
  {
    section: "Actions",
    items: [
      { href: "/goals", icon: Target, label: "Smart Goals" },
      { href: "/actions", icon: Leaf, label: "Green Actions" },
      { href: "/community", icon: Users, label: "Community" },
    ],
  },
  {
    section: "Discover",
    items: [
      { href: "/map", icon: MapPin, label: "Eco Map" },
      { href: "/education", icon: BookOpen, label: "Education Hub" },
      { href: "/reports", icon: FileText, label: "Reports" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { toggleTheme, isDark } = useThemeContext();
  const { user, profile } = useAuthContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 250 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={`sidebar${mobileOpen ? " open" : ""}`}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Logo */}
        <Link href="/dashboard" className="sidebar-logo" onClick={() => setMobileOpen(false)}>
          <div className="sidebar-logo-icon">🌿</div>
          <span className="sidebar-logo-text">
            Carbon<span>Wise</span> AI
          </span>
        </Link>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="nav-section-title">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item${isActive(item.href) ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <span className="nav-item-icon">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
              background: "var(--bg-muted)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--space-3)",
            }}
          >
            <div
              className="user-avatar"
              style={{ width: 32, height: 32, fontSize: "var(--text-xs)" }}
            >
              {profile?.photoURL ? (
                <Image src={profile.photoURL} alt={profile.displayName ?? "User avatar"} width={32} height={32} style={{ borderRadius: "50%" }} />
              ) : (
                (profile?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? "U").toUpperCase()
              )}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--text-primary)",
                }}
                className="truncate"
              >
                {profile?.displayName ?? "User"}
              </div>
              <div
                style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}
                className="truncate"
              >
                {profile?.level ?? "Beginner"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-icon"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{ flex: 1 }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href="/settings"
              className="btn btn-ghost btn-icon"
              aria-label="Settings"
              style={{ flex: 1, display: "flex", justifyContent: "center" }}
            >
              <Settings size={16} />
            </Link>
            <button
              onClick={handleSignOut}
              className="btn btn-ghost btn-icon"
              aria-label="Sign out"
              style={{ flex: 1 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-icon"
        style={{
          display: "none",
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 200,
          background: "var(--color-primary)",
          color: "white",
          borderRadius: "50%",
          width: 52,
          height: 52,
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
      >
        ☰
      </button>
    </>
  );
}
