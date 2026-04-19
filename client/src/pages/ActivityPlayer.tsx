import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import BreathingActivity       from "../therapies/BreathingActivity";
import MeditationActivity      from "../therapies/MeditationActivity";
import BodyScanActivity        from "../therapies/BodyScanActivity";
import GroundingActivity       from "../therapies/GroundingActivity";
import FocusGame               from "../therapies/FocusGame";
import MemoryGame              from "../therapies/MemoryGame";
import DigitalDetoxActivity    from "../therapies/DigitalDetoxActivity";
import LetterWritingActivity   from "../therapies/LetterWritingActivity";
import ThreeGoodThingsActivity from "../therapies/ThreeGoodThingsActivity";

type Activity = {
  id: number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category: string;
  type: string;
  ui: string;
};

type Session = { type: string; title: string; average: number; date: string };

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

export default function ActivityPlayer() {
  const location = useLocation();
  const navigate = useNavigate();
  const activity: Activity | undefined = location.state?.activity;

  const [started, setStarted]   = useState(false);
  const [history, setHistory]   = useState<Session[]>([]);

  useEffect(() => {
    if (!activity) { navigate("/activities"); return; }
    // Load past sessions for this activity type from localStorage
    const all: Session[] = JSON.parse(localStorage.getItem("mindcare_history") || "[]");
    setHistory(all.filter(s => s.type === activity.type));
  }, [activity, navigate]);

  if (!activity) return null;

  // ── Pre-start screen ──────────────────────────────────────────────
  if (!started) {
    const avgWellness = history.length
      ? Math.round(history.reduce((s, h) => s + (h.average || 0), 0) / history.length)
      : null;

    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
        {/* Back nav */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb", background: "white" }}>
          <Link to="/activities" style={{ color: "#6366f1", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
            ← Back to Activities
          </Link>
        </div>

        <div style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1.5rem", display: "grid", gap: "1.5rem" }}>

          {/* Activity Card */}
          <div style={{
            background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
            borderRadius: 24, padding: "2rem",
          }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, opacity: 0.8, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {activity.category}
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem" }}>{activity.title}</h1>
            <p style={{ opacity: 0.9, margin: "0 0 1.25rem", lineHeight: 1.5 }}>{activity.description}</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ padding: "0.3rem 0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: 99, fontSize: "0.82rem", fontWeight: 600 }}>
                ⏱ {activity.duration} min
              </span>
              <span style={{ padding: "0.3rem 0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: 99, fontSize: "0.82rem", fontWeight: 600, color: DIFFICULTY_COLOR[activity.difficulty] || "white" }}>
                {activity.difficulty}
              </span>
              {history.length > 0 && (
                <span style={{ padding: "0.3rem 0.75rem", background: "rgba(255,255,255,0.2)", borderRadius: 99, fontSize: "0.82rem", fontWeight: 600 }}>
                  ✓ {history.length} session{history.length > 1 ? "s" : ""} completed
                </span>
              )}
            </div>
          </div>

          {/* Stats (if history exists) */}
          {history.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              {[
                { label: "Sessions",     value: history.length,       icon: "🎯" },
                { label: "Avg Wellness", value: `${avgWellness}%`,    icon: "📊" },
                { label: "Last Played",  value: new Date(history[0].date).toLocaleDateString("en", { month: "short", day: "numeric" }), icon: "📅" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ background: "white", borderRadius: 18, padding: "1.1rem", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: "0.35rem" }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#111827" }}>{value}</div>
                  <div style={{ fontSize: "0.74rem", color: "#9ca3af", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Past sessions history */}
          {history.length > 0 && (
            <div style={{ background: "white", borderRadius: 20, padding: "1.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: "0 0 1rem" }}>📋 Your History</h2>
              <div style={{ display: "grid", gap: "0.5rem", maxHeight: 260, overflowY: "auto" }}>
                {history.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.7rem 1rem", background: "#f9fafb", borderRadius: 12,
                    border: "1px solid #f0f0f0",
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#111827" }}>{s.title}</div>
                      <div style={{ fontSize: "0.74rem", color: "#9ca3af", marginTop: 2 }}>
                        {new Date(s.date).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 800, fontSize: "1rem",
                      color: s.average >= 70 ? "#10b981" : s.average >= 40 ? "#f59e0b" : "#ef4444",
                    }}>
                      {s.average}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "1rem", borderRadius: 16, border: "none",
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              color: "white", fontWeight: 800, fontSize: "1.1rem",
              cursor: "pointer", transition: "opacity 0.2s",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            {history.length > 0 ? "▶ Play Again" : "▶ Start Activity"}
          </button>
        </div>
      </div>
    );
  }

  // ── Activity component ────────────────────────────────────────────
  switch (activity.type) {
    case "breathing":         return <BreathingActivity       activity={activity} />;
    case "meditation":        return <MeditationActivity      activity={activity} />;
    case "bodyscan":          return <BodyScanActivity        activity={activity} />;
    case "grounding":         return <GroundingActivity       activity={activity} />;
    case "game-focus":        return <FocusGame               activity={activity} />;
    case "game-memory":       return <MemoryGame              activity={activity} />;
    case "digital-detox":     return <DigitalDetoxActivity    activity={activity} />;
    case "letter-writing":    return <LetterWritingActivity   activity={activity} />;
    case "three-good-things": return <ThreeGoodThingsActivity activity={activity} />;
    default:
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <p>Unknown activity type: {activity.type}</p>
          <button onClick={() => navigate("/activities")}>← Back</button>
        </div>
      );
  }
}
