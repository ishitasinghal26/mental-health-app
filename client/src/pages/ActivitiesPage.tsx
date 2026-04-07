import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActivities } from "../services/activityApi";
import AppNavbar from "../components/navbar/AppNavbar";

const DIFFICULTY = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [5, 10, 15];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};

const CATEGORY_ICON: Record<string, string> = {
  "Breathing":    "🌬️",
  "Meditation":   "🧘",
  "Body Scan":    "🫁",
  "Grounding":    "🌿",
  "Focus":        "🎯",
  "Memory":       "🧠",
  "Mindfulness":  "🌸",
};

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [difficulty, setDifficulty] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [hoverId, setHoverId]       = useState<number | null>(null);

  useEffect(() => {
    loadActivities();
  }, [difficulty, maxDuration]);

  async function loadActivities() {
    try {
      setLoading(true);
      const res = await getActivities({
        difficulty: difficulty || undefined,
        maxDuration: maxDuration || undefined,
      });
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={page}>
      <AppNavbar />
      <div style={container}>

        {/* ── Header ── */}
        <div style={header}>
          <div>
            <h1 style={title}>🎯 Wellness Activities</h1>
            <p style={subtitle}>Guided exercises to calm your mind, reduce stress, and boost well-being.</p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={filterBar}>
          <div style={filterGroup}>
            <span style={filterLabel}>Difficulty</span>
            <div style={filterPills}>
              <button
                style={{ ...pill, ...(difficulty === "" ? pillActive : {}) }}
                onClick={() => setDifficulty("")}
              >All</button>
              {DIFFICULTY.map(d => (
                <button
                  key={d}
                  style={{
                    ...pill,
                    ...(difficulty === d ? { ...pillActive, background: DIFFICULTY_COLOR[d] + "18", borderColor: DIFFICULTY_COLOR[d], color: DIFFICULTY_COLOR[d] } : {}),
                  }}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={filterGroup}>
            <span style={filterLabel}>Duration</span>
            <div style={filterPills}>
              <button
                style={{ ...pill, ...(maxDuration === "" ? pillActive : {}) }}
                onClick={() => setMaxDuration("")}
              >Any</button>
              {DURATIONS.map(d => (
                <button
                  key={d}
                  style={{ ...pill, ...(maxDuration === String(d) ? pillActive : {}) }}
                  onClick={() => setMaxDuration(String(d))}
                >
                  ≤{d} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Grid ── */}
        {loading ? (
          <div style={loadingWrap}>
            <div style={{ fontSize: 40, marginBottom: "0.75rem" }}>🌿</div>
            <p style={{ color: "#9ca3af" }}>Loading activities…</p>
          </div>
        ) : activities.length === 0 ? (
          <div style={emptyState}>
            <div style={{ fontSize: 44 }}>🔍</div>
            <p>No activities match your filters. Try adjusting them!</p>
          </div>
        ) : (
          <div style={grid}>
            {activities.map((a) => (
              <div
                key={a.id}
                style={{
                  ...activityCard,
                  borderTop: `4px solid ${DIFFICULTY_COLOR[a.difficulty] || "#6366f1"}`,
                  ...(hoverId === a.id ? activityCardHover : {}),
                }}
                onMouseEnter={() => setHoverId(a.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                {/* Icon + title */}
                <div style={cardTop}>
                  <div style={{ ...iconBox, background: (DIFFICULTY_COLOR[a.difficulty] || "#6366f1") + "15" }}>
                    <span style={{ fontSize: 26 }}>
                      {CATEGORY_ICON[a.category] || "✨"}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={cardTitle}>{a.title}</h3>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.3rem" }}>
                      <span style={{ ...badge, background: (DIFFICULTY_COLOR[a.difficulty] || "#6366f1") + "18", color: DIFFICULTY_COLOR[a.difficulty] || "#6366f1" }}>
                        {a.difficulty}
                      </span>
                      <span style={{ ...badge, background: "#f0f9ff", color: "#0284c7" }}>
                        ⏱ {a.duration} min
                      </span>
                      <span style={{ ...badge, background: "#fdf4ff", color: "#9333ea" }}>
                        {a.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={cardDesc}>{a.description}</p>

                {/* CTA */}
                <button
                  style={startBtn}
                  onClick={() => navigate("/activity-player", { state: { activity: a } })}
                >
                  Start Activity →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "2rem 1.5rem",
  display: "grid",
  gap: "1.5rem",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const title: React.CSSProperties    = { fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: 0 };
const subtitle: React.CSSProperties = { color: "#6b7280", marginTop: 6 };

const filterBar: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  flexWrap: "wrap",
  background: "white",
  borderRadius: 16,
  padding: "1rem 1.25rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  border: "1px solid #f0f0f0",
};

const filterGroup: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  flexWrap: "wrap",
};

const filterLabel: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const filterPills: React.CSSProperties = { display: "flex", gap: "0.4rem", flexWrap: "wrap" };

const pill: React.CSSProperties = {
  padding: "0.35rem 0.85rem",
  borderRadius: 99,
  border: "1.5px solid #e5e7eb",
  background: "white",
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "#6b7280",
  cursor: "pointer",
  transition: "all 0.15s",
};

const pillActive: React.CSSProperties = {
  background: "#eef2ff",
  borderColor: "#6366f1",
  color: "#4338ca",
  fontWeight: 700,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
  gap: "1.25rem",
};

const activityCard: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "1.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "0.9rem",
  transition: "transform 0.2s, box-shadow 0.2s",
  cursor: "default",
};

const activityCardHover: React.CSSProperties = {
  transform: "translateY(-3px)",
  boxShadow: "0 12px 32px rgba(99,102,241,0.13)",
};

const cardTop: React.CSSProperties = {
  display: "flex",
  gap: "0.85rem",
  alignItems: "flex-start",
};

const iconBox: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const cardTitle: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#111827",
  margin: 0,
  lineHeight: 1.3,
};

const badge: React.CSSProperties = {
  padding: "0.18rem 0.55rem",
  borderRadius: 99,
  fontSize: "0.72rem",
  fontWeight: 700,
};

const cardDesc: React.CSSProperties = {
  fontSize: "0.87rem",
  color: "#6b7280",
  lineHeight: 1.6,
  margin: 0,
  flex: 1,
};

const startBtn: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  fontWeight: 700,
  fontSize: "0.92rem",
  cursor: "pointer",
  transition: "opacity 0.2s",
  marginTop: "auto",
};

const loadingWrap: React.CSSProperties = {
  textAlign: "center",
  padding: "4rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem",
  background: "white",
  borderRadius: 20,
  color: "#9ca3af",
  fontSize: "0.9rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};
