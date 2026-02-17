import { useEffect, useMemo, useState } from "react";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import "../styles/Dashboard.css";
import "../styles/Journal.css";
import EditJournalModal from "../components/journal/EditJournalModal";

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

type Entry = {
  id: number;
  title: string;
  content: string;
  mood: string;
  intensity: number;
  tags: string[];
  date: string;
};

const MOCK_DATA: Entry[] = [
  {
    id: 1,
    title: "Good Day",
    content: "Completed my tasks",
    mood: "Happy",
    intensity: 4,
    tags: ["work", "productivity"],
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    title: "Stressful",
    content: "Too much workload",
    mood: "Stressed",
    intensity: 5,
    tags: ["stress", "work"],
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"week" | "month">("week");

  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: "Neutral",
    intensity: 3,
    tags: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("journal_entries");
    if (stored) setEntries(JSON.parse(stored));
    else setEntries(MOCK_DATA);
  }, []);

  function saveLocal(data: Entry[]) {
    localStorage.setItem("journal_entries", JSON.stringify(data));
  }

  function handleCreate() {
    if (!form.title || !form.content)
      return alert("Title & content required");

    const newEntry: Entry = {
      id: Date.now(),
      title: form.title,
      content: form.content,
      mood: form.mood,
      intensity: form.intensity,
      tags: form.tags.split(",").map((t) => t.trim()),
      date: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveLocal(updated);

    setForm({
      title: "",
      content: "",
      mood: "Neutral",
      intensity: 3,
      tags: "",
    });
  }

  function handleDelete(id: number) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveLocal(updated);
  }

  function handleUpdate() {
    if (!editing) return;

    const updated = entries.map((e) =>
      e.id === editing.id ? editing : e
    );

    setEntries(updated);
    saveLocal(updated);
    setEditing(null);
  }

  /* FILTER BY TIME */
  const filteredByDate = useMemo(() => {
    const days = filter === "week" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return entries.filter((e) => new Date(e.date) >= cutoff);
  }, [entries, filter]);

  /* SEARCH */
  const searchedEntries = useMemo(() => {
    return filteredByDate.filter((e) => {
      const s = search.toLowerCase();

      return (
        e.title.toLowerCase().includes(s) ||
        e.mood.toLowerCase().includes(s) ||
        e.tags.join(", ").toLowerCase().includes(s) ||
        new Date(e.date).toLocaleDateString().includes(s)
      );
    });
  }, [filteredByDate, search]);

  return (
    <>
      <DashboardNavbar />

      <div className="journal-container">
        <h2>Journal</h2>

        {/* CREATE */}
        <div className="journal-card">
          <h3>New Entry</h3>

          <input
            className="journal-input"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            className="journal-textarea"
            placeholder="Write your thoughts..."
            value={form.content}
            onChange={(e) =>
              setForm({ ...form, content: e.target.value })
            }
          />

          <select
            className="journal-select"
            value={form.mood}
            onChange={(e) =>
              setForm({ ...form, mood: e.target.value })
            }
          >
            {MOODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <label>Intensity: {form.intensity}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={form.intensity}
            onChange={(e) =>
              setForm({ ...form, intensity: Number(e.target.value) })
            }
            style={{ width: "100%" }}
          />

          <input
            className="journal-input"
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) =>
              setForm({ ...form, tags: e.target.value })
            }
          />

          <button className="primary-btn" onClick={handleCreate}>
            Save Entry
          </button>
        </div>

        {/* SEARCH + FILTER */}
        <div className="journal-card">
          <h3>Your Entries</h3>

          <input
            className="journal-input"
            placeholder="Search by title, mood, tag, date..."
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
          </div>
        </div>

        {/* ENTRIES */}
        {searchedEntries.map((e) => (
          <div
  key={e.id}
  className="journal-entry"
  style={{
    borderLeft: `6px solid ${
      e.mood === "Happy"
        ? "#22c55e"
        : e.mood === "Calm"
        ? "#3b82f6"
        : e.mood === "Sad"
        ? "#6366f1"
        : e.mood === "Stressed"
        ? "#ef4444"
        : "#a3a3a3"
    }`,
  }}
>

            <div className="journal-entry-title">{e.title}</div>
            <div>{e.content}</div>

            <div className="journal-tags">
  {e.tags.map((tag: string) => (
    <span key={tag} className="journal-tag">
      #{tag}
    </span>
  ))}
</div>


            <div className="journal-meta">
              Tags: {e.tags.join(", ")}
            </div>

            <div className="journal-meta">
              {new Date(e.date).toLocaleDateString()}
            </div>

            <div className="journal-actions">
              <button
                className="secondary-btn"
                onClick={() => setEditing(e)}
              >
                Edit
              </button>

              <button
                className="secondary-btn"
                style={{ background: "#fee2e2" }}
                onClick={() => handleDelete(e.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* EDIT MODAL */}
        {editing && (
          <EditJournalModal
  entry={editing}
  onClose={() => setEditing(null)}
  onSave={(updated) => setEditing(updated)}
  onUpdate={handleUpdate}
/>

        )}

        
      </div>
    </>
  );
}
