import { useState } from "react";
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
  { label: "Name 5 things you can SEE", count: 5 },
  { label: "Name 4 things you can TOUCH", count: 4 },
  { label: "Name 3 things you can HEAR", count: 3 },
  { label: "Name 2 things you can SMELL", count: 2 },
  { label: "Name 1 thing you FEEL inside", count: 1 }
];

export default function GroundingActivity({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);

  const next = () => {
    if (!text.trim()) return;

    setAnswers([...answers, text]);
    setText("");

    if (step === steps.length - 1) {
      navigate("/activity-result", { state: { activity } });
    } else {
      setStep(step + 1);
    }
  };

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
        fontFamily: "system-ui",
        textAlign: "center",
        padding: 20
      }}
    >
      <h1>5-4-3-2-1 Grounding</h1>

      <h2 style={{ marginTop: 30 }}>{steps[step].label}</h2>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        style={{
          marginTop: 30,
          padding: "12px 18px",
          borderRadius: 12,
          border: "none",
          width: 320,
          background: "#1e293b",
          color: "white",
          fontSize: 16
        }}
      />

      <button
        onClick={next}
        style={{
          marginTop: 25,
          padding: "10px 26px",
          borderRadius: 12,
          border: "none",
          background: "#ec4899",
          color: "white",
          fontSize: 16,
          cursor: "pointer"
        }}
      >
        Next
      </button>

      <p style={{ marginTop: 30, opacity: 0.6 }}>
        Step {step + 1} of {steps.length}
      </p>
    </div>
  );
}

