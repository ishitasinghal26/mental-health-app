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

const bodyParts = [
  "Forehead",
  "Eyes",
  "Jaw",
  "Neck",
  "Shoulders",
  "Chest",
  "Arms",
  "Hands",
  "Stomach",
  "Back",
  "Hips",
  "Thighs",
  "Knees",
  "Calves",
  "Feet"
];

export default function BodyScanActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const bgRef = useRef<HTMLAudioElement | null>(null);

  const [seconds, setSeconds] = useState(activity.duration * 60);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    voiceRef.current = new Audio("/audio/guided-meditation.mp3");
    voiceRef.current.volume = 0.8;

    bgRef.current = new Audio("/audio/rain.mp3");
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
    const scan = setInterval(() => {
      setIndex((i) => (i + 1) % bodyParts.length);
    }, 5000);

    return () => clearInterval(scan);
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

      <div
        style={{
          marginTop: 60,
          fontSize: 30,
          fontWeight: 500,
          padding: "25px 40px",
          borderRadius: 20,
          background: "rgba(236,72,153,0.15)",
          boxShadow: "0 0 40px rgba(236,72,153,0.5)",
          transition: "all 1s ease"
        }}
      >
        Focus on your {bodyParts[index]}
      </div>

      <p style={{ marginTop: 40, opacity: 0.6 }}>
        Relax this area and release tension
      </p>
    </div>
  );
}
