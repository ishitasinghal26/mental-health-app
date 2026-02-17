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

const steps = [
  "Sit comfortably and relax your shoulders",
  "Gently close your eyes",
  "Take a slow deep breath in",
  "Now slowly breathe out",
  "Let thoughts come and go without judging",
  "Bring your attention back to breathing",
  "Feel the calmness spreading in your body"
];

export default function MeditationActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const bgRef = useRef<HTMLAudioElement | null>(null);

  const [seconds, setSeconds] = useState(activity.duration * 60);
  const [step, setStep] = useState(0);

  useEffect(() => {
    voiceRef.current = new Audio("/audio/guided-meditation.mp3");
    voiceRef.current.volume = 1;

    bgRef.current = new Audio("/audio/nature.mp3");
    bgRef.current.loop = true;
    bgRef.current.volume = 0.25;

    voiceRef.current.play().catch(() => {});
    bgRef.current.play().catch(() => {});

    return () => {
      voiceRef.current?.pause();
      bgRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          navigate("/activity-result", { state: { activity } });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, activity]);

  useEffect(() => {
    const guide = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 8000);

    return () => clearInterval(guide);
  }, []);

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
        fontFamily: "system-ui",
        padding: 20
      }}
    >
      <h1>{activity.title}</h1>

      <h2 style={{ marginTop: 20 }}>
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </h2>

      <p
        style={{
          marginTop: 40,
          fontSize: 24,
          maxWidth: 500,
          lineHeight: 1.6,
          opacity: 0.9,
          transition: "opacity 1s ease"
        }}
      >
        {steps[step]}
      </p>

      <p style={{ marginTop: 30, opacity: 0.6 }}>
        Just breathe naturally — no effort needed
      </p>
    </div>
  );
}

