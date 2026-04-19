import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number; title: string; description: string;
  duration: number; difficulty: string; category: string; type: string; ui: string;
};

const STEPS = [
  "Sit comfortably and relax your shoulders",
  "Gently close your eyes",
  "Take a slow deep breath in",
  "Now slowly breathe out",
  "Let thoughts come and go without judging",
  "Bring your attention back to breathing",
  "Feel the calmness spreading in your body",
];

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.7rem 1.5rem", borderRadius: 14, border: "none",
      background: color, color: "white", fontSize: "0.95rem",
      fontWeight: 700, cursor: "pointer",
    }}>{children}</button>
  );
}

export default function MeditationActivity({ activity }: { activity: Activity }) {
  const navigate  = useNavigate();
  const voiceRef  = useRef<HTMLAudioElement | null>(null);
  const bgRef     = useRef<HTMLAudioElement | null>(null);

  const total = activity.duration * 60;
  const [seconds, setSeconds] = useState(total);
  const [step,    setStep]    = useState(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    voiceRef.current = new Audio("/audio/guided-meditation.mp3");
    voiceRef.current.volume = 1;
    bgRef.current = new Audio("/audio/nature.mp3");
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

  // Step rotation
  useEffect(() => {
    if (!running) return;
    const g = setInterval(() => setStep(s => (s + 1) % STEPS.length), 8000);
    return () => clearInterval(g);
  }, [running]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const progress = ((total - seconds) / total) * 100;

  function handleStart()  { setStarted(true); setRunning(true); voiceRef.current?.play().catch(()=>{}); bgRef.current?.play().catch(()=>{}); }
  function handlePause()  { setRunning(false); voiceRef.current?.pause(); bgRef.current?.pause(); }
  function handleResume() { setRunning(true);  voiceRef.current?.play().catch(()=>{}); bgRef.current?.play().catch(()=>{}); }
  function handleReset()  {
    setRunning(false); setStarted(false); setSeconds(total); setStep(0);
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

      {/* Guidance step */}
      <p style={{ fontSize: "1.3rem", maxWidth: 480, lineHeight: 1.6, opacity: started ? 0.9 : 0.4, transition: "opacity 1s ease", margin: 0 }}>
        {started ? STEPS[step] : "Press Start to begin your meditation"}
      </p>

      <p style={{ opacity: 0.5, margin: 0, fontSize: "0.85rem" }}>Just breathe naturally — no effort needed</p>

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
