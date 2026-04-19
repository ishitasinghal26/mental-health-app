import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/navbar/AppNavbar";

type Props = { activity: { id: number; title: string; duration: number; difficulty: string } };

const PROMPTS = [
  "Who is this letter to? (yourself, a friend, someone you miss, or someone you need to forgive)",
  "What's been on your mind about this person — or yourself?",
  "What do you want them — or you — to know but never said?",
  "What feelings come up as you write this?",
  "What would you want to say if there were no consequences?",
  "What do you hope for — for yourself or for them?",
];

export default function LetterWritingActivity({ activity }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(PROMPTS.length).fill(""));
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const totalSecs = activity.duration * 60;

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, totalSecs)), 1000);
    return () => clearInterval(t);
  }, [paused, totalSecs]);

  function finish() {
    const filled = answers.filter(a => a.trim().length > 0).length;
    const score = Math.min(10, Math.round((filled / PROMPTS.length) * 10));
    const pct = Math.round((elapsed / totalSecs) * 100);
    const entry = { type: "letter-writing", title: activity.title, average: pct, score, date: new Date().toISOString() };
    const hist = JSON.parse(localStorage.getItem("mindcare_history") || "[]");
    hist.unshift(entry);
    localStorage.setItem("mindcare_history", JSON.stringify(hist));
    navigate("/activity-result", { state: { activity, score, average: pct } });
  }

  const progress = Math.round((step / PROMPTS.length) * 100);

  return (
    <div style={page}>
      <AppNavbar />
      <div style={wrap}>
        <div style={card}>
          <div style={header}>
            <h2 style={heading}>✉️ Write a Letter</h2>
            <p style={subhead}>{activity.difficulty} · {activity.duration} min · Unsent — just for you</p>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6b7280", marginBottom: 6 }}>
              <span>Prompt {step + 1} of {PROMPTS.length}</span>
              <span>{progress}% done</span>
            </div>
            <div style={progressTrack}>
              <div style={{ ...progressFill, width: `${progress}%` }} />
            </div>
          </div>

          {/* Prompt */}
          <div style={promptCard}>
            <p style={promptText}>💭 {PROMPTS[step]}</p>
            <textarea
              style={textArea}
              placeholder="Write freely — no judgement, no audience…"
              value={answers[step]}
              onChange={e => {
                const a = [...answers];
                a[step] = e.target.value;
                setAnswers(a);
              }}
              rows={5}
            />
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
            <button style={{ ...ctrlBtn, opacity: step === 0 ? 0.4 : 1 }} disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
            {step < PROMPTS.length - 1 ? (
              <button style={nextBtn} onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            ) : (
              <button style={{ ...nextBtn, background: "linear-gradient(135deg,#10b981,#059669)" }} onClick={finish}>
                ✅ Seal the Letter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const page: React.CSSProperties  = { minHeight: "100vh", background: "#f8fafc" };
const wrap: React.CSSProperties  = { maxWidth: 580, margin: "2rem auto", padding: "0 1rem" };
const card: React.CSSProperties  = { background: "white", borderRadius: 24, padding: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" };
const header: React.CSSProperties = { textAlign: "center", marginBottom: "1.5rem" };
const heading: React.CSSProperties = { fontSize: "1.3rem", fontWeight: 800, color: "#111827", margin: 0 };
const subhead: React.CSSProperties = { color: "#6b7280", marginTop: 4 };
const progressTrack: React.CSSProperties = { height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" };
const progressFill: React.CSSProperties  = { height: "100%", background: "linear-gradient(135deg,#a855f7,#ec4899)", borderRadius: 99, transition: "width 0.4s ease" };
const promptCard: React.CSSProperties   = { background: "#fdf4ff", borderRadius: 16, padding: "1.35rem", marginBottom: "1.25rem", border: "1px solid #e9d5ff" };
const promptText: React.CSSProperties   = { fontWeight: 700, color: "#6b21a8", fontSize: "0.95rem", marginBottom: "0.85rem", lineHeight: 1.5 };
const textArea: React.CSSProperties     = { width: "100%", border: "1.5px solid #e9d5ff", borderRadius: 12, padding: "0.75rem", fontSize: "0.9rem", fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", background: "white" };
const timerRow: React.CSSProperties     = { textAlign: "center", marginBottom: "1.25rem" };
const timerText: React.CSSProperties    = { fontSize: "0.88rem", color: "#9ca3af", fontWeight: 600 };
const controls: React.CSSProperties     = { display: "flex", gap: "0.6rem", flexWrap: "wrap" };
const ctrlBtn: React.CSSProperties      = { flex: 1, padding: "0.65rem", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem" };
const nextBtn: React.CSSProperties      = { flex: 2, padding: "0.65rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#a855f7,#ec4899)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" };
