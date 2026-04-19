import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number; title: string; description: string;
  duration: number; difficulty: string; category: string; type: string; ui: string;
};

const STEPS = [
  { label: "Name 5 things you can SEE 👁️",    count: 5 },
  { label: "Name 4 things you can TOUCH 🤚",   count: 4 },
  { label: "Name 3 things you can HEAR 👂",    count: 3 },
  { label: "Name 2 things you can SMELL 👃",   count: 2 },
  { label: "Name 1 thing you can TASTE 👅",    count: 1 },
];

export default function GroundingActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  const [started,  setStarted]  = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [step,     setStep]     = useState(0);
  const [text,     setText]     = useState("");
  const [answers,  setAnswers]  = useState<string[]>([]);

  function handleStart() { setStarted(true); }
  function handlePause() { setPaused(p => !p); }
  function handleReset() {
    setStarted(false); setPaused(false);
    setStep(0); setText(""); setAnswers([]);
  }

  function handleNext() {
    if (!text.trim() || paused) return;
    const updated = [...answers, text.trim()];
    setAnswers(updated);
    setText("");
    if (step === STEPS.length - 1) {
      navigate("/activity-result", { state: { activity } });
    } else {
      setStep(step + 1);
    }
  }

  const totalAnswers = STEPS.reduce((s, st) => s + st.count, 0);
  const doneAnswers  = answers.length;
  const progress     = Math.round((doneAnswers / totalAnswers) * 100);

  return (
    <div style={{
      height: "100vh", background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
      color: "white", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      fontFamily: "'Inter',system-ui", textAlign: "center", padding: 20, gap: "1.25rem",
    }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>5-4-3-2-1 Grounding</h1>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", opacity: 0.6, marginBottom: 6 }}>
          <span>Progress</span>
          <span>Step {started ? step + 1 : 0} of {STEPS.length}</span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#a78bfa,#ec4899)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {!started ? (
        <div style={{ opacity: 0.7, maxWidth: 400, lineHeight: 1.6 }}>
          <p style={{ marginBottom: "1rem" }}>Use your senses to anchor yourself to the present moment.</p>
          <button onClick={handleStart} style={btnStyle("#22c55e")}>▶ Start</button>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, opacity: paused ? 0.5 : 1 }}>
            {STEPS[step].label}
          </h2>

          {paused ? (
            <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>Session paused — press Resume to continue</p>
          ) : (
            <>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNext()}
                placeholder="Type your answer and press Enter or Next..."
                style={{
                  padding: "12px 18px", borderRadius: 12, border: "none",
                  width: "100%", maxWidth: 340, background: "#1e293b",
                  color: "white", fontSize: "1rem", outline: "none",
                }}
              />

              {/* Previous answers for this step */}
              {answers.length > 0 && (
                <div style={{ fontSize: "0.8rem", opacity: 0.5, maxWidth: 340 }}>
                  ✓ {answers[answers.length - 1]}
                </div>
              )}
            </>
          )}

          {/* Controls */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            {!paused ? (
              <>
                <button onClick={handleNext} disabled={!text.trim()} style={btnStyle("#ec4899")}>Next →</button>
                <button onClick={handlePause} style={btnStyle("#f59e0b")}>⏸ Pause</button>
              </>
            ) : (
              <button onClick={handlePause} style={btnStyle("#22c55e")}>▶ Resume</button>
            )}
            <button onClick={handleReset} style={btnStyle("#6b7280")}>↺ Reset</button>
          </div>
        </>
      )}
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: "0.7rem 1.5rem", borderRadius: 14, border: "none",
    background: bg, color: "white", fontSize: "0.95rem",
    fontWeight: 700, cursor: "pointer",
  };
}
