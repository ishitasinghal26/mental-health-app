import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";
import {
  getJournals, createJournal, deleteJournal, updateJournal, JournalEntry,
} from "../services/journalApi";

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

const MOOD_COLOR: Record<string, string> = {
  Happy: "#22c55e",
  Calm: "#3b82f6",
  Neutral: "#a3a3a3",
  Sad: "#6366f1",
  Stressed: "#ef4444",
};

const MOOD_EMOJI: Record<string, string> = {
  Happy:   "😊",
  Calm:    "😌",
  Neutral: "😐",
  Sad:     "😔",
  Stressed:"😰",
};

const JOURNAL_FEEDBACK: Record<string, string> = {
  Happy:    "🌟 Beautiful! Your joy is captured forever in this entry.",
  Calm:     "🌿 Your peaceful reflections are a gift to your future self.",
  Neutral:  "📝 Entry saved. Showing up, even on neutral days, takes strength.",
  Sad:      "💙 Well done for writing it out. That takes courage. You’re not alone.",
  Stressed: "🙌 You did it — getting words out of your head is the first step to relief.",
};




type EditState = {
  title: string;
  content: string;
  mood: string;
  intensity: number;
  tags: string;
};

export default function JournalPage() {
  const [entries, setEntries]     = useState<JournalEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState>({ title: "", content: "", mood: "Neutral", intensity: 3, tags: "" });
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"week" | "month">("week");
  const [form, setForm]           = useState({ title: "", content: "", mood: "Neutral", intensity: 3, tags: "" });
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [toast, setToast]         = useState("");



  // ── Load from API ──
  useEffect(() => {
    getJournals()
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Create ──
  async function handleCreate() {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Title & content are required.");
      return;
    }
    setSaving(true);
    try {
      const entry = await createJournal({
        title: form.title.trim(),
        content: form.content.trim(),
        mood: form.mood,
        intensity: form.intensity,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setEntries(prev => [entry, ...prev]);
      setForm({ title: "", content: "", mood: "Neutral", intensity: 3, tags: "" });
      setToast(JOURNAL_FEEDBACK[form.mood] || "📝 Entry saved!");
      setTimeout(() => setToast(""), 4500);
    } catch {
      alert("Failed to save journal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──
  async function handleDelete(id: number) {
    await deleteJournal(id);
    setEntries(prev => prev.filter(e => e.id !== id));
    if (editId === id) setEditId(null);
  }

  // ── Update ──
  async function handleUpdate() {
    if (editId === null) return;
    const updated = await updateJournal(editId, {
      title: editState.title,
      content: editState.content,
      mood: editState.mood,
      intensity: editState.intensity,
      tags: editState.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setEntries(prev => prev.map(e => e.id === editId ? updated : e));
    setEditId(null);
  }

  // ── Filter + Search ──
  const filtered = useMemo(() => {
    const days = filter === "week" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 86400000);
    return entries.filter(e => new Date(e.created_at) >= cutoff);
  }, [entries, filter]);

  const searched = useMemo(() => {
    const s = search.toLowerCase();
    if (!s) return filtered;
    return filtered.filter(e =>
      e.title.toLowerCase().includes(s) ||
      e.content.toLowerCase().includes(s) ||
      e.mood.toLowerCase().includes(s) ||
      (e.tags || []).join(" ").toLowerCase().includes(s)
    );
  }, [filtered, search]);

  return (
    <div style={page}>
      <AppNavbar />

      {/* Toast popup */}
      {toast && (
        <div className="toast-enter" style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "white", borderRadius: 16, padding: "1rem 1.75rem",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)", zIndex: 999,
          fontWeight: 700, fontSize: "0.95rem", color: "#111827",
          border: "1.5px solid #e5e7eb", maxWidth: "90vw", textAlign: "center",
        }}>
          {toast}
        </div>
      )}

      <div style={container}>

        {/* ── Header ── */}
        <div>
          <h1 style={title}>📓 Journal</h1>
          <p style={subtitle}>Capture your thoughts, reflect on your feelings.</p>
        </div>

        {/* ── 2-col form + entries ── */}
        <div style={twoCol}>


          {/* ── New Entry Form ── */}
          <div style={card}>
            <h2 style={cardTitle}>New Entry</h2>
            <p style={cardSub}>What's on your mind today?</p>

            <div style={{ display: "grid", gap: "0.85rem" }}>
              <div>
                <label style={inputLabel}>Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Give this entry a title…"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={inputLabel}>Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write freely. This is your safe space…"
                  rows={5}
                  style={textareaStyle}
                />
              </div>

              {/* Mood selector */}
              <div>
                <label style={inputLabel}>Mood</label>
                <div style={moodGrid}>
                  {MOODS.map(m => (
                    <button
                      key={m}
                      style={{
                        ...moodBtn,
                        background: form.mood === m ? MOOD_COLOR[m] + "18" : "white",
                        border: form.mood === m ? `2.5px solid ${MOOD_COLOR[m]}` : "1.5px solid #e5e7eb",
                        boxShadow: form.mood === m ? `0 4px 12px ${MOOD_COLOR[m]}30` : "none",
                        transform: form.mood === m ? "scale(1.06)" : "scale(1)",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setForm({ ...form, mood: m })}
                    >
                      <span className="emoji-wiggle" style={{ fontSize: 22 }}>{MOOD_EMOJI[m]}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: form.mood === m ? 700 : 500, color: form.mood === m ? MOOD_COLOR[m] : "#6b7280" }}>
                        {m}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={inputLabel}>Intensity</label>
                  <span style={{ fontWeight: 700, color: "#6366f1", fontSize: "0.9rem" }}>{form.intensity}/5</span>
                </div>
                <input
                  type="range" min={1} max={5} value={form.intensity}
                  onChange={e => setForm({ ...form, intensity: Number(e.target.value) })}
                  style={{ width: "100%", accentColor: "#6366f1" }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={inputLabel}>Tags <span style={{ fontWeight: 400, color: "#9ca3af" }}>(comma-separated)</span></label>
                <input
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. work, gratitude, reflection"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              style={{ ...saveBtn, opacity: saving ? 0.6 : 1, marginTop: "1.25rem" }}
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Entry ✓"}
            </button>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={card}>
              <h2 style={cardTitle}>Your Journal Stats</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                <StatBox label="Total Entries" value={entries.length} icon="📝" color="#6366f1" />
                <StatBox label="This Week" value={entries.filter(e => new Date(e.created_at) >= new Date(Date.now() - 7 * 86400000)).length} icon="📅" color="#a855f7" />
                <StatBox label="Most Used Mood" value={topMood(entries)} icon="💭" color="#f59e0b" />
                <StatBox label="Unique Tags" value={uniqueTags(entries)} icon="🏷️" color="#10b981" />
              </div>
            </div>

            <div style={card}>
              <h2 style={{ ...cardTitle, marginBottom: "1rem" }}>Mood Breakdown</h2>
              {MOODS.map(m => {
                const count = entries.filter(e => e.mood === m).length;
                const pct = entries.length ? Math.round((count / entries.length) * 100) : 0;
                return (
                  <div key={m} style={{ marginBottom: "0.65rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{MOOD_EMOJI[m]} {m}</span>
                      <span style={{ color: MOOD_COLOR[m], fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: MOOD_COLOR[m], borderRadius: 99, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Entry List ── */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h2 style={{ ...cardTitle, margin: 0 }}>All Entries</h2>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["week", "month"] as const).map(f => (
                  <button
                    key={f}
                    style={{ ...filterBtn, ...(filter === f ? filterBtnActive : {}) }}
                    onClick={() => setFilter(f)}
                  >
                    {f === "week" ? "7d" : "30d"}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries…"
              style={searchInput}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: "2rem" }}>Loading…</div>
          ) : searched.length === 0 ? (
            <div style={emptyState}>
              <div style={{ fontSize: 44 }}>📖</div>
              <p>No journal entries found. Start writing to see them here!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {searched.map(e => (
                <div key={e.id} style={{ ...entryCard, borderLeft: `4px solid ${MOOD_COLOR[e.mood] || "#a3a3a3"}` }}>
                  {editId === e.id ? (
                    /* ── Inline edit ── */
                    <div style={{ width: "100%" }}>
                      <div style={{ display: "grid", gap: "0.6rem", marginBottom: "0.75rem" }}>
                        <input
                          value={editState.title}
                          onChange={ev => setEditState(s => ({ ...s, title: ev.target.value }))}
                          style={inputStyle}
                          placeholder="Title"
                        />
                        <textarea
                          rows={4}
                          value={editState.content}
                          onChange={ev => setEditState(s => ({ ...s, content: ev.target.value }))}
                          style={textareaStyle}
                          placeholder="Content"
                        />
                        <div style={moodGrid}>
                          {MOODS.map(m => (
                            <button
                              key={m}
                              style={{ ...moodBtn, ...(editState.mood === m ? { border: `2px solid ${MOOD_COLOR[m]}`, background: MOOD_COLOR[m] + "15" } : {}) }}
                              onClick={() => setEditState(s => ({ ...s, mood: m }))}
                            >{MOOD_EMOJI[m]} {m}</button>
                          ))}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <label style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap" }}>Intensity: {editState.intensity}</label>
                          <input type="range" min={1} max={5} value={editState.intensity} onChange={ev => setEditState(s => ({ ...s, intensity: Number(ev.target.value) }))} style={{ flex: 1, accentColor: "#6366f1" }} />
                        </div>
                        <input
                          value={editState.tags}
                          onChange={ev => setEditState(s => ({ ...s, tags: ev.target.value }))}
                          style={inputStyle}
                          placeholder="Tags (comma-separated)"
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={{ ...saveBtn, flex: 1, marginTop: 0, padding: "0.55rem" }} onClick={handleUpdate}>Save Changes</button>
                        <button style={{ ...filterBtn, padding: "0.55rem 1rem" }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* ── View mode ── */
                    <>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                          <span style={{ fontSize: 16 }}>{MOOD_EMOJI[e.mood] || "📝"}</span>
                          <span style={{ fontWeight: 700, color: "#111827", fontSize: "0.97rem" }}>{e.title}</span>
                          <span style={{ ...moodPill, background: MOOD_COLOR[e.mood] + "18", color: MOOD_COLOR[e.mood] }}>{e.mood}</span>
                        </div>
                        <div style={{ color: "#6b7280", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "0.5rem", cursor: "pointer" }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                          {expanded === e.id ? e.content : (e.content.length > 120 ? e.content.slice(0, 120) + "… " : e.content)}
                          {e.content.length > 120 && (
                            <span style={{ color: "#6366f1", fontWeight: 600, fontSize: "0.8rem" }}>
                              {expanded === e.id ? " Show less" : "Read more"}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{new Date(e.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {(e.tags || []).map(tag => (
                            <span key={tag} style={tagPill}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                        <button style={iconBtn} onClick={() => {
                          setEditId(e.id);
                          setEditState({ title: e.title, content: e.content, mood: e.mood, intensity: e.intensity, tags: (e.tags || []).join(", ") });
                        }}>✏️</button>
                        <button style={{ ...iconBtn, color: "#ef4444" }} onClick={() => handleDelete(e.id)}>🗑️</button>
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

/* ── Helpers ── */
function topMood(entries: JournalEntry[]): string {
  if (!entries.length) return "—";
  const counts: Record<string, number> = {};
  entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
}
function uniqueTags(entries: JournalEntry[]): number {
  const all = entries.flatMap(e => e.tags || []);
  return new Set(all).size;
}

function StatBox({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 14, padding: "1rem", textAlign: "center", border: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 22, marginBottom: "0.25rem" }}>{icon}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 2 }}>{label}</div>
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

const inputLabel: React.CSSProperties = {
  fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.35rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.85rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: "0.92rem",
  fontFamily: "inherit",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const moodGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "0.4rem",
};

const moodBtn: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.2rem",
  padding: "0.5rem 0.25rem",
  borderRadius: 10,
  border: "2px solid #e5e7eb",
  background: "#f9fafb",
  cursor: "pointer",
  fontSize: "0.75rem",
  transition: "all 0.15s",
};

const saveBtn: React.CSSProperties = {
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
  padding: "0.4rem 0.8rem",
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
  fontFamily: "inherit",
};

const entryCard: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "1rem",
  padding: "1.1rem 1.25rem",
  background: "#fafafa",
  borderRadius: 14,
  border: "1px solid #f0f0f0",
};

const moodPill: React.CSSProperties = {
  padding: "0.2rem 0.6rem",
  borderRadius: 99,
  fontSize: "0.72rem",
  fontWeight: 700,
};

const tagPill: React.CSSProperties = {
  padding: "0.15rem 0.55rem",
  borderRadius: 99,
  background: "#eef2ff",
  color: "#4338ca",
  fontSize: "0.72rem",
  fontWeight: 600,
};

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  padding: "0.25rem",
  marginTop: "0.1rem",
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
