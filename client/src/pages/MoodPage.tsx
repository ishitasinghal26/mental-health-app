import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import EditMoodModal from "../components/mood/EditMoodModal";
import ExportMoodModal from "../components/mood/ExportMoodModal";
import "../styles/Dashboard.css";
import "../styles/Mood.css";
import { generateMoodPDF } from "../utils/generateMoodPDF";

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

type MoodEntry = {
  id: number;
  mood: string;
  intensity: number;
  note: string;
  date: string;
};

const MOCK_DATA: MoodEntry[] = [
  {
    id: 1,
    mood: "Happy",
    intensity: 4,
    note: "Good day",
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    mood: "Stressed",
    intensity: 5,
    note: "Deadlines 😩",
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export default function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [editing, setEditing] = useState<MoodEntry | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"week" | "month">("week");
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState("");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("mood_entries");
    if (stored) setMoods(JSON.parse(stored));
    else setMoods(MOCK_DATA);
  }, []);

  function saveLocal(data: MoodEntry[]) {
    localStorage.setItem("mood_entries", JSON.stringify(data));
  }

  function handleSaveMood() {
    const newMood: MoodEntry = {
      id: Date.now(),
      mood: selectedMood,
      intensity,
      note,
      date: new Date().toISOString(),
    };

    const updated = [newMood, ...moods];
    setMoods(updated);
    saveLocal(updated);

    setIntensity(3);
    setNote("");
  }

  function handleDelete(id: number) {
    const updated = moods.filter((m) => m.id !== id);
    setMoods(updated);
    saveLocal(updated);
  }

  function handleUpdate() {
    if (!editing) return;

    const updated = moods.map((m) =>
      m.id === editing.id ? editing : m
    );

    setMoods(updated);
    saveLocal(updated);
    setEditing(null);
  }

  

  /* FILTER */
  const filteredByDate = useMemo(() => {
    const days = filter === "week" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return moods.filter((m) => new Date(m.date) >= cutoff);
  }, [moods, filter]);

  /* SEARCH */
  const searchedMoods = filteredByDate.filter((m) => {
    const s = search.toLowerCase();

    return (
      m.mood.toLowerCase().includes(s) ||
      new Date(m.date).toLocaleDateString().includes(s)
    );
  });

  const chartData = useMemo(() => {
  return searchedMoods
    .slice()
    .reverse()
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString(),
      intensity: m.intensity,
    }));
}, [searchedMoods]);
async function handleExport(opts: any) {
  try {
    setShowExport(false);

    let data = [...searchedMoods];

    if (opts?.range === "day") {
      data = data.slice(0, 1);
    }

    await generateMoodPDF("Demo User", data, opts);
  } catch (err) {
    console.error("Export error:", err);
  }
}



  return (
    <>
      <DashboardNavbar />

      <div className="mood-container">
        <h2>Mood Tracker</h2>

        {/* CREATE */}
        <div className="mood-card">
          <h3>Log Mood</h3>

          <select
            className="journal-select"
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
          >
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <label>Intensity: {intensity}</label>

          <input
            type="range"
            min="1"
            max="5"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          <textarea
            className="journal-textarea"
            placeholder="Optional note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button className="primary-btn" onClick={handleSaveMood}>
            Save Mood
          </button>
        </div>

        {/* SEARCH */}
        <div className="mood-card">
          <h3>Your Mood History</h3>

          <input
            className="journal-input"
            placeholder="Search by mood or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="journal-actions">
            <button
              className="secondary-btn"
              onClick={() => setFilter("week")}
            >
              Last Week
            </button>

            <button
              className="secondary-btn"
              onClick={() => setFilter("month")}
            >
              Last Month
            </button>

            <button
              className="secondary-btn"
              onClick={() => setShowExport(true)}
            >
              Export Report
            </button>
          </div>

          <div id="mood-chart" style={{ width: "100%", height: 260 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      
      <XAxis dataKey="date" />
      <YAxis domain={[1, 5]} />
      
      <Tooltip />

      <Line
        type="monotone"
        dataKey="intensity"
        stroke="#6366f1"
        strokeWidth={3}
        dot={{ r: 5 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

        </div>

        {/* ENTRIES */}
        {searchedMoods.map((m) => (
          <div
            key={m.id}
            className="mood-entry"
            style={{
              borderLeft: `6px solid ${
                m.mood === "Happy"
                  ? "#22c55e"
                  : m.mood === "Calm"
                  ? "#3b82f6"
                  : m.mood === "Sad"
                  ? "#6366f1"
                  : m.mood === "Stressed"
                  ? "#ef4444"
                  : "#a3a3a3"
              }`,
            }}
          >
            <strong>{m.mood}</strong>

            <div className="mood-meta">
              Intensity: {m.intensity}
            </div>

            <div className="mood-meta">
              {new Date(m.date).toLocaleDateString()}
            </div>

            {m.note && <div>{m.note}</div>}

            <div className="journal-actions">
              <button
                className="secondary-btn"
                onClick={() => setEditing(m)}
              >
                Edit
              </button>

              <button
                className="secondary-btn"
                style={{ background: "#fee2e2" }}
                onClick={() => handleDelete(m.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* EDIT MODAL */}
        {editing && (
          <EditMoodModal
            entry={editing}
            onClose={() => setEditing(null)}
            onSave={(updated) => setEditing(updated)}
            onUpdate={handleUpdate}
          />
        )}

        {/* EXPORT MODAL */}
        {showExport && (
          <ExportMoodModal
            onClose={() => setShowExport(false)}
            onExport={handleExport}
          />
        )}
      </div>
    </>
  );
}
