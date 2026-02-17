<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getActivities } from "../services/activityApi";

const DIFFICULTY = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = [5, 10, 15];

export default function ActivitiesPage() {
  const navigate = useNavigate();

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  useEffect(() => {
    loadActivities();
  }, [difficulty, maxDuration]);

  async function loadActivities() {
    try {
      setLoading(true);
      const res = await getActivities({
        difficulty: difficulty || undefined,
        maxDuration: maxDuration || undefined,
      });
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function difficultyColor(level: string) {
    if (level === "Beginner") return "#22c55e";
    if (level === "Intermediate") return "#3b82f6";
    return "#ef4444";
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Wellness Activities</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <select onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Levels</option>
          {DIFFICULTY.map((d) => <option key={d}>{d}</option>)}
        </select>

        <select onChange={(e) => setMaxDuration(e.target.value)}>
          <option value="">Any Duration</option>
          {DURATIONS.map((d) => (
            <option key={d} value={d}>Up to {d} min</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading activities...</p>}

      {!loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.2rem",
        }}>
          {activities.map((a) => (
            <div key={a.id} style={{
              borderTop: `5px solid ${difficultyColor(a.difficulty)}`,
              background: "white",
              borderRadius: "16px",
              padding: "1.2rem",
              boxShadow: "0 6px 15px rgba(0,0,0,0.08)"
            }}>
              <h3>{a.title}</h3>
              <p>{a.description}</p>

              <div style={{
                fontSize: "0.8rem",
                color: "#6b7280",
                margin: "0.6rem 0",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{a.category}</span>
                <span>{a.duration} min</span>
                <span>{a.difficulty}</span>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "10px",
                  border: "none",
                  color: "white",
                  background: "linear-gradient(135deg,#6366f1,#ec4899)"
                }}
                onClick={() =>
                  navigate("/activity-player", { state: { activity: a } })
                }
              >
                Start Activity
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



=======
export default function ActivitiesPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Self-help Activities</h2>
      <p>Breathing, mindfulness, and CBT activities here.</p>
    </div>
  );
}
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
