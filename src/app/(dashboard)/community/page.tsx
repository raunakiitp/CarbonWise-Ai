"use client";

import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { joinChallenge, updateChallengeProgress } from "@/lib/firebase/firestore";
import type { CommunityChallenge } from "@/types";
import { Users, Trophy, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const CHALLENGES: CommunityChallenge[] = [
  {
    id: "no-car-week",
    title: "No-Car Week",
    description: "Go car-free for 7 days. Walk, cycle, or use public transport instead.",
    category: "Transportation",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetReduction: 35,
    participantsCount: 2847,
    badge: "🚗",
    difficulty: "medium",
    isActive: true,
  },
  {
    id: "plastic-free",
    title: "Plastic-Free Week",
    description: "Avoid single-use plastics for 7 days. Bring reusable bags, bottles, and containers.",
    category: "Consumption",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    targetReduction: 15,
    participantsCount: 5123,
    badge: "🌊",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "green-commute",
    title: "Green Commuter Challenge",
    description: "Take the green route to work for 30 days. Reduce your commute emissions by 50%.",
    category: "Transportation",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    targetReduction: 120,
    participantsCount: 1589,
    badge: "🚌",
    difficulty: "hard",
    isActive: true,
  },
  {
    id: "save-water",
    title: "Save Water Challenge",
    description: "Reduce your water usage by 20% for 14 days through shorter showers and water-saving habits.",
    category: "Water",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    targetReduction: 10,
    participantsCount: 3201,
    badge: "💧",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "meatless-month",
    title: "Meatless Monday Month",
    description: "Go meat-free every Monday for a full month and cut your food footprint significantly.",
    category: "Food",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    targetReduction: 40,
    participantsCount: 7832,
    badge: "🥗",
    difficulty: "easy",
    isActive: true,
  },
  {
    id: "energy-saver",
    title: "Energy Saver Sprint",
    description: "Reduce home energy consumption by 15% over 14 days with smart habits.",
    category: "Energy",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    targetReduction: 25,
    participantsCount: 4567,
    badge: "⚡",
    difficulty: "medium",
    isActive: true,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Priya K.", score: 2847, badge: "🥇" },
  { rank: 2, name: "Alex M.", score: 2103, badge: "🥈" },
  { rank: 3, name: "Sam L.", score: 1891, badge: "🥉" },
  { rank: 4, name: "Jordan T.", score: 1654, badge: "🏅" },
  { rank: 5, name: "Taylor W.", score: 1432, badge: "🏅" },
];

const DIFFICULTY_COLORS = { easy: "badge-green", medium: "badge-amber", hard: "badge-red" };

export default function CommunityPage() {
  const { user } = useAuthContext();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joining, setJoining] = useState<string | null>(null);

  const handleJoin = async (challenge: CommunityChallenge) => {
    if (!user || joinedIds.has(challenge.id)) return;
    setJoining(challenge.id);
    try {
      await joinChallenge({
        userId: user.uid,
        challengeId: challenge.id,
        joinedAt: new Date(),
        progress: 0,
        carbonSaved: 0,
      });
      setJoinedIds((prev) => new Set([...prev, challenge.id]));
    } finally {
      setJoining(null);
    }
  };

  const daysLeft = (challenge: CommunityChallenge) =>
    Math.max(0, differenceInDays(new Date(challenge.endDate), new Date()));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Community Challenges</h1>
        <p className="page-subtitle">Join global challenges, compete with others, and make a collective impact.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Active Challenges", value: CHALLENGES.length.toString(), icon: "🏆" },
          { label: "Global Participants", value: "25,159", icon: "🌍" },
          { label: "CO₂ Saved Together", value: "142 tonnes", icon: "💚" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: "center" }} aria-label={`${s.label}: ${s.value}`}>
            <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }} aria-hidden="true">{s.icon}</div>
            <div className="kpi-value" style={{ color: "var(--color-primary)" }}>{s.value}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "var(--space-8)" }}>
        {/* Challenges */}
        <section aria-label="Available challenges">
          <h2 className="section-title">Active Challenges</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {CHALLENGES.map((challenge) => {
              const joined = joinedIds.has(challenge.id);
              const isJoining = joining === challenge.id;
              const days = daysLeft(challenge);

              return (
                <article key={challenge.id} className="card" style={{ position: "relative", overflow: "hidden" }} aria-label={`Challenge: ${challenge.title}`}>
                  {/* Category accent */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))" }} aria-hidden="true" />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)", marginTop: "var(--space-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <div style={{ fontSize: 40 }} aria-hidden="true">{challenge.badge}</div>
                      <div>
                        <h3 style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>{challenge.title}</h3>
                        <div style={{ display: "flex", gap: "var(--space-2)" }}>
                          <span className={`badge ${DIFFICULTY_COLORS[challenge.difficulty]}`} aria-label={`Difficulty: ${challenge.difficulty}`}>{challenge.difficulty}</span>
                          <span className="badge badge-blue">{challenge.category}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: "var(--weight-bold)", color: "var(--color-primary)", fontSize: "var(--text-lg)" }}>
                        {challenge.targetReduction} kg
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>CO₂ reduction</div>
                    </div>
                  </div>

                  <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)", lineHeight: "var(--leading-relaxed)" }}>
                    {challenge.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
                    <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }} aria-label={`${challenge.participantsCount.toLocaleString()} participants`}>
                        <Users size={14} aria-hidden="true" /> {challenge.participantsCount.toLocaleString()}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }} aria-label={`${days} days remaining`}>
                        <Calendar size={14} aria-hidden="true" /> {days}d left
                      </span>
                    </div>

                    <button
                      onClick={() => handleJoin(challenge)}
                      disabled={joined || isJoining}
                      className={`btn ${joined ? "btn-secondary" : "btn-primary"}`}
                      aria-label={joined ? `Already joined ${challenge.title}` : `Join ${challenge.title} challenge`}
                    >
                      {isJoining && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
                      {joined ? "✓ Joined" : isJoining ? "Joining..." : "Join Challenge"}
                      {!joined && !isJoining && <ArrowRight size={14} aria-hidden="true" />}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Leaderboard + Badges */}
        <aside>
          <section aria-label="Leaderboard" style={{ marginBottom: "var(--space-6)" }}>
            <h2 className="section-title">🏆 Global Leaderboard</h2>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`leaderboard-row${entry.rank <= 3 ? ` top-${entry.rank}` : ""}`}
                  role="listitem"
                  aria-label={`Rank ${entry.rank}: ${entry.name} with ${entry.score.toLocaleString()} points`}
                >
                  <div style={{ fontSize: 20, width: 24, textAlign: "center" }} aria-hidden="true">{entry.badge}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)" }}>{entry.name}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{entry.score.toLocaleString()} pts</div>
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: "var(--weight-bold)" }}>#{entry.rank}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Achievement Badges */}
          <section aria-label="Achievement badges">
            <h2 className="section-title">🎖️ Badges</h2>
            <div className="card">
              {[
                { icon: "🌱", label: "First Step", desc: "Complete first analysis" },
                { icon: "🚴", label: "Green Commuter", desc: "Cycle 100km total" },
                { icon: "♻️", label: "Recycler", desc: "Log 20 recycle actions" },
                { icon: "🌳", label: "Tree Hugger", desc: "Plant 5 trees" },
              ].map((badge) => (
                <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }} role="listitem">
                  <div style={{ fontSize: 28, opacity: 0.5 }} aria-hidden="true">{badge.icon}</div>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "var(--text-muted)" }}>{badge.label}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{badge.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
