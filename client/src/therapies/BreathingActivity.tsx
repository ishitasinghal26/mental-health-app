import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number; title: string; description: string;
  duration: number; difficulty: string; category: string; type: string; ui: string;
};

export default function BreathingActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phase,   setPhase]   = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(activity.duration * 60);
  const [running, setRunning] = useState(false);   // started & not paused
  const [started, setStarted] = useState(false);

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio("/audio/breathing.mp3");
    audioRef.current.loop = true;
    return () => { audioRef.current?.pause(); };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(t);
          audioRef.current?.pause();
          navigate("/activity-result", { state: { activity } });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, navigate, activity]);

  // Breathing phase cycle (4s inhale → 1s hold → 4s exhale → repeat)
  useEffect(() => {
    if (!running) return;
    const CYCLE: { phase: "inhale" | "hold" | "exhale"; ms: number }[] = [
      { phase: "inhale", ms: 4000 },
      { phase: "hold",   ms: 1000 },
      { phase: "exhale", ms: 4000 },
    ];
    let idx = 0;
    const tick = () => {
      setPhase(CYCLE[idx].phase);
      idx = (idx + 1) % CYCLE.length;
    };
    tick();
    const id = setInterval(tick, CYCLE[idx === 0 ? 2 : idx - 1].ms);
    return () => clearInterval(id);
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = ((activity.duration * 60 - seconds) / (activity.duration * 60)) * 100;

  function handleStart() { setStarted(true); setRunning(true); audioRef.current?.play().catch(() => {}); }
  function handlePause() { setRunning(false); audioRef.current?.pause(); }
  function handleResume() { setRunning(true); audioRef.current?.play().catch(() => {}); }
  function handleReset() {
    setRunning(false); setStarted(false);
    setSeconds(activity.duration * 60); setPhase("inhale");
    audioRef.current?.pause();
    if (audioRef.current) { audioRef.current.currentTime = 0; }
  }

  const PHASE_LABEL = { inhale: "Breathe In 🌬️", hold: "Hold ✋", exhale: "Breathe Out 😮‍💨" };
  const PHASE_SIZE  = { inhale: 240, hold: 200, exhale: 140 };

  return (
    <div style={{
      height: "100vh", background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
      color: "white", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", textAlign: "center", fontFamily: "'Inter',system-ui",
      padding: 20, gap: "1.5rem",
    }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>{activity.title}</h1>

      {/* Timer + progress */}
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", opacity: 0.6, marginBottom: 6 }}>
          <span>Time remaining</span><span>{fmt(seconds)}</span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#a78bfa,#ec4899)", borderRadius: 99, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Breathing circle */}
      {started ? (
        <div style={{
          width: PHASE_SIZE[phase], height: PHASE_SIZE[phase], borderRadius: "50%",
          background: "radial-gradient(circle,#a78bfa,#ec4899,#6366f1)",
          transition: "all 4s ease-in-out",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem", fontWeight: 700,
          boxShadow: phase === "inhale" ? "0 0 80px rgba(168,85,247,0.8)" : "0 0 30px rgba(168,85,247,0.3)",
        }}>
          {PHASE_LABEL[phase]}
        </div>
      ) : (
        <div style={{ width: 160, height: 160, borderRadius: "50%", background: "rgba(168,85,247,0.25)", border: "2px dashed rgba(168,85,247,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", opacity: 0.7 }}>
          Ready
        </div>
      )}

      <p style={{ opacity: 0.6, margin: 0 }}>Slow breathing calms your nervous system</p>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        {!started ? (
          <Btn onClick={handleStart} color="#22c55e">▶ Start</Btn>
        ) : running ? (
          <Btn onClick={handlePause} color="#f59e0b">⏸ Pause</Btn>
        ) : (
          <Btn onClick={handleResume} color="#22c55e">▶ Resume</Btn>
        )}
        <Btn onClick={handleReset} color="#6b7280">↺ Reset</Btn>
      </div>
    </div>
  );
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.7rem 1.5rem", borderRadius: 14, border: "none",
      background: color, color: "white", fontSize: "0.95rem",
      fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
    }}>
      {children}
    </button>
  );
}
