"use client";

import { useAuthContext } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analyzer": "Carbon Analyzer",
  "/coach": "Eco Coach",
  "/predictions": "Carbon Predictions",
  "/goals": "Smart Goals",
  "/actions": "Green Actions",
  "/map": "Eco Map",
  "/scanner": "Receipt Scanner",
  "/community": "Community Challenges",
  "/education": "Education Hub",
  "/reports": "Monthly Reports",
};

export function TopBar() {
  const { user, profile } = useAuthContext();
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "CarbonWise AI";

  return (
    <header className="topbar" role="banner">
      <div>
        <h1
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      <div className="topbar-actions">
        {/* Sustainability Score Badge */}
        {profile && profile.sustainabilityScore > 0 && (
          <div
            className="badge badge-green"
            aria-label={`Sustainability score: ${profile.sustainabilityScore} out of 100`}
          >
            🌿 {profile.sustainabilityScore}/100
          </div>
        )}

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon"
          aria-label="Notifications"
          style={{ position: "relative" }}
        >
          <Bell size={18} aria-hidden="true" />
          <span
            className="notification-dot"
            style={{ position: "absolute", top: 6, right: 6 }}
            role="status"
            aria-label="New notifications"
          />
        </button>

        {/* User Avatar */}
        <Link href="/settings" aria-label="Account settings">
          <div
            className="user-avatar"
            role="img"
            aria-label={`User avatar for ${profile?.displayName ?? user?.email}`}
          >
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                alt={profile.displayName ?? "User avatar"}
                width={36}
                height={36}
                style={{ borderRadius: "50%" }}
              />
            ) : (
              (profile?.displayName?.charAt(0) ?? user?.email?.charAt(0) ?? "U").toUpperCase()
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
