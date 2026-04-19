import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number; title: string; description: string;
  duration: number; difficulty: string; category: string; type: string; ui: string;
};

const BODY_PARTS = [
  "Forehead", "Eyes & Jaw", "Neck", "Shoulders",
  "Chest", "Arms & Hands", "Stomach", "Back",
  "Hips & Thighs", "Knees", "Calves & Feet",
];

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.7rem 1.5rem", borderRadius: 14, border: "none",
      background: color, color: "white", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
    }}>{children}</button>
  );
}

export default function BodyScanActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const bgRef    = useRef<HTMLAudioElement | null>(null);

  const total = activity.duration * 60;
  const [seconds, setSeconds] = useState(total);
  const [index,   setIndex]   = useState(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    voiceRef.current = new Audio("/audio/guided-meditation.mp3");
    voiceRef.current.volume = 0.8;
    bgRef.current = new Audio("/audio/rain.mp3");
    bgRef.current.loop = true;
    bgRef.current.volume = 0.25;
    return () => { voiceRef.current?.pause(); bgRef.current?.pause(); };
  }, []);

  // Countdown
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); voiceRef.current?.pause(); bgRef.current?.pause(); navigate("/activity-result", { state: { activity } }); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, navigate, activity]);

  // Body part rotation
  useEffect(() => {
    if (!running) return;
    const scan = setInterval(() => setIndex(i => (i + 1) % BODY_PARTS.length), 5000);
    return () => clearInterval(scan);
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = ((total - seconds) / total) * 100;

  function handleStart()  { setStarted(true); setRunning(true); voiceRef.current?.play().catch(()=>{}); bgRef.current?.play().catch(()=>{}); }
  function handlePause()  { setRunning(false); voiceRef.current?.pause(); bgRef.current?.pause(); }
  function handleResume() { setRunning(true); voiceRef.current?.play().catch(()=>{}); bgRef.current?.play().catch(()=>{}); }
  function handleReset()  {
    setRunning(false); setStarted(false); setSeconds(total); setIndex(0);
    voiceRef.current?.pause(); bgRef.current?.pause();
    if (voiceRef.current) voiceRef.current.currentTime = 0;
    if (bgRef.current)    bgRef.current.currentTime    = 0;
  }

  return (
    <div style={{
      height: "100vh", background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
      color: "white", display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", textAlign: "center",
      fontFamily: "'Inter',system-ui", padding: 20, gap: "1.5rem",
    }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>{activity.title}</h1>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", opacity: 0.6, marginBottom: 6 }}>
          <span>Time remaining</span><span>{fmt(seconds)}</span>
        </div>
        <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#a78bfa,#ec4899)", borderRadius: 99, transition: "width 1s linear" }} />
        </div>
      </div>

      {/* Body part highlight */}
      <div style={{
        fontSize: "1.5rem", fontWeight: 600,
        padding: "1.5rem 2.5rem", borderRadius: 20,
        background: "rgba(236,72,153,0.15)",
        boxShadow: started ? "0 0 40px rgba(236,72,153,0.5)" : "none",
        transition: "all 1s ease", opacity: started ? 1 : 0.4,
        minWidth: 240,
      }}>
        {started ? `Focus on your ${BODY_PARTS[index]}` : "Press Start to begin"}
      </div>

      <p style={{ opacity: 0.5, fontSize: "0.85rem", margin: 0 }}>Relax this area and release tension</p>

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
