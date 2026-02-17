import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = {
  id: number;
  title: string;
  duration: number;
};

type Circle = {
  id: number;
  x: number;
  y: number;
  type: "calm" | "stress";
};

export default function FocusGame({ activity }: { activity: Activity }) {
  const navigate = useNavigate();

  const [time, setTime] = useState(activity.duration * 60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [message, setMessage] = useState("Tap the calm circles 🌿");
  const [circles, setCircles] = useState<Circle[]>([]);

  // TIMER
  useEffect(() => {
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          clearInterval(t);
          navigate("/activity-result", {
            state: { activity, score, message: getResultMessage(score) }
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [navigate, activity, score]);

  // SPAWN CALM/STRESS ORBS
  useEffect(() => {
    const spawn = setInterval(() => {
      setCircles((prev) => [
        ...prev.slice(-7),
        {
          id: Math.random(),
          x: Math.random() * 85,
          y: Math.random() * 80,
          type: Math.random() > 0.45 ? "calm" : "stress"
        }
      ]);
    }, 850);

    return () => clearInterval(spawn);
  }, []);

  function clickCircle(c: Circle) {
    if (c.type === "calm") {
      setScore((s) => s + 10 + combo * 2);
      setCombo((c) => c + 1);
      setMessage(randomPositive());
    } else {
      setScore((s) => Math.max(0, s - 6));
      setCombo(0);
      setMessage("Slow down… breathe 🌬");
    }

    setCircles((prev) => prev.filter((x) => x.id !== c.id));
  }

  function randomPositive() {
    const msgs = [
      "Good focus ✨",
      "Stay present 🌿",
      "Nice and calm 💙",
      "You're doing great 🌸",
      "Relax your mind 🧘"
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function getResultMessage(score: number) {
    if (score < 80) return "Your mind was restless — try slow breathing";
    if (score < 160) return "Nice focus — your mind is settling";
    return "Excellent calm focus 🧘";
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "radial-gradient(circle at center,#020617,#000)",
        color: "white",
        overflow: "hidden",
        position: "relative",
        fontFamily: "system-ui"
      }}
    >
      {/* TOP HUD */}
      <div style={{ position: "absolute", top: 18, left: 20 }}>
        ⏳ {time}s
      </div>

      <div style={{ position: "absolute", top: 18, right: 20 }}>
        🌿 Focus: {score}
      </div>

      <div
        style={{
          position: "absolute",
          top: 60,
          width: "100%",
          textAlign: "center",
          opacity: 0.8,
          fontSize: 18
        }}
      >
        {message}
      </div>

      {/* ORBS */}
      {circles.map((c) => (
        <div
          key={c.id}
          onClick={() => clickCircle(c)}
          style={{
            position: "absolute",
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: 70,
            height: 70,
            borderRadius: "50%",
            cursor: "pointer",
            background:
              c.type === "calm"
                ? "radial-gradient(circle,#34d399,#059669)"
                : "radial-gradient(circle,#fb7185,#be123c)",
            boxShadow:
              c.type === "calm"
                ? "0 0 25px #34d399"
                : "0 0 25px #fb7185",
            transform: "scale(1)",
            transition: "transform .15s",
          }}
        />
      ))}
    </div>
  );
}
