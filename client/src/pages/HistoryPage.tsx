import { useEffect, useState } from "react";

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
    return Math.round(
      history.reduce((a, b) => a + b.average, 0) / history.length
    );
  }

  function streakDays() {
    const days = new Set(history.map(h => new Date(h.date).toDateString()));
    return days.size;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
        color: "white",
        padding: "40px",
        fontFamily: "system-ui"
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: 40 }}>Your Progress</h1>

      {/* SUMMARY */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 40,
          marginTop: 40,
          flexWrap: "wrap"
        }}
      >
        <StatCard label="Sessions Completed" value={history.length} />
        <StatCard label="Average Wellness" value={averageScore() + "%"} />
        <StatCard label="Active Days" value={streakDays()} />
      </div>

      {/* SESSION LIST */}
      <div style={{ maxWidth: 600, margin: "60px auto" }}>
        {history.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#0f172a",
              padding: 16,
              borderRadius: 14,
              marginBottom: 14,
              border: "1px solid #1f2937"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{s.title}</b>
              <span>{s.average}%</span>
            </div>

            <div style={{ opacity: 0.6, marginTop: 6 }}>
              {new Date(s.date).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: "24px 40px",
        borderRadius: 18,
        textAlign: "center",
        border: "1px solid #1f2937"
      }}
    >
      <div style={{ fontSize: 34, fontWeight: "bold" }}>{value}</div>
      <div style={{ opacity: 0.6, marginTop: 6 }}>{label}</div>
    </div>
  );
}

