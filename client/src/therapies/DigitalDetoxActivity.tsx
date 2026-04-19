import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/navbar/AppNavbar";

type Props = { activity: { id: number; title: string; duration: number; difficulty: string } };

const STEPS = [
  { emoji: "📵", title: "Put your phone face-down", desc: "Place your device face-down and commit to not picking it up." },
  { emoji: "🖥️", title: "Close unnecessary tabs", desc: "Close any browser tabs or apps you don't absolutely need right now." },
  { emoji: "🔕", title: "Silence notifications", desc: "Enable Do Not Disturb on all your devices for the next few minutes." },
  { emoji: "🌿", title: "Notice how you feel offline", desc: "Observe the urge to check your phone. Just notice — don't act on it." },
  { emoji: "📓", title: "Reflect on screen & mood", desc: "Write or think: does heavy screen time make you feel more anxious? Tired? Disconnected?" },
  { emoji: "🌅", title: "Commit to one screen-free ritual", desc: "Choose one daily ritual to be screen-free: morning coffee, meals, or the first 30 min of your day." },
];

export default function DigitalDetoxActivity({ activity }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalSecs = activity.duration * 60;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, totalSecs)), 1000);
    return () => clearInterval(t);
  }, [paused, totalSecs]);

  function finish() {
    const pct = Math.round((elapsed / totalSecs) * 100);
    const score = Math.min(10, Math.round(((step + 1) / STEPS.length) * 10));
    const entry = { type: "digital-detox", title: activity.title, average: pct, score, date: new Date().toISOString() };
    const hist = JSON.parse(localStorage.getItem("mindcare_history") || "[]");
    hist.unshift(entry);
    localStorage.setItem("mindcare_history", JSON.stringify(hist));
    navigate("/activity-result", { state: { activity, score, average: pct } });
  }

  const current = STEPS[step];
  const progress = Math.round(((step) / STEPS.length) * 100);

  return (
    <div style={page}>
      <AppNavbar />
      <div style={wrap}>
        <div style={card}>
          <div style={header}>
            <h2 style={heading}>📵 Digital Detox Challenge</h2>
            <p style={subhead}>{activity.difficulty} · {activity.duration} min</p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: 6 }}>
              <span>Step {step + 1} of {STEPS.length}</span>
              <span>{progress}% complete</span>
            </div>
            <div style={progressTrack}>
              <div style={{ ...progressFill, width: `${progress}%` }} />
            </div>
          </div>

          {/* Current step */}
          <div style={stepCard}>
            <div style={{ fontSize: 52, textAlign: "center", marginBottom: "1rem" }}>{current.emoji}</div>
            <h3 style={stepTitle}>{current.title}</h3>
            <p style={stepDesc}>{current.desc}</p>
          </div>

          {/* Timer */}
          <div style={timerRow}>
            <span style={timerText}>
              ⏱ {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} / {activity.duration}:00
            </span>
          </div>

          {/* Controls */}
          <div style={controls}>
            <button style={ctrlBtn} onClick={() => setPaused(v => !v)}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button style={ctrlBtn} onClick={() => { setStep(0); setElapsed(0); setPaused(false); }}>
              🔄 Reset
            </button>
            {step < STEPS.length - 1 ? (
              <button style={nextBtn} onClick={() => setStep(s => s + 1)}>
                Next Step →
              </button>
            ) : (
              <button style={{ ...nextBtn, background: "linear-gradient(135deg,#10b981,#059669)" }} onClick={finish}>
                ✅ Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const page: React.CSSProperties  = { minHeight: "100vh", background: "#f8fafc" };
const wrap: React.CSSProperties  = { maxWidth: 540, margin: "2rem auto", padding: "0 1rem" };
const card: React.CSSProperties  = { background: "white", borderRadius: 24, padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" };
const header: React.CSSProperties = { textAlign: "center", marginBottom: "1.5rem" };
const heading: React.CSSProperties = { fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: 0 };
const subhead: React.CSSProperties = { color: "#6b7280", marginTop: 4 };
const progressTrack: React.CSSProperties = { height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" };
const progressFill: React.CSSProperties  = { height: "100%", background: "linear-gradient(135deg,#6366f1,#a855f7)", borderRadius: 99, transition: "width 0.4s ease" };
const stepCard: React.CSSProperties = { background: "#f9fafb", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid #f0f0f0" };
const stepTitle: React.CSSProperties = { fontWeight: 800, fontSize: "1.05rem", color: "#111827", textAlign: "center", margin: "0 0 0.5rem" };
const stepDesc: React.CSSProperties  = { color: "#6b7280", textAlign: "center", lineHeight: 1.65, margin: 0 };
const timerRow: React.CSSProperties  = { textAlign: "center", marginBottom: "1.25rem" };
const timerText: React.CSSProperties = { fontSize: "0.88rem", color: "#9ca3af", fontWeight: 600 };
const controls: React.CSSProperties  = { display: "flex", gap: "0.6rem", flexWrap: "wrap" };
const ctrlBtn: React.CSSProperties   = { flex: 1, padding: "0.65rem", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem" };
const nextBtn: React.CSSProperties   = { flex: 2, padding: "0.65rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" };
