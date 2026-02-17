<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { calculateStreak } from "../utils/streak";

type Session = {
  type: string;
  title: string;
  average: number;
  date: string;
  score?: number | null;
};

export default function DashboardPage() {
  const [streak, setStreak] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<string>("None yet");
  const [avgWellness, setAvgWellness] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("mindcare_history");
    if (!stored) return;

    const history: Session[] = JSON.parse(stored);
    if (!history.length) return;

    // LAST ACTIVITY
    setLastActivity(history[0].title);

    // STREAK 🔥
    setStreak(calculateStreak(history));

    // WEEKLY COUNT
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    const weekSessions = history.filter((s) => {
      const d = new Date(s.date);
      return d >= weekAgo && d <= today;
    });

    setWeeklyCount(weekSessions.length);

    // AVERAGE WELLNESS
    const avg =
      Math.round(
        history.reduce((sum, s) => sum + (s.average || 0), 0) / history.length
      ) || 0;

    setAvgWellness(avg);
  }, []);

  return (
    <div style={container}>
      <h1>Welcome back 👋</h1>
      <p style={{ opacity: 0.7 }}>Here's your mental wellness progress</p>

      <div style={cards}>
        <div style={card}>
          <h3>🔥 Current Streak</h3>
          <h2>{streak} days</h2>
        </div>

        <div style={card}>
          <h3>📅 This Week</h3>
          <h2>{weeklyCount} sessions</h2>
        </div>

        <div style={card}>
          <h3>📊 Average Wellness</h3>
          <h2>{avgWellness}%</h2>
        </div>

        <div style={card}>
          <h3>🧠 Last Activity</h3>
          <h2>{lastActivity}</h2>
        </div>
      </div>

      <div style={cta}>
        <h2>Keep Going 💙</h2>
        <p>
          Small daily actions build a strong and calm mind.
          Consistency matters more than perfection.
        </p>

        <Link to="/activities">
          <button style={btn}>Start Activity</button>
        </Link>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  padding: "2rem",
};

const cards: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "1.5rem",
  marginTop: "2rem",
};

const card: React.CSSProperties = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const cta: React.CSSProperties = {
  marginTop: "3rem",
  padding: "2rem",
  borderRadius: "20px",
  background: "linear-gradient(135deg,#6366f1,#ec4899)",
  color: "white",
  textAlign: "center",
};

const btn: React.CSSProperties = {
  marginTop: "1rem",
  padding: "10px 22px",
  borderRadius: "12px",
  border: "none",
  background: "white",
  color: "#111",
  fontWeight: 600,
  cursor: "pointer",
};
=======
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import SummaryCards from "../components/dashboard/SummaryCards";
import MoodQuickCheck from "../components/dashboard/MoodQuickCheck";
import RecentActivity from "../components/dashboard/RecentActivity";
import AISuggestions from "../components/dashboard/AISuggestions";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  return (
    <div className="dashboard-root">
      <DashboardNavbar />

      <main className="dashboard-content">
        <h1 className="dashboard-title">Your Dashboard</h1>
        <p className="dashboard-subtitle">
          A quick overview of your mental wellness journey
        </p>

        <SummaryCards />

        <div className="dashboard-grid">
          <MoodQuickCheck />
          <AISuggestions />
        </div>

        <RecentActivity />
      </main>
    </div>
  );
}
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
