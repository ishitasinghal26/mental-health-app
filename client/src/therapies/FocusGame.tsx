import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = { id: number; title: string; duration: number; };
type Circle   = { id: number; x: number; y: number; type: "calm" | "stress" };

function Btn({ onClick, bg, children }: { onClick: () => void; bg: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.55rem 1.25rem", borderRadius: 12, border: "none",
      background: bg, color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
    }}>{children}</button>
  );
}

function getResultMessage(score: number) {
  if (score < 80)  return "Your mind was restless — try slow breathing";
  if (score < 160) return "Nice focus — your mind is settling";
  return "Excellent calm focus 🧘";
}

export default function FocusGame({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  const [time,    setTime]    = useState(activity.duration * 60);
  const [score,   setScore]   = useState(0);
  const [combo,   setCombo]   = useState(0);
  const [message, setMessage] = useState("Tap the calm 🟢 circles — avoid the red 🔴 ones");
  const [circles, setCircles] = useState<Circle[]>([]);
  const [started, setStarted] = useState(false);
  const [paused,  setPaused]  = useState(false);

  // Countdown
  useEffect(() => {
    if (!started || paused) return;
    const t = setInterval(() => {
      setTime(s => {
        if (s <= 1) {
          clearInterval(t);
          navigate("/activity-result", { state: { activity, score, message: getResultMessage(score) } });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, paused, navigate, activity, score]);

  // Spawn orbs
  useEffect(() => {
    if (!started || paused) return;
    const spawn = setInterval(() => {
      setCircles(prev => [
        ...prev.slice(-7),
        { id: Math.random(), x: Math.random() * 85, y: Math.random() * 80, type: Math.random() > 0.45 ? "calm" : "stress" },
      ]);
    }, 850);
    return () => clearInterval(spawn);
  }, [started, paused]);

  function clickCircle(c: Circle) {
    if (paused) return;
    if (c.type === "calm") {
      setScore(s => s + 10 + combo * 2);
      setCombo(c => c + 1);
      setMessage(["Good focus ✨", "Stay present 🌿", "Nice and calm 💙", "You're doing great 🌸", "Relax your mind 🧘"][Math.floor(Math.random() * 5)]);
    } else {
      setScore(s => Math.max(0, s - 6));
      setCombo(0);
      setMessage("Slow down… breathe 🌬");
    }
    setCircles(prev => prev.filter(x => x.id !== c.id));
  }

  function handleReset() {
    setStarted(false); setPaused(false);
    setTime(activity.duration * 60); setScore(0); setCombo(0);
    setCircles([]); setMessage("Tap the calm 🟢 circles — avoid the red 🔴 ones");
  }

  return (
    <div style={{ height: "100vh", background: "radial-gradient(circle at center,#020617,#000)", color: "white", overflow: "hidden", position: "relative", fontFamily: "'Inter',system-ui" }}>
      {/* HUD */}
      <div style={{ position: "absolute", top: 16, left: 20, fontSize: "0.9rem", opacity: 0.85 }}>⏳ {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</div>
      <div style={{ position: "absolute", top: 16, right: 20, fontSize: "0.9rem", opacity: 0.85 }}>🌿 Score: {score} {combo > 1 ? `(×${combo})` : ""}</div>

      <div style={{ position: "absolute", top: 56, width: "100%", textAlign: "center", opacity: 0.8, fontSize: "1rem" }}>
        {message}
      </div>

      {/* Controls overlay */}
      {!started ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          <p style={{ opacity: 0.7, maxWidth: 360, textAlign: "center", lineHeight: 1.5 }}>
            Tap the <strong style={{ color: "#34d399" }}>green calm</strong> orbs to score, avoid the <strong style={{ color: "#fb7185" }}>red stress</strong> ones.
          </p>
          <Btn onClick={() => setStarted(true)} bg="#22c55e">▶ Start Game</Btn>
        </div>
      ) : (
        <>
          {paused && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", zIndex: 10 }}>
              <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>⏸ Paused</p>
            </div>
          )}
          {circles.map(c => (
            <div key={c.id} onClick={() => clickCircle(c)} style={{
              position: "absolute", left: `${c.x}%`, top: `${c.y}%`,
              width: 70, height: 70, borderRadius: "50%", cursor: "pointer",
              background: c.type === "calm" ? "radial-gradient(circle,#34d399,#059669)" : "radial-gradient(circle,#fb7185,#be123c)",
              boxShadow: c.type === "calm" ? "0 0 25px #34d399" : "0 0 25px #fb7185",
              transition: "transform .15s",
            }} />
          ))}
        </>
      )}

      {/* Controls bar */}
      {started && (
        <div style={{ position: "absolute", bottom: 24, width: "100%", display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          {paused
            ? <Btn onClick={() => setPaused(false)} bg="#22c55e">▶ Resume</Btn>
            : <Btn onClick={() => setPaused(true)}  bg="#f59e0b">⏸ Pause</Btn>
          }
          <Btn onClick={handleReset} bg="#6b7280">↺ Reset</Btn>
        </div>
      )}
    </div>
  );
}
