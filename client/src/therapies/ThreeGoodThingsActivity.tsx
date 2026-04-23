import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/navbar/AppNavbar";
import { useAuth } from "../context/AuthContext";

type Props = { activity: { id: number; title: string; duration: number; difficulty: string } };

const PROMPTS = [
  { q: "What's the first good thing that happened today?", placeholder: "Even tiny things count — a warm shower, a kind smile, good food…" },
  { q: "What's the second good thing?", placeholder: "Something you noticed, felt, experienced, or accomplished…" },
  { q: "What's the third good thing?", placeholder: "Look for something you might usually overlook…" },
];

const AFFIRMATIONS = [
  "✨ Noticing good things rewires your brain for positivity over time.",
  "🌱 This practice, done daily, is one of the most evidence-backed mood boosters.",
  "💛 You're training your brain to see more light — keep going.",
  "🌟 Even on hard days, three good things exist. You just found them.",
];

export default function ThreeGoodThingsActivity({ activity }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0); // 0,1,2 = prompts; 3 = summary
  const [answers, setAnswers] = useState(["", "", ""]);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalSecs = activity.duration * 60;
  const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

  useEffect(() => {
    if (paused || step >= 3) return;
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, totalSecs)), 1000);
    return () => clearInterval(t);
  }, [paused, step, totalSecs]);

  function finish() {
    const filled = answers.filter(a => a.trim().length > 0).length;
    const score = Math.min(10, filled * 3 + Math.floor(elapsed / 30));
    const pct = Math.min(100, Math.round((filled / 3) * 100));
    const entry = { type: "three-good-things", title: activity.title, average: pct, score, date: new Date().toISOString() };
    const hist = JSON.parse(localStorage.getItem(`mindcare_history_${user?.id}`) || "[]");
    hist.unshift(entry);
    localStorage.setItem(`mindcare_history_${user?.id}`, JSON.stringify(hist));
    navigate("/activity-result", { state: { activity, score, average: pct } });
  }

  // Summary screen
  if (step === 3) {
    return (
      <div style={page}>
        <AppNavbar />
        <div style={wrap}>
          <div style={card}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 52 }}>🌟</div>
              <h2 style={{ fontWeight: 800, color: "#111827", margin: "0.5rem 0 0.25rem" }}>
                Today's Three Good Things
              </h2>
              <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>{affirmation}</p>
            </div>
            {answers.map((ans, i) => (
              <div key={i} style={summaryCard}>
                <div style={summaryNum}>{i + 1}</div>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.6 }}>{ans || "(unanswered)"}</p>
              </div>
            ))}
            <button style={finishBtn} onClick={finish}>✅ Save &amp; See Score</button>
          </div>
        </div>
      </div>
    );
  }

  const current = PROMPTS[step];
  const progress = Math.round((step / 3) * 100);

  return (
    <div style={page}>
      <AppNavbar />
      <div style={wrap}>
        <div style={card}>
          <div style={header}>
            <h2 style={heading}>🌟 3 Good Things Today</h2>
            <p style={subhead}>{activity.difficulty} · {activity.duration} min · Positive Psychology</p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: 6 }}>
              <span>Thing {step + 1} of 3</span>
              <span>{progress}% done</span>
            </div>
            <div style={progressTrack}>
              <div style={{ ...progressFill, width: `${progress}%` }} />
            </div>
          </div>

          {/* Prompt */}
          <div style={promptCard}>
            <p style={promptText}>✨ {current.q}</p>
            <textarea
              style={textArea}
              placeholder={current.placeholder}
              value={answers[step]}
              onChange={e => {
                const a = [...answers];
                a[step] = e.target.value;
                setAnswers(a);
              }}
              rows={4}
            />
          </div>

          {/* Tip */}
          <div style={tipBox}>
            💡 <em>You don't need big events. Small moments matter just as much.</em>
          </div>

          {/* Timer */}
          <div style={timerRow}>
            <span style={timerText}>⏱ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {activity.duration}:00</span>
          </div>

          {/* Controls */}
          <div style={controls}>
            <button style={ctrlBtn} onClick={() => setPaused(v => !v)}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button style={{ ...ctrlBtn, opacity: step === 0 ? 0.4 : 1 }} disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
            <button style={nextBtn} onClick={() => setStep(s => s + 1)}>
              {step === 2 ? "Review →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };
const wrap: React.CSSProperties = { maxWidth: 520, margin: "2rem auto", padding: "0 1rem" };
const card: React.CSSProperties = { background: "white", borderRadius: 24, padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" };
const header: React.CSSProperties = { textAlign: "center", marginBottom: "1.5rem" };
const heading: React.CSSProperties = { fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: 0 };
const subhead: React.CSSProperties = { color: "#6b7280", marginTop: 4 };
const progressTrack: React.CSSProperties = { height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" };
const progressFill: React.CSSProperties = { height: "100%", background: "linear-gradient(135deg,#f59e0b,#10b981)", borderRadius: 99, transition: "width 0.4s ease" };
const promptCard: React.CSSProperties = { background: "#fffbeb", borderRadius: 16, padding: "1.35rem", marginBottom: "1rem", border: "1px solid #fde68a" };
const promptText: React.CSSProperties = { fontWeight: 700, color: "#92400e", fontSize: "0.95rem", marginBottom: "0.85rem", lineHeight: 1.5 };
const textArea: React.CSSProperties = { width: "100%", border: "1.5px solid #fde68a", borderRadius: 12, padding: "0.75rem", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", background: "white" };
const tipBox: React.CSSProperties = { background: "#f0fdf4", borderRadius: 10, padding: "0.65rem 0.9rem", fontSize: "0.82rem", color: "#065f46", marginBottom: "0.9rem" };
const timerRow: React.CSSProperties = { textAlign: "center", marginBottom: "1.25rem" };
const timerText: React.CSSProperties = { fontSize: "0.88rem", color: "#9ca3af", fontWeight: 600 };
const controls: React.CSSProperties = { display: "flex", gap: "0.6rem", flexWrap: "wrap" };
const ctrlBtn: React.CSSProperties = { flex: 1, padding: "0.65rem", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem" };
const nextBtn: React.CSSProperties = { flex: 2, padding: "0.65rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#10b981)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" };
const summaryCard: React.CSSProperties = { display: "flex", gap: "1rem", alignItems: "flex-start", background: "#f9fafb", borderRadius: 14, padding: "1rem", marginBottom: "0.75rem", border: "1px solid #f0f0f0" };
const summaryNum: React.CSSProperties = { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#10b981)", color: "white", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const finishBtn: React.CSSProperties = { width: "100%", padding: "0.85rem", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer", marginTop: "0.5rem" };
