import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Activity = { id: number; title: string; duration: number; };
type Card = { id: number; value: string; flipped: boolean; matched: boolean };

const EMOJIS = ["🌿", "🌼", "🌙", "🧠", "💙", "✨"];

function makeCards() {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((v, i) => ({ id: i, value: v, flipped: false, matched: false }));
}

function Btn({ onClick, bg, children }: { onClick: () => void; bg: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.55rem 1.25rem", borderRadius: 12, border: "none",
      background: bg, color: "white", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
    }}>{children}</button>
  );
}

export default function MemoryGame({ activity }: { activity: Activity }) {
  const navigate = useNavigate();
  const total = activity.duration * 60;

  const [cards,    setCards]    = useState<Card[]>(() => makeCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves,    setMoves]    = useState(0);
  const [time,     setTime]     = useState(total);
  const [started,  setStarted]  = useState(false);
  const [paused,   setPaused]   = useState(false);
  const [finished, setFinished] = useState(false);

  // Countdown
  useEffect(() => {
    if (!started || paused || finished) return;
    const t = setInterval(() => {
      setTime(s => {
        if (s <= 1) { clearInterval(t); endGame(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, paused, finished]);

  // Win check
  useEffect(() => {
    if (started && cards.length && cards.every(c => c.matched)) {
      setFinished(true);
      setTimeout(endGame, 500);
    }
  }, [cards, started]);

  function endGame() {
    const pairs  = cards.filter(c => c.matched).length / 2;
    const score  = Math.max(0, pairs * 10 + Math.max(0, time) - moves * 2);
    navigate("/activity-result", { state: { activity, score } });
  }

  function flipCard(index: number) {
    if (paused || !started || finished) return;
    if (selected.length === 2 || cards[index].flipped || cards[index].matched) return;

    const updated = [...cards];
    updated[index] = { ...updated[index], flipped: true };
    const next = [...selected, index];
    setCards(updated);
    setSelected(next);

    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      if (updated[a].value === updated[b].value) {
        const matched = [...updated];
        matched[a] = { ...matched[a], matched: true };
        matched[b] = { ...matched[b], matched: true };
        setCards(matched);
        setSelected([]);
      } else {
        setTimeout(() => {
          const reset = [...updated];
          reset[a] = { ...reset[a], flipped: false };
          reset[b] = { ...reset[b], flipped: false };
          setCards(reset);
          setSelected([]);
        }, 700);
      }
    }
  }

  function handleReset() {
    setCards(makeCards()); setSelected([]); setMoves(0);
    setTime(total); setStarted(false); setPaused(false); setFinished(false);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", gap: "1.25rem", fontFamily: "'Inter',system-ui" }}>
      <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0 }}>Memory Match 🧠</h2>

      <div style={{ display: "flex", gap: "1.5rem", fontSize: "1rem", opacity: 0.8 }}>
        <span>⏳ {fmt(time)}</span>
        <span>🔄 Moves: {moves}</span>
        <span>✅ {cards.filter(c => c.matched).length / 2}/{EMOJIS.length} pairs</span>
      </div>

      {!started ? (
        <div style={{ textAlign: "center", opacity: 0.8, maxWidth: 380 }}>
          <p style={{ marginBottom: "1rem", lineHeight: 1.5 }}>Match all the emotion pairs before time runs out!</p>
          <Btn onClick={() => setStarted(true)} bg="#22c55e">▶ Start Game</Btn>
        </div>
      ) : (
        <>
          {paused && (
            <div style={{ background: "rgba(0,0,0,0.7)", padding: "1rem 2rem", borderRadius: 16, fontSize: "1.2rem", fontWeight: 700 }}>
              ⏸ Paused — press Resume to continue
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 90px)", gap: 12 }}>
            {cards.map((c, i) => (
              <div key={c.id} onClick={() => flipCard(i)} style={{
                width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, cursor: paused ? "default" : "pointer", borderRadius: 16,
                background: c.flipped || c.matched ? "#6366f1" : "#1e293b",
                color: "white", userSelect: "none", transition: "background 0.2s",
                opacity: c.matched ? 0.65 : 1,
                boxShadow: c.matched ? "0 0 10px rgba(99,102,241,0.4)" : "none",
              }}>
                {(c.flipped || c.matched) ? c.value : "?"}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            {paused
              ? <Btn onClick={() => setPaused(false)} bg="#22c55e">▶ Resume</Btn>
              : <Btn onClick={() => setPaused(true)}  bg="#f59e0b">⏸ Pause</Btn>
            }
            <Btn onClick={handleReset} bg="#6b7280">↺ Reset</Btn>
          </div>
        </>
      )}
    </div>
  );
}
