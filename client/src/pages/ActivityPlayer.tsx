import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import BreathingActivity       from "../therapies/BreathingActivity";
import MeditationActivity      from "../therapies/MeditationActivity";
import BodyScanActivity        from "../therapies/BodyScanActivity";
import GroundingActivity       from "../therapies/GroundingActivity";
import FocusGame               from "../therapies/FocusGame";
import MemoryGame              from "../therapies/MemoryGame";
import DigitalDetoxActivity    from "../therapies/DigitalDetoxActivity";
import LetterWritingActivity   from "../therapies/LetterWritingActivity";
import ThreeGoodThingsActivity from "../therapies/ThreeGoodThingsActivity";

type Activity = { id:number; title:string; description:string; duration:number; difficulty:string; category:string; type:string; ui:string };
type Session   = { type:string; title:string; average:number; date:string };

const DIFF_GRAD: Record<string,string> = { Beginner:"from-green-300 to-teal-300", Intermediate:"from-amber-300 to-orange-300", Advanced:"from-red-300 to-pink-300" };

export default function ActivityPlayer() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const activity: Activity|undefined = location.state?.activity;

  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    if (!activity) { navigate("/activities"); return; }
    const all: Session[] = JSON.parse(localStorage.getItem(`mindcare_history_${user?.id}`)||"[]");
    setHistory(all.filter(s => s.type === activity.type));
  }, [activity, navigate]);

  if (!activity) return null;

  // Pre-start screen
  if (!started) {
    const avgWellness = history.length ? Math.round(history.reduce((s,h) => s+(h.average||0), 0)/history.length) : null;

    return (
      <div className="min-h-screen">
        {/* Back nav */}
        <div className="sticky top-0 z-10 bg-white/20 backdrop-blur-xl border-b border-white/25 px-6 py-3">
          <Link to="/activities" className="text-rose-500 font-semibold text-sm no-underline hover:underline">
            ← Back to Activities
          </Link>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5 animate-fade-in">
          {/* Hero card */}
          <div className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(168,85,247,0.75),rgba(99,102,241,0.75))", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.25)", boxShadow:"0 20px 60px rgba(168,85,247,0.3)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"/>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">{activity.category}</p>
            <h1 className="text-3xl font-black mb-3">{activity.title}</h1>
            <p className="text-white/85 leading-relaxed mb-5 text-sm">{activity.description}</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold">⏱ {activity.duration} min</span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${DIFF_GRAD[activity.difficulty]||"from-rose-300 to-pink-300"} text-white`}>{activity.difficulty}</span>
              {history.length>0 && (
                <span className="px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold">✓ {history.length} session{history.length>1?"s":""} completed</span>
              )}
            </div>
          </div>

          {/* Stats (if history exists) */}
          {history.length>0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {label:"Sessions",     value:history.length,     icon:"🎯"},
                {label:"Avg Wellness", value:`${avgWellness}%`,  icon:"📊"},
                {label:"Last Played",  value:new Date(history[0].date).toLocaleDateString("en",{month:"short",day:"numeric"}), icon:"📅"},
              ].map(({label,value,icon})=>(
                <div key={label} className="glass-card p-4 text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-black text-gray-800 text-lg">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Past sessions */}
          {history.length>0 && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-3">📋 Your History</h2>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {history.map((s,i)=>(
                  <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-white/30 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-800 text-xs">{s.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.date).toLocaleString("en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                    <div className={`font-black text-base ${s.average>=70?"text-green-500":s.average>=40?"text-amber-500":"text-red-500"}`}>{s.average}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={()=>setStarted(true)}
            className="btn-primary w-full py-4 text-lg font-black rounded-2xl shadow-xl"
          >
            {history.length>0?"▶ Play Again":"▶ Start Activity"}
          </button>
        </div>
      </div>
    );
  }

  // Persistent back button overlay (rendered on top of any activity)
  function BackBar() {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        display: "flex", alignItems: "center", padding: "10px 16px",
        background: "rgba(0,0,0,0.28)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}>
        <button
          onClick={() => navigate("/activities")}
          style={{
            background: "none", border: "none", color: "white",
            fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, opacity: 0.9,
            letterSpacing: "0.01em",
          }}
        >
          ← Back to Activities
        </button>
      </div>
    );
  }

  function renderActivity() {
    const act = activity!; // safe: guarded by `if (!activity) return null` above
    switch(act.type) {
      case "breathing":         return <BreathingActivity       activity={act}/>;
      case "meditation":        return <MeditationActivity      activity={act}/>;
      case "bodyscan":          return <BodyScanActivity        activity={act}/>;
      case "grounding":         return <GroundingActivity       activity={act}/>;
      case "game-focus":        return <FocusGame               activity={act}/>;
      case "game-memory":       return <MemoryGame              activity={act}/>;
      case "digital-detox":     return <DigitalDetoxActivity    activity={act}/>;
      case "letter-writing":    return <LetterWritingActivity   activity={act}/>;
      case "three-good-things": return <ThreeGoodThingsActivity activity={act}/>;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-gray-500">
            <p>Unknown activity type: {act.type}</p>
            <button onClick={() => navigate("/activities")} className="btn-primary px-6 py-2">← Back</button>
          </div>
        );
    }
  }

  return (
    <>
      <BackBar />
      {renderActivity()}
    </>
  );
}
