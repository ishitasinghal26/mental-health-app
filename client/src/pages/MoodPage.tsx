import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import AppNavbar from "../components/navbar/AppNavbar";
import { getMoods, addMood, deleteMood, updateMood, MoodEntry } from "../services/moodApi";

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

const MOOD_COLOR: Record<string, string> = {
  Happy: "#22c55e",
  Calm: "#3b82f6",
  Neutral: "#a3a3a3",
  Sad: "#6366f1",
  Stressed: "#ef4444",
};

const MOOD_EMOJI: Record<string, string> = {
  Happy: "😊",
  Calm: "😌",
  Neutral: "😐",
  Sad: "😔",
  Stressed: "😰",
};

export default function MoodPage() {
  const [moods, setMoods]           = useState<MoodEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [editMood, setEditMood]     = useState("Happy");
  const [editIntensity, setEditInt] = useState(3);
  const [editNote, setEditNote]     = useState("");
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"week" | "month">("week");
  const [selectedMood, setSelMood]  = useState("Happy");
  const [intensity, setIntensity]   = useState(3);
  const [note, setNote]             = useState("");

  // ── Load from API ──
  useEffect(() => {
    getMoods()
      .then(setMoods)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Create ──
  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const entry = await addMood({ mood: selectedMood, intensity, note });
      setMoods(prev => [entry, ...prev]);
      setNote("");
      setIntensity(3);
    } catch {
      alert("Failed to save mood. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──
  async function handleDelete(id: number) {
    await deleteMood(id);
    setMoods(prev => prev.filter(m => m.id !== id));
  }

  // ── Update ──
  async function handleUpdate() {
    if (editId === null) return;
    const updated = await updateMood(editId, { mood: editMood, intensity: editIntensity, note: editNote });
    setMoods(prev => prev.map(m => m.id === editId ? updated : m));
    setEditId(null);
  }

  // ── Filter + search ──
  const filtered = useMemo(() => {
    const days = filter === "week" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 86400000);
    return moods.filter(m => new Date(m.created_at) >= cutoff);
  }, [moods, filter]);

  const searched = useMemo(() => {
    const s = search.toLowerCase();
    return filtered.filter(m =>
      m.mood.toLowerCase().includes(s) ||
      (m.note || "").toLowerCase().includes(s)
    );
  }, [filtered, search]);

  const chartData = useMemo(() =>
    searched.slice().reverse().map(m => ({
      date: new Date(m.created_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
      intensity: m.intensity,
      mood: m.mood,
    })), [searched]);

  return (
    <div style={page}>
      <AppNavbar />
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <h1 style={title}>💭 Mood Tracker</h1>
          <p style={subtitle}>Log how you're feeling and track patterns over time.</p>
        </div>

        <div style={twoCol}>
          {/* ── Log Mood ── */}
          <div style={card}>
            <h2 style={cardTitle}>Log Your Mood</h2>
            <p style={cardSub}>How are you feeling right now?</p>

            {/* Mood selector */}
            <div style={moodGrid}>
              {MOODS.map(m => (
                <button
                  key={m}
                  style={{
                    ...moodBtn,
                    ...(selectedMood === m ? { ...moodBtnActive, borderColor: MOOD_COLOR[m], background: MOOD_COLOR[m] + "15" } : {}),
                  }}
                  onClick={() => setSelMood(m)}
                >
                  <span style={{ fontSize: 22 }}>{MOOD_EMOJI[m]}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: selectedMood === m ? 700 : 500, color: selectedMood === m ? MOOD_COLOR[m] : "#6b7280" }}>{m}</span>
                </button>
              ))}
            </div>

            {/* Intensity */}
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <label style={inputLabel}>Intensity</label>
                <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "0.95rem" }}>{intensity}/5</span>
              </div>
              <input
                type="range" min={1} max={5} value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af" }}>
                <span>Low</span><span>High</span>
              </div>
            </div>

            {/* Note */}
            <div style={{ marginTop: "1rem" }}>
              <label style={inputLabel}>Note (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                style={textarea}
              />
            </div>

            <button
              style={{ ...saveBtn, opacity: saving ? 0.6 : 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Mood ✓"}
            </button>
          </div>

          {/* ── Trend Chart ── */}
          <div style={card}>
            <h2 style={cardTitle}>Mood Trend</h2>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["week", "month"] as const).map(f => (
                <button
                  key={f}
                  style={{ ...filterBtn, ...(filter === f ? filterBtnActive : {}) }}
                  onClick={() => setFilter(f)}
                >
                  {f === "week" ? "Last 7 days" : "Last 30 days"}
                </button>
              ))}
            </div>
            {chartData.length > 0 ? (
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any, _: any, entry: any) => [`${val} (${entry.payload.mood})`, "Intensity"]}
                    />
                    <Line type="monotone" dataKey="intensity" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: 36 }}>📈</span>
                <p style={{ fontSize: "0.9rem" }}>No data in this period yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── History ── */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <h2 style={{ ...cardTitle, margin: 0 }}>Mood History</h2>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search mood or note…"
              style={searchInput}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Loading…</div>
          ) : searched.length === 0 ? (
            <div style={emptyState}>
              <div style={{ fontSize: 40 }}>😶</div>
              <p>No mood entries found. Start logging to see them here!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {searched.map(m => (
                <div key={m.id} style={{ ...entryCard, borderLeft: `4px solid ${MOOD_COLOR[m.mood] || "#a3a3a3"}` }}>
                  {editId === m.id ? (
                    /* ── Inline Edit Form ── */
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                        {MOODS.map(mo => (
                          <button key={mo} style={{ ...filterBtn, ...(editMood === mo ? filterBtnActive : {}) }} onClick={() => setEditMood(mo)}>
                            {MOOD_EMOJI[mo]} {mo}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <label style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 600 }}>Intensity: {editIntensity}</label>
                        <input type="range" min={1} max={5} value={editIntensity} onChange={e => setEditInt(Number(e.target.value))} style={{ flex: 1, accentColor: "#6366f1" }} />
                      </div>
                      <input value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Note…" style={{ ...searchInput, width: "100%", marginBottom: "0.5rem" }} />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={{ ...filterBtn, ...filterBtnActive }} onClick={handleUpdate}>Save</button>
                        <button style={filterBtn} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: 24 }}>{MOOD_EMOJI[m.mood] || "😶"}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#111827" }}>{m.mood}</div>
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{new Date(m.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
                        <div style={{ ...intensityBadge, background: MOOD_COLOR[m.mood] + "18", color: MOOD_COLOR[m.mood] }}>
                          {m.intensity}/5
                        </div>
                        {m.note && <span style={noteBadge}>{m.note}</span>}
                        <button style={iconBtn} onClick={() => { setEditId(m.id); setEditMood(m.mood); setEditInt(m.intensity); setEditNote(m.note || ""); }}>✏️</button>
                        <button style={{ ...iconBtn, color: "#ef4444" }} onClick={() => handleDelete(m.id)}>🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "2rem 1.5rem",
  display: "grid",
  gap: "1.5rem",
};

const header: React.CSSProperties = {};
const title: React.CSSProperties = { fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: 0 };
const subtitle: React.CSSProperties = { color: "#6b7280", marginTop: 6 };

const twoCol: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "1.25rem",
};

const card: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "1.75rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const cardTitle: React.CSSProperties = { fontSize: "1.05rem", fontWeight: 700, color: "#111827", margin: "0 0 4px" };
const cardSub: React.CSSProperties = { fontSize: "0.83rem", color: "#6b7280", marginBottom: "1.25rem" };

const moodGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "0.5rem",
};

const moodBtn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.65rem 0.25rem",
  borderRadius: 12,
  border: "2px solid #e5e7eb",
  background: "#f9fafb",
  cursor: "pointer",
  transition: "all 0.15s",
};

const moodBtnActive: React.CSSProperties = {
  border: "2px solid #6366f1",
};

const inputLabel: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: "0.35rem",
};

const textarea: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1.5px solid #e5e7eb",
  padding: "0.65rem 0.85rem",
  fontSize: "0.92rem",
  resize: "vertical",
  fontFamily: "inherit",
};

const saveBtn: React.CSSProperties = {
  marginTop: "1.25rem",
  width: "100%",
  padding: "0.8rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const filterBtn: React.CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  background: "white",
  fontSize: "0.82rem",
  fontWeight: 500,
  color: "#6b7280",
  cursor: "pointer",
};

const filterBtnActive: React.CSSProperties = {
  background: "#eef2ff",
  borderColor: "#6366f1",
  color: "#4338ca",
  fontWeight: 700,
};

const searchInput: React.CSSProperties = {
  padding: "0.55rem 0.9rem",
  borderRadius: 10,
  border: "1.5px solid #e5e7eb",
  fontSize: "0.88rem",
  width: "220px",
};

const entryCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 1.25rem",
  background: "#fafafa",
  borderRadius: 14,
  border: "1px solid #f0f0f0",
  flexWrap: "wrap",
};

const intensityBadge: React.CSSProperties = {
  padding: "0.3rem 0.65rem",
  borderRadius: 99,
  fontSize: "0.78rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const noteBadge: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "#6b7280",
  maxWidth: 160,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  padding: "0.25rem",
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem",
  color: "#9ca3af",
  fontSize: "0.9rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
};
