import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import { apiClient } from "../services/apiClient";
import { calculateStreak } from "../utils/streak";
import DassReportModal from "../components/dashboard/DassReportModal";

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
  const [streak, setStreak] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [avgWellness, setAvgWellness] = useState(0);
  const [showReport, setShowReport] = useState(false);

  // Fetch assessment
  useEffect(() => {
    apiClient.get("/assessment/latest")
      .then((res) => {
        if (res.data?.summary) setAssessment(res.data);
      })
      .catch(() => {});
  }, []);

  // Local activity history stats
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
    <div style={page}>
      <AppNavbar />
      <div style={container}>
        {/* Hero greeting */}
        <div style={heroCard}>
          <div>
            <h1 style={heroTitle}>{greeting}, {firstName}! 👋</h1>
            <p style={heroSub}>
              {aiEnabled
                ? "Your AI companion is active. Here's your personalised wellness overview."
                : "Private mode is on. Your data stays completely on your device."}
            </p>
          </div>
          <Link to="/activities" style={ctaBtn}>Start Activity ✨</Link>
        </div>

        {/* Stats row */}
        <div style={statsGrid}>
          <StatCard icon="🔥" label="Current Streak" value={`${streak} days`} color="#6366f1" />
          <StatCard icon="📅" label="This Week" value={`${weeklyCount} sessions`} color="#a855f7" />
          <StatCard icon="📊" label="Avg Wellness" value={`${avgWellness}%`} color="#10b981" />
          <StatCard icon="🤖" label="Mode" value={aiEnabled ? "AI Enabled" : "Private"} color={aiEnabled ? "#6366f1" : "#10b981"} />
        </div>

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

          {/* Quick links */}
          <div style={panelCard}>
            <h2 style={panelTitle}>Quick Actions</h2>
            <p style={panelSub}>What would you like to do today?</p>
            <div style={quickLinks}>
              <QuickLink to="/mood"       icon="💭" label="Log Mood"   color="#6366f1" />
              <QuickLink to="/journal"    icon="📓" label="Journal"    color="#a855f7" />
              <QuickLink to="/activities" icon="🎯" label="Activity"   color="#f97316" />
              <QuickLink to="/therapists" icon="🩺" label="Therapists" color="#0284c7" />
              <QuickLink to="/history"    icon="📊" label="History"    color="#10b981" />
              {aiEnabled && <QuickLink to="/chatbot" icon="🤖" label="AI Chat" color="#6366f1" />}
              <QuickLink to="/profile"    icon="👤" label="Profile"    color="#6b7280" />
            </div>
          </div>
        </div>

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
