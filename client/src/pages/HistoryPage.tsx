import { useEffect, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";

type Session = {
  type: string;
  title: string;
  average: number;
  date: string;
  score?: number | null;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("mindcare_history") || "[]");
    setHistory(data);
  }, []);

  function averageScore() {
    if (!history.length) return 0;
    return Math.round(history.reduce((a, b) => a + b.average, 0) / history.length);
  }

  const uniqueDays = new Set(history.map((h) => new Date(h.date).toDateString())).size;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <AppNavbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: "1.5rem" }}>
          📊 Activity History
        </h1>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <StatCard label="Sessions" value={history.length} color="#6366f1" />
          <StatCard label="Avg Wellness" value={`${averageScore()}%`} color="#a855f7" />
          <StatCard label="Active Days" value={uniqueDays} color="#10b981" />
        </div>

        {/* Timeline */}
        {history.length === 0 ? (
          <div style={empty}>
            <div style={{ fontSize: 40 }}>🌱</div>
            <p style={{ color: "#6b7280", marginTop: "0.75rem" }}>
              No activity history yet. Start an activity to see your progress here!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {history.map((s, i) => (
              <div key={i} style={sessionCard}>
                <div style={sessionLeft}>
                  <div style={sessionTitle}>{s.title}</div>
                  <div style={sessionDate}>{new Date(s.date).toLocaleString()}</div>
                </div>
                <div style={{ ...sessionScore, color: s.average >= 70 ? "#10b981" : s.average >= 40 ? "#f59e0b" : "#ef4444" }}>
                  {s.average}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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

/* Styles */
const empty: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "3rem",
  textAlign: "center",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const sessionCard: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  padding: "1.1rem 1.5rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  border: "1px solid #f0f0f0",
};

const sessionLeft: React.CSSProperties = { flex: 1 };
const sessionTitle: React.CSSProperties = { fontWeight: 600, color: "#111827", fontSize: "0.95rem" };
const sessionDate: React.CSSProperties = { fontSize: "0.8rem", color: "#9ca3af", marginTop: 2 };
const sessionScore: React.CSSProperties = { fontSize: "1.2rem", fontWeight: 800 };
