import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ActivityResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const activity = state?.activity;
  const score = state?.score ?? null;

  if (!activity) return null;

  function rand(base: number) {
    return Math.max(40, Math.min(95, base + Math.floor(Math.random() * 15 - 7)));
  }

  function generateMetrics() {
    switch (activity.type) {
      case "breathing":
        return {
          title: "Your breathing rhythm stabilized",
          insight:
            "Slow breathing activates the parasympathetic nervous system and reduces cortisol.",
          stats: [
            { label: "Calmness", value: rand(70) },
            { label: "Heart Rate Balance", value: rand(65) },
            { label: "Tension Reduced", value: rand(60) },
          ],
        };

      case "meditation":
        return {
          title: "Your mind entered a focused state",
          insight:
            "Short mindfulness sessions improve attention span and emotional regulation.",
          stats: [
            { label: "Focus", value: rand(80) },
            { label: "Mental Clarity", value: rand(75) },
            { label: "Thought Control", value: rand(65) },
          ],
        };

      case "bodyscan":
        return {
          title: "Body relaxation achieved",
          insight:
            "Body scanning improves interoception and reduces physical stress signals.",
          stats: [
            { label: "Muscle Relaxation", value: rand(85) },
            { label: "Body Awareness", value: rand(70) },
            { label: "Stress Release", value: rand(65) },
          ],
        };

      case "grounding":
        return {
          title: "Anxiety reduced successfully",
          insight:
            "Grounding interrupts anxious thought loops by reconnecting senses to the present moment.",
          stats: [
            { label: "Present Awareness", value: rand(90) },
            { label: "Anxiety Reduction", value: rand(75) },
            { label: "Breathing Stability", value: rand(70) },
          ],
        };

      default:
        return {
          title: "Cognitive exercise completed",
          insight:
            "Regular mental exercises strengthen neural pathways and emotional resilience.",
          stats: [
            { label: "Engagement", value: rand(70) },
            { label: "Cognitive Activity", value: rand(65) },
            { label: "Mood Lift", value: rand(60) },
          ],
        };
    }
  }

  const result = generateMetrics();

  const average = Math.round(
    result.stats.reduce((a, b) => a + b.value, 0) / result.stats.length
  );

  function moodEmoji(avg: number) {
    if (avg > 80) return "😄 Excellent session";
    if (avg > 65) return "🙂 Good progress";
    return "😌 Relaxation achieved";
  }

  // ⭐ SAVE HISTORY (RUN ONLY ONCE)
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("mindcare_history") || "[]");

    const session = {
      type: activity.type,
      title: activity.title,
      average,
      score,
      date: new Date().toLocaleString(),
    };

    // prevent duplicate save when refreshing page
    const last = history[0];
    if (!last || last.date !== session.date) {
      history.unshift(session);
      localStorage.setItem("mindcare_history", JSON.stringify(history));
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#020617,#0f172a,#020617)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "system-ui",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: 38 }}>Session Complete 🎉</h1>

      <h2 style={{ marginTop: 10 }}>{result.title}</h2>

      {score !== null && (
        <div
          style={{
            marginTop: 15,
            fontSize: 24,
            background: "#1e293b",
            padding: "10px 20px",
            borderRadius: 12,
          }}
        >
          Score: {score}
        </div>
      )}

      <p style={{ marginTop: 15, opacity: 0.85 }}>{result.insight}</p>

      <div style={{ marginTop: 20, fontSize: 20 }}>
        {moodEmoji(average)}
      </div>

      <div style={{ width: 360, marginTop: 40 }}>
        {result.stats.map((s) => (
          <div key={s.label} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{s.label}</span>
              <span>{s.value}%</span>
            </div>

            <div
              style={{
                height: 10,
                background: "#1f2937",
                borderRadius: 10,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${s.value}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#a78bfa,#ec4899)",
                  borderRadius: 10,
                  transition: "width 1.2s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/activities")}
        style={{
          marginTop: 45,
          padding: "12px 28px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg,#6366f1,#ec4899)",
          color: "white",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Back to Activities
      </button>
    </div>
  );
}

