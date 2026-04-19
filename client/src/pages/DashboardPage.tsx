import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import { apiClient } from "../services/apiClient";
import { calculateStreak } from "../utils/streak";
import DassReportModal from "../components/dashboard/DassReportModal";

const MOTIVATIONAL_QUOTES = [
  { q: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or anxious. Having feelings doesn't make you a negative person.", a: "Lori Deschene" },
  { q: "This too shall pass. Whatever you are going through right now will not last forever.", a: "Ancient Proverb" },
  { q: "You are allowed to be both a masterpiece and a work in progress simultaneously.", a: "Sophia Bush" },
  { q: "Healing is not linear. Some days you will feel better and some days you will feel worse. And that's okay.", a: "Unknown" },
  { q: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", a: "Max Ehrmann" },
  { q: "Your present circumstances don't determine where you can go; they merely determine where you start.", a: "Nido Qubein" },
  { q: "Rest is not idleness, and to lie sometimes on the grass under the trees on a summer's day, is by no means a waste of time.", a: "John Lubbock" },
];

const RECOMMENDED_ACTIVITIES: Record<string, { id: number; title: string; emoji: string; reason: string; type: string }[]> = {
  normal:  [
    { id: 5, title: "Calm Focus Game",   emoji: "🎯", reason: "Keep your mental sharpness up",          type: "game-focus" },
    { id: 2, title: "5-Min Meditation",  emoji: "🧘", reason: "Maintain your inner equilibrium",        type: "meditation" },
    { id: 9, title: "3 Good Things",     emoji: "🌟", reason: "Daily gratitude builds lasting happiness", type: "three-good-things" },
  ],
  mild:    [
    { id: 1, title: "Deep Breathing",    emoji: "💨", reason: "Reduces mild stress quickly",            type: "breathing" },
    { id: 9, title: "3 Good Things",     emoji: "🌟", reason: "Reframe your focus positively",           type: "three-good-things" },
    { id: 7, title: "Digital Detox",     emoji: "📵", reason: "Reduce digital noise for mental clarity", type: "digital-detox" },
  ],
  moderate:[
    { id: 1, title: "Deep Breathing",    emoji: "💨", reason: "Immediate nervous system reset",         type: "breathing" },
    { id: 4, title: "5-4-3-2-1 Grounding", emoji: "🌱", reason: "Break the anxiety cycle fast",         type: "grounding" },
    { id: 8, title: "Write a Letter",    emoji: "✒️", reason: "Release what's been building inside",    type: "letter-writing" },
  ],
  severe:  [
    { id: 4, title: "Grounding Exercise", emoji: "🌱", reason: "Anchor yourself to the present moment", type: "grounding" },
    { id: 3, title: "Body Scan",          emoji: "🧘", reason: "Release deep physical tension",         type: "bodyscan" },
    { id: 8, title: "Write a Letter",    emoji: "✒️", reason: "Get difficult feelings out safely",     type: "letter-writing" },
  ],
  extremely_severe: [
    { id: 1, title: "Deep Breathing",    emoji: "💨", reason: "Start here — one breath at a time",     type: "breathing" },
    { id: 4, title: "Grounding Exercise", emoji: "🌱", reason: "Reconnect with the present moment",     type: "grounding" },
    { id: 3, title: "Body Scan",          emoji: "🧘", reason: "Gentle relief for overwhelming stress", type: "bodyscan" },
  ],
};


type AssessmentSummary = {
  summary: { depression: string; anxiety: string; stress: string };
  overallSeverity: string;
} | null;

type Session = { type: string; title: string; average: number; date: string };

const SEVERITY_COLOR: Record<string, string> = {
  normal: "#10b981",
  mild: "#f59e0b",
  moderate: "#f97316",
  severe: "#ef4444",
  extremely_severe: "#7c3aed",
};

const SEVERITY_WIDTH: Record<string, string> = {
  normal: "20%",
  mild: "40%",
  moderate: "60%",
  severe: "80%",
  extremely_severe: "100%",
};

function SeverityBar({ label, level }: { label: string; level: string }) {
  const color = SEVERITY_COLOR[level] || "#6b7280";
  const width = SEVERITY_WIDTH[level] || "0%";
  const display = level?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>{display}</span>
      </div>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width, background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const aiEnabled = user?.ai_consent === true;
  const firstName = user?.name?.split(" ")[0] || "there";

  const [assessment, setAssessment] = useState<AssessmentSummary>(null);
  const [streak, setStreak]         = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [avgWellness, setAvgWellness] = useState(0);
  const [showReport, setShowReport]  = useState(false);
  const [moodChart, setMoodChart]    = useState<{ date: string; intensity: number }[]>([]);

  // Quote of the day (stable per calendar day)
  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  // Fetch assessment
  useEffect(() => {
    apiClient.get("/assessment/latest")
      .then((res) => {
        if (res.data?.summary) setAssessment(res.data);
      })
      .catch(() => {});
  }, []);

  // Local activity history stats + mood chart
  useEffect(() => {
    const stored = localStorage.getItem("mindcare_history");
    if (!stored) return;
    const history: Session[] = JSON.parse(stored);
    if (!history.length) return;
    setStreak(calculateStreak(history));
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    setWeeklyCount(history.filter((s) => new Date(s.date) >= weekAgo).length);
    setAvgWellness(Math.round(history.reduce((s, h) => s + (h.average || 0), 0) / history.length));
  }, []);

  // Load mood chart data (last 7 mood entries)
  useEffect(() => {
    apiClient.get("/moods?limit=7")
      .then(res => {
        const entries = (res.data || []).slice().reverse();
        setMoodChart(entries.map((m: any) => ({
          date: new Date(m.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
          intensity: m.intensity,
        })));
      })
      .catch(() => {});
  }, []);



  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
    <div style={page}>
      <AppNavbar />
      <div style={container}>
        {/* Hero greeting + Quote combined */}
        <div style={heroCard}>
          <div style={{ flex: 1 }}>
            <h1 style={heroTitle}>{greeting}, {firstName}! 👋</h1>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", marginTop: "0.85rem", padding: "0.85rem 1rem", background: "rgba(255,255,255,0.15)", borderRadius: 14 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💬</span>
              <div>
                <p style={{ fontStyle: "italic", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: 0, fontSize: "0.88rem" }}>
                  "{todayQuote.q}"
                </p>
                <p style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.6)", marginTop: "0.3rem" }}>— {todayQuote.a}</p>
              </div>
            </div>
          </div>
        </div>


        {/* Stats row */}
        <div style={statsGrid}>
          <StatCard icon="🔥" label="Current Streak" value={`${streak} days`} color="#6366f1" />
          <StatCard icon="📅" label="This Week" value={`${weeklyCount} sessions`} color="#a855f7" />
          <StatCard icon="📊" label="Avg Wellness" value={`${avgWellness}%`} color="#10b981" />
          <StatCard icon="🤖" label="Mode" value={aiEnabled ? "AI Enabled" : "Private"} color={aiEnabled ? "#6366f1" : "#10b981"} />
        </div>

        {/* Journal Prompt Card */}
        <JournalPromptCard />

        <div style={twoCol}>
          {/* DASS Summary */}
          {assessment && (
            <div style={panelCard}>
              <div style={panelHeader}>
                <span style={panelIcon}>🧠</span>
                <div style={{ flex: 1 }}>
                  <h2 style={panelTitle}>Your DASS-21 Results</h2>
                  <p style={panelSub}>Overall: <strong style={{ color: SEVERITY_COLOR[assessment.overallSeverity] }}>
                    {assessment.overallSeverity?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </strong></p>
                </div>
              </div>
              <SeverityBar label="Depression" level={assessment.summary.depression} />
              <SeverityBar label="Anxiety"    level={assessment.summary.anxiety} />
              <SeverityBar label="Stress"     level={assessment.summary.stress} />
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <button
                  style={reportBtn}
                  onClick={() => setShowReport(true)}
                >
                  📊 View Full Report
                </button>
                <button
                  style={{ ...reportBtn, background: "#f0fdf4", color: "#065f46", border: "1.5px solid #bbf7d0" }}
                  onClick={() => setShowReport(true)}
                >
                  🔄 Retake Survey
                </button>
              </div>
            </div>
          )}

          {/* Recommended for You (replaces Quick Links) */}
          <div style={panelCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={panelTitle}>⭐ Recommended for You</h2>
                <p style={panelSub}>Tailored to your DASS results</p>
              </div>
              <Link to="/recommendations" style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 700 }}>Full Report →</Link>
            </div>
            {assessment ? (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {(RECOMMENDED_ACTIVITIES[assessment.overallSeverity] || RECOMMENDED_ACTIVITIES.normal).map(act => (
                  <Link
                    key={act.id}
                    to="/activity-player"
                    state={{ activity: { id: act.id, title: act.title, type: act.type, duration: 5, difficulty: "Beginner", description: act.reason, category: "Wellness", ui: "guided" } }}
                    style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "#f9fafb", borderRadius: 12, border: "1px solid #f0f0f0", textDecoration: "none" }}
                  >
                    <span style={{ fontSize: 24 }}>{act.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#111827", fontSize: "0.88rem" }}>{act.title}</div>
                      <div style={{ fontSize: "0.74rem", color: "#6b7280", marginTop: 1 }}>{act.reason}</div>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#6366f1", fontWeight: 600 }}>Start →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: "1.5rem 0", fontSize: "0.85rem" }}>
                Complete the DASS survey to get personalised activity recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Wellness Mood Graph */}
        <div style={panelCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h2 style={panelTitle}>📈 Wellness Score</h2>
              <p style={panelSub}>Mood intensity over your last 7 entries</p>
            </div>
            <Link to="/mood" style={{ fontSize: "0.82rem", color: "#6366f1", fontWeight: 700 }}>Log Mood →</Link>
          </div>
          {moodChart.length > 1 ? (
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} width={28} />
                  <Tooltip formatter={(v: any) => [`${v}/5`, "Mood Intensity"]} />
                  <Line type="monotone" dataKey="intensity" stroke="#6366f1" strokeWidth={3}
                    dot={{ r: 5, fill: "#6366f1" }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <span style={{ fontSize: "0.85rem" }}>Log mood entries to see your wellness trend</span>
            </div>
          )}

          {/* Recommended activity based on mood */}
          {moodChart.length > 0 && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "#f9fafb", borderRadius: 12, border: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                💡 <strong>Based on your mood trend:</strong>{" "}
                {(() => {
                  const avg = moodChart.reduce((s, m) => s + m.intensity, 0) / moodChart.length;
                  if (avg >= 4) return "Try a focus game or gratitude practice to stay elevated!";
                  if (avg >= 3) return "A 5-min meditation or journaling session could help balance your mood.";
                  if (avg >= 2) return "Try deep breathing or grounding — your body needs a reset.";
                  return "Start with deep breathing. You're going through a tough time — be gentle with yourself.";
                })()}
              </span>
            </div>
          )}
        </div>

        {/* Recommended for You section moved into twoCol above */}

        {/* AI Banner or Private Banner */}
        {aiEnabled ? (

          <div style={aiBanner}>
            <div>
              <div style={bannerTitle}>🤖 AI Insights Active</div>
              <div style={bannerSub}>
                Your chatbot references your DASS results and mood logs to give personalised support.
              </div>
            </div>
            <Link to="/chatbot" style={bannerBtn}>Open AI Chat →</Link>
          </div>
        ) : (
          <div style={privateBanner}>
            <div>
              <div style={bannerTitle}>🔒 Private Mode Active</div>
              <div style={bannerSub}>
                All your data stays on this device. You can enable AI insights anytime from your Profile.
              </div>
            </div>
            <Link to="/profile" style={{ ...bannerBtn, background: "#10b981" }}>Enable AI →</Link>
          </div>
        )}
      </div>
    </div>

    {/* DASS Full Report Modal */}
    {showReport && <DassReportModal onClose={() => setShowReport(false)} />}
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={statCard}>
      <div style={{ ...statIcon, background: color + "18", color }}>{icon}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginTop: "0.5rem" }}>{value}</div>
      <div style={{ fontSize: "0.82rem", color: "#6b7280", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function QuickLink({ to, icon, label, color }: { to: string; icon: string; label: string; color: string }) {
  return (
    <Link to={to} style={{ ...quickLink, color }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{label}</span>
    </Link>
  );
}

const JOURNAL_PROMPTS = [
  "What's been the heaviest thought on your mind lately?",
  "Is there something you wish you could say to someone but haven't?",
  "What are you holding onto that you might need to let go of?",
  "How did you treat yourself today — and was that fair?",
  "What does your body feel right now, and what might it be trying to tell you?",
  "If your feelings could speak, what would they say?",
  "What's one thing that felt hard today, and one thing that helped?",
];

function JournalPromptCard() {
  const [answer, setAnswer] = useState("");
  const [saved, setSaved]   = useState(false);
  const prompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];

  const textareaStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.85rem", border: "1.5px solid #d8b4fe",
    borderRadius: 10, fontSize: "0.92rem", background: "white",
    color: "#111827", resize: "vertical", minHeight: 80, fontFamily: "inherit",
  };

  return (
    <div style={{
      background: "linear-gradient(135deg,#fdf4ff,#eff6ff)",
      border: "1.5px solid #e9d5ff", borderRadius: 20,
      padding: "1.5rem 1.75rem",
      boxShadow: "0 4px 16px rgba(168,85,247,0.08)",
    }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#6b21a8", margin: "0 0 0.3rem" }}>
        💥 Let it out, nobody's gonna know...
      </h2>
      <p style={{ fontSize: "0.84rem", color: "#7e22ce", marginBottom: "1rem" }}>{prompt}</p>

      {saved ? (
        <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "1rem", textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>🌸</div>
          <div style={{ fontWeight: 700, color: "#065f46", marginTop: "0.5rem" }}>
            Thank you for sharing. You're seen — and you matter. 💚
          </div>
        </div>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write whatever comes to mind. No rules, no judgement..."
            rows={3}
            style={textareaStyle}
          />
          <button
            style={{
              marginTop: "0.75rem", padding: "0.55rem 1.2rem", borderRadius: 12,
              border: "none", background: "linear-gradient(135deg,#a855f7,#6366f1)",
              color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
              opacity: answer.trim() ? 1 : 0.5,
            }}
            disabled={!answer.trim()}
            onClick={() => { if (answer.trim()) setSaved(true); }}
          >
            ✨ Done writing
          </button>
        </>
      )}
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

const heroCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  borderRadius: 24,
  padding: "2rem 2.5rem",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "1rem",
};

const heroTitle: React.CSSProperties = { fontSize: "1.75rem", fontWeight: 800, margin: 0 };
const heroSub: React.CSSProperties = { opacity: 0.85, marginTop: 6, margin: 0 };

const ctaBtn: React.CSSProperties = {
  padding: "0.7rem 1.5rem",
  background: "white",
  color: "#6366f1",
  borderRadius: 12,
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.95rem",
  flexShrink: 0,
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
};

const statCard: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "1.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const statIcon: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "1.25rem",
};

const panelCard: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "1.75rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const panelHeader: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  alignItems: "flex-start",
  marginBottom: "1.25rem",
};

const panelIcon: React.CSSProperties = {
  fontSize: 28,
  marginTop: 2,
};

const panelTitle: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "#111827",
  margin: 0,
};

const panelSub: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "#6b7280",
  margin: "2px 0 0",
};

const quickLinks: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.75rem",
  marginTop: "1.25rem",
};

const quickLink: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.9rem 0.5rem",
  background: "#f9fafb",
  borderRadius: 14,
  textDecoration: "none",
  transition: "background 0.15s",
  border: "1.5px solid #f0f0f0",
};

const aiBanner: React.CSSProperties = {
  background: "linear-gradient(135deg,#eef2ff,#f5f3ff)",
  border: "1.5px solid #c7d2fe",
  borderRadius: 20,
  padding: "1.5rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "1rem",
};

const privateBanner: React.CSSProperties = {
  background: "#f0fdf4",
  border: "1.5px solid #bbf7d0",
  borderRadius: 20,
  padding: "1.5rem 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "1rem",
};

const bannerTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#111827",
};

const bannerSub: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#6b7280",
  marginTop: 4,
};

const bannerBtn: React.CSSProperties = {
  padding: "0.65rem 1.4rem",
  background: "#6366f1",
  color: "white",
  borderRadius: 12,
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.9rem",
  flexShrink: 0,
};

const reportBtn: React.CSSProperties = {
  padding: "0.55rem 1.1rem",
  borderRadius: 10,
  border: "1.5px solid #c7d2fe",
  background: "#eef2ff",
  color: "#4338ca",
  fontWeight: 700,
  fontSize: "0.84rem",
  cursor: "pointer",
};

const quoteCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#fafafa,#f5f3ff)",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: "1.1rem 1.4rem",
  display: "flex",
  alignItems: "flex-start",
  gap: "0.85rem",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const recActCard: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 16,
  padding: "1.1rem",
  border: "1px solid #f0f0f0",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
};

