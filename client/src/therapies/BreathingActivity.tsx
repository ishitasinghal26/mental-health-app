import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category: string;
  type: string;
  ui: string;
};

export default function BreathingActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [started, setStarted] = useState(false);
  const [seconds, setSeconds] = useState(activity.duration * 60);
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");

  // prepare audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/breathing.mp3");
    audioRef.current.loop = true;
  }, []);

  // start session
  const startBreathing = () => {
    setStarted(true);
    audioRef.current?.play();
  };

  // timer
  useEffect(() => {
    if (!started) return;

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          audioRef.current?.pause();
          navigate("/activity-result", { state: { activity } });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, navigate, activity]);

  // breathing animation
  useEffect(() => {
    if (!started) return;

    const breathing = setInterval(() => {
      setPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
    }, 4000);

    return () => clearInterval(breathing);
  }, [started]);

  return (
    <div
      style={{
        height: "100vh",
        background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "system-ui"
      }}
    >
      <h1>{activity.title}</h1>

      <h2>
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </h2>

      {!started ? (
        <button
          onClick={startBreathing}
          style={{
            marginTop: 30,
            padding: "14px 28px",
            borderRadius: 14,
            border: "none",
            background: "#22c55e",
            color: "white",
            fontSize: 18,
            cursor: "pointer"
          }}
        >
          Start Breathing 🌿
        </button>
      ) : (
        <div
          style={{
            marginTop: 30,
            width: phase === "inhale" ? 260 : 160,
            height: phase === "inhale" ? 260 : 160,
            borderRadius: "50%",
            background: "radial-gradient(circle,#a78bfa,#ec4899,#6366f1)",
            transition: "all 4s ease-in-out",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: "bold",
            boxShadow:
              phase === "inhale"
                ? "0 0 80px rgba(168,85,247,0.8)"
                : "0 0 30px rgba(168,85,247,0.3)"
          }}
        >
          {phase === "inhale" ? "Breathe In" : "Breathe Out"}
        </div>
      )}

      <p style={{ marginTop: 20, opacity: 0.7 }}>
        Slow breathing calms your nervous system
      </p>
    </div>
  );
}

