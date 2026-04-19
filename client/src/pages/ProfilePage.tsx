import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";

const SEVERITY_COLOR: Record<string, string> = {
  normal: "#10b981", mild: "#f59e0b", moderate: "#f97316",
  severe: "#ef4444", extremely_severe: "#7c3aed",
};

// ── Badge definitions ──────────────────────────────────────────
type Badge = { id: string; emoji: string; title: string; desc: string; earned: (hist: Session[]) => boolean };
type Session = { type: string; title: string; average: number; date: string; score?: number | null };

const BADGES: Badge[] = [
  { id: "first_step",   emoji: "🌱", title: "First Step",      desc: "Complete your first activity",                 earned: h => h.length >= 1 },
  { id: "week_warrior", emoji: "🔥", title: "Week Warrior",    desc: "Complete 5 activities",                        earned: h => h.length >= 5 },
  { id: "ten_sessions", emoji: "🏆", title: "Dedicated",       desc: "Complete 10 activities",                       earned: h => h.length >= 10 },
  { id: "breather",     emoji: "💨", title: "Breather",        desc: "Complete a breathing exercise",                earned: h => h.some(s => s.type === "breathing") },
  { id: "mindful",      emoji: "🧘", title: "Mindful",         desc: "Complete a meditation session",                earned: h => h.some(s => s.type === "meditation") },
  { id: "writer",       emoji: "✍️", title: "Writer",          desc: "Write an unsent letter",                       earned: h => h.some(s => s.type === "letter-writing") },
  { id: "detoxer",      emoji: "📵", title: "Digital Detoxer", desc: "Complete a digital detox challenge",           earned: h => h.some(s => s.type === "digital-detox") },
  { id: "gratitude",    emoji: "🌟", title: "Gratitude Guru",  desc: "Complete the 3 Good Things activity",          earned: h => h.some(s => s.type === "three-good-things") },
  { id: "high_score",   emoji: "💎", title: "Top Performer",   desc: "Achieve 90%+ wellness on any activity",        earned: h => h.some(s => s.average >= 90) },
  { id: "grounded",     emoji: "🌍", title: "Grounded",        desc: "Complete a grounding exercise",                earned: h => h.some(s => s.type === "grounding") },
  { id: "streak_3",     emoji: "⚡", title: "3-Day Streak",    desc: "Stay active 3 days in a row",                  earned: h => calcStreak(h) >= 3 },
  { id: "game_player",  emoji: "🎮", title: "Game On",         desc: "Play a focus or memory game",                  earned: h => h.some(s => s.type.startsWith("game-")) },
];

function calcStreak(history: Session[]): number {
  const days = [...new Set(history.map(h => new Date(h.date).toDateString()))].sort((a, b) => new Date(b) > new Date(a) ? 1 : -1);
  if (!days.length) return 0;
  let streak = 1;
  const today = new Date().toDateString();
  if (days[0] !== today && days[0] !== new Date(Date.now() - 86400000).toDateString()) return 0;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000;
    if (Math.round(diff) === 1) streak++;
    else break;
  }
  return streak;
}

export default function ProfilePage() {
  const { user, logout, saveConsent } = useAuth();
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get("tab") as "settings" | "history" | "badges" || "settings";

  const [tab, setTab]                   = useState<"settings" | "history" | "badges">(initialTab);
  const [showConsentModal, setModal]    = useState(false);
  const [toggling, setToggling]         = useState(false);
  const [message, setMessage]           = useState("");
  const [history, setHistory]           = useState<Session[]>([]);

  const aiEnabled = user?.ai_consent === true;
  const initials  = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mindcare_history") || "[]");
    setHistory(data);
  }, []);

  async function handleToggleConsent(newValue: boolean) {
    setToggling(true);
    try {
      await saveConsent(newValue);
      setMessage(newValue ? "AI insights enabled!" : "AI insights disabled.");
      setModal(false);
    } catch {
      setMessage("Failed to update. Please try again.");
    } finally {
      setToggling(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const earnedBadges  = BADGES.filter(b => b.earned(history));
  const lockedBadges  = BADGES.filter(b => !b.earned(history));
  const uniqueDays    = new Set(history.map(h => new Date(h.date).toDateString())).size;
  const avgWellness   = history.length ? Math.round(history.reduce((s, h) => s + (h.average || 0), 0) / history.length) : 0;

  return (
    <div style={page}>
      <AppNavbar />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Profile Hero */}
        <div style={heroCard}>
          <div style={avatar}>{initials}</div>
          <div>
            <div style={userName}>{user?.name}</div>
            <div style={userEmail}>{user?.email}</div>
            <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ ...pill, background: "#eef2ff", color: "#4338ca" }}>
                {aiEnabled ? "🤖 AI Mode" : "🔒 Private Mode"}
              </span>
              <span style={{ ...pill, background: "#f0fdf4", color: "#065f46" }}>
                🔥 {calcStreak(history)} day streak
              </span>
              <span style={{ ...pill, background: "#fdf4ff", color: "#7e22ce" }}>
                🏅 {earnedBadges.length} badges
              </span>
            </div>
          </div>
        </div>

        {message && <div style={toast}>{message}</div>}

        {/* Tabs */}
        <div style={tabRow}>
          {(["settings", "history", "badges"] as const).map(t => (
            <button key={t} style={{ ...tabBtn, ...(tab === t ? tabBtnActive : {}) }} onClick={() => setTab(t)}>
              {t === "settings" ? "⚙️ Settings" : t === "history" ? "📊 Activity History" : "🏅 Badges"}
            </button>
          ))}
        </div>

        {/* ── Settings Tab ── */}
        {tab === "settings" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* AI Settings */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={cardTitle}>🤖 AI Insights</h2>
                  <p style={cardSub}>Control whether the chatbot uses your DASS results for personalised responses.</p>
                </div>
                <span style={{ ...pill, ...(aiEnabled ? { background: "#eef2ff", color: "#4338ca" } : { background: "#f4f4f5", color: "#71717a" }) }}>
                  {aiEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem 0", borderTop: "1px solid #f5f5f5" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#111827" }}>Personalised AI Support</div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>Your DASS results inform the chatbot's responses.</div>
                </div>
                <button
                  id="toggle-ai-consent"
                  style={{ width: 48, height: 26, borderRadius: 99, border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0, background: aiEnabled ? "#6366f1" : "#d1d5db" }}
                  onClick={() => setModal(true)}
                >
                  <span style={{ position: "absolute", top: 3, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "transform 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transform: aiEnabled ? "translateX(22px)" : "translateX(2px)" }} />
                </button>
              </div>
              <p style={{ fontSize: "0.83rem", color: "#6b7280", marginTop: "0.75rem", padding: "0.75rem", background: "#f9fafb", borderRadius: 10 }}>
                {aiEnabled ? "✅ AI mode: Your chatbot references your assessment & mood logs." : "🔒 Private mode: No personal context used in chatbot responses."}
              </p>
            </div>

            {/* Account Info */}
            <div style={card}>
              <h2 style={{ ...cardTitle, marginBottom: "0.75rem" }}>⚙️ Account</h2>
              {[
                ["Name",            user?.name],
                ["Email",           user?.email],
                ["DASS Assessment", "✅ Completed"],
                ["AI Consent",      aiEnabled ? "Enabled" : "Disabled"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0", borderBottom: "1px solid #f5f5f5", fontSize: "0.9rem" }}>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
              <button id="profile-logout" style={logoutBtn} onClick={logout}>Sign out</button>
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === "history" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem" }}>
              <StatCard label="Sessions"    value={history.length}  color="#6366f1" />
              <StatCard label="Avg Wellness" value={`${avgWellness}%`} color="#a855f7" />
              <StatCard label="Active Days"  value={uniqueDays}      color="#10b981" />
            </div>

            {/* Timeline */}
            {history.length === 0 ? (
              <div style={{ background: "white", borderRadius: 20, padding: "3rem", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 44 }}>🌱</div>
                <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>No activity history yet. Complete an activity to see your progress here!</p>
              </div>
            ) : (
              <div style={card}>
                <h2 style={{ ...cardTitle, marginBottom: "1rem" }}>📋 All Sessions</h2>
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {history.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1.1rem", background: "#f9fafb", borderRadius: 14, border: "1px solid #f0f0f0" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.9rem" }}>{s.title}</div>
                        <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 2 }}>{new Date(s.date).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: s.average >= 70 ? "#10b981" : s.average >= 40 ? "#f59e0b" : "#ef4444" }}>
                        {s.average}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Badges Tab ── */}
        {tab === "badges" && (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {earnedBadges.length > 0 && (
              <div style={card}>
                <h2 style={{ ...cardTitle, marginBottom: "1rem" }}>✅ Earned Badges ({earnedBadges.length})</h2>
                <div style={badgeGrid}>
                  {earnedBadges.map(b => (
                    <div key={b.id} className="badge-earned" style={badgeCard}>
                      <div style={{ fontSize: 38, marginBottom: "0.5rem" }}>{b.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>{b.title}</div>
                      <div style={{ fontSize: "0.74rem", color: "#6b7280", marginTop: 2, textAlign: "center" }}>{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lockedBadges.length > 0 && (
              <div style={card}>
                <h2 style={{ ...cardTitle, marginBottom: "1rem" }}>🔒 Locked Badges ({lockedBadges.length})</h2>
                <div style={badgeGrid}>
                  {lockedBadges.map(b => (
                    <div key={b.id} style={{ ...badgeCard, opacity: 0.45, filter: "grayscale(0.6)" }}>
                      <div style={{ fontSize: 38, marginBottom: "0.5rem" }}>{b.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#6b7280" }}>{b.title}</div>
                      <div style={{ fontSize: "0.74rem", color: "#9ca3af", marginTop: 2, textAlign: "center" }}>{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {earnedBadges.length === 0 && (
              <div style={{ background: "white", borderRadius: 20, padding: "3rem", textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 44 }}>🏅</div>
                <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>Complete activities to earn your first badge!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Consent modal */}
      {showConsentModal && (
        <div style={overlay} onClick={() => setModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.2rem" }}>
              {aiEnabled ? "Disable AI Insights?" : "Enable AI Insights?"}
            </h2>
            <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {aiEnabled
                ? "Your chatbot will no longer reference your DASS results or personal history."
                : "Your chatbot will use your DASS assessment and mood logs to provide personalised support."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button style={{ flex: 1, padding: "0.7rem", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer" }} onClick={() => setModal(false)}>Cancel</button>
              <button
                style={{ flex: 1, padding: "0.7rem", background: aiEnabled ? "#ef4444" : "#6366f1", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}
                onClick={() => handleToggleConsent(!aiEnabled)} disabled={toggling}
              >
                {toggling ? "Saving…" : aiEnabled ? "Yes, disable" : "Yes, enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 18, padding: "1.25rem", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", textAlign: "center" }}>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };

const heroCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  borderRadius: 24, padding: "2rem", display: "flex", alignItems: "center",
  gap: "1.5rem", marginBottom: "1.25rem", flexWrap: "wrap",
};
const avatar: React.CSSProperties = {
  width: 72, height: 72, borderRadius: "50%",
  background: "rgba(255,255,255,0.25)", display: "flex",
  alignItems: "center", justifyContent: "center",
  fontSize: "1.6rem", fontWeight: 800, flexShrink: 0,
};
const userName: React.CSSProperties  = { fontWeight: 800, fontSize: "1.2rem" };
const userEmail: React.CSSProperties = { opacity: 0.8, fontSize: "0.88rem", marginTop: 2 };
const pill: React.CSSProperties = { padding: "0.25rem 0.7rem", borderRadius: 99, fontSize: "0.74rem", fontWeight: 700 };

const tabRow: React.CSSProperties = {
  display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap",
};
const tabBtn: React.CSSProperties = {
  padding: "0.55rem 1.1rem", borderRadius: 10, border: "1.5px solid #e5e7eb",
  background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem", color: "#6b7280",
};
const tabBtnActive: React.CSSProperties = {
  background: "#eef2ff", color: "#4338ca", border: "1.5px solid #c7d2fe",
};

const card: React.CSSProperties = {
  background: "white", borderRadius: 20, padding: "1.75rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};
const cardTitle: React.CSSProperties = { fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: 0 };
const cardSub: React.CSSProperties   = { fontSize: "0.83rem", color: "#6b7280", marginTop: 4 };

const toast: React.CSSProperties = {
  background: "#ecfdf5", color: "#065f46", border: "1px solid #bbf7d0",
  padding: "0.75rem 1.25rem", borderRadius: 12, fontWeight: 600,
  fontSize: "0.9rem", marginBottom: "1rem",
};
const logoutBtn: React.CSSProperties = {
  marginTop: "1.25rem", padding: "0.65rem 1.5rem",
  background: "#fef2f2", color: "#dc2626",
  border: "1.5px solid #fecaca", borderRadius: 12, fontWeight: 600, cursor: "pointer",
};
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
};
const modal: React.CSSProperties = {
  background: "white", borderRadius: 24, padding: "2rem",
  width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
};
const badgeGrid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "0.75rem",
};
const badgeCard: React.CSSProperties = {
  background: "#f9fafb", borderRadius: 16, padding: "1.1rem 0.75rem",
  display: "flex", flexDirection: "column", alignItems: "center",
  border: "1.5px solid #f0f0f0", textAlign: "center",
};
