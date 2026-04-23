import { useEffect, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";
import { useAuth } from "../context/AuthContext";

type Session = { type:string; title:string; average:number; date:string; score?:number|null };

const TYPE_EMOJI: Record<string,string> = {
  breathing:"🌬️", meditation:"🧘", bodyscan:"🫁", grounding:"🌱",
  "game-focus":"🎯", "game-memory":"🧩", "digital-detox":"📵",
  "letter-writing":"✒️", "three-good-things":"🌟",
};
const TYPE_COLORS: Record<string,string> = {
  breathing:"#fda4af", meditation:"#86efac", bodyscan:"#93c5fd",
  grounding:"#6ee7b7", "game-focus":"#fdba74", "game-memory":"#f9a8d4",
  "digital-detox":"#a5b4fc", "letter-writing":"#fde68a", "three-good-things":"#fca5a5",
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [history,  setHistory]  = useState<Session[]>([]);
  const [filter,   setFilter]   = useState<string>("all");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(`mindcare_history_${user?.id}`) || "[]");
    setHistory(data);
  }, [user?.id]);

  const avgScore = history.length
    ? Math.round(history.reduce((a,b) => a+b.average, 0) / history.length) : 0;

  const uniqueDays = new Set(history.map(h => new Date(h.date).toDateString())).size;

  const allTypes = [...new Set(history.map(h => h.type))];

  const displayed = filter === "all"
    ? history
    : history.filter(h => h.type === filter);

  const pillCls = (active:boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
     ${active ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-sm"
              : "bg-white/40 border-rose-100/60 text-gray-600 hover:bg-white/60"}`;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-3xl font-black text-gray-800">Activity History</h1>
          <p className="text-gray-500 mt-1">Your wellness journey — one session at a time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:"Total Sessions",  value:history.length, color:"text-rose-500",    bg:"bg-rose-50/60"   },
            { label:"Avg Wellness",    value:`${avgScore}%`, color:"text-pink-500",    bg:"bg-pink-50/60"   },
            { label:"Active Days",     value:uniqueDays,     color:"text-emerald-500", bg:"bg-emerald-50/60"},
          ].map(s => (
            <div key={s.label} className={`glass-card p-5 text-center ${s.bg}`}>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter by type */}
        {allTypes.length > 0 && (
          <div className="glass-card p-4 flex flex-wrap gap-2">
            <button onClick={() => setFilter("all")} className={pillCls(filter === "all")}>All</button>
            {allTypes.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={pillCls(filter === t)}>
                {TYPE_EMOJI[t] || "✨"} {t.replace(/-/g," ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        {displayed.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center gap-3 text-center text-gray-400">
            <span className="text-5xl emoji-bounce">🌱</span>
            <p className="text-sm">No activity history yet. Start an activity to see your progress here!</p>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="flex flex-col gap-3">
              {displayed.map((s, i) => {
                const color = TYPE_COLORS[s.type] || "#fda4af";
                const scoreColor = s.average >= 70 ? "#10b981" : s.average >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={i}
                    className="flex items-center gap-4 p-4 bg-white/35 rounded-2xl border-l-4 hover:bg-white/50 transition-all"
                    style={{ borderColor: color }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: `${color}25` }}>
                      {TYPE_EMOJI[s.type] || "✨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm">{s.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.date).toLocaleString("en", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-lg font-black" style={{ color: scoreColor }}>{s.average}%</div>
                      <div className="w-20 h-1.5 bg-white/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${s.average}%`, background:scoreColor }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
