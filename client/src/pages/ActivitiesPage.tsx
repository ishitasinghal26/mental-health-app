import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../services/apiClient";
import AppNavbar from "../components/navbar/AppNavbar";
import { useAuth } from "../context/AuthContext";

const DIFFICULTY_COLOR: Record<string,string> = { Beginner:"#10b981", Intermediate:"#f59e0b", Advanced:"#ef4444" };
const DIFFICULTY_GRAD:  Record<string,string> = { Beginner:"from-green-300 to-teal-300", Intermediate:"from-amber-300 to-orange-300", Advanced:"from-red-300 to-pink-300" };
const CATEGORY_ICON:    Record<string,string> = {
  "Breathing":"🌬️","Meditation":"🧘","Body Scan":"🫁","Relaxation":"🫁",
  "Anxiety Relief":"🌿","Stress Relief Game":"🎯","Emotional Awareness":"🧠",
  "Digital Wellness":"📵","Emotional Expression":"✒️","Positive Psychology":"🌟",
};
const DIFFICULTY = ["Beginner","Intermediate","Advanced"];
const DURATIONS  = [5,10,15];

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allActivities,    setAll]        = useState<any[]>([]);
  const [activities,       setActivities] = useState<any[]>([]);
  const [loading,          setLoading]    = useState(true);
  const [difficulty,       setDiff]       = useState("");
  const [maxDuration,      setMaxDur]     = useState("");
  const [showRecommended,  setShowRec]    = useState(false);
  const [overallSeverity,  setSeverity]   = useState<string|null>(null);
  const [sessionCounts,    setCounts]     = useState<Record<string,number>>({});

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem(`mindcare_history_${user?.id}`)||"[]");
    const counts: Record<string,number> = {};
    hist.forEach((s:any) => { counts[s.type]=(counts[s.type]||0)+1; });
    setCounts(counts);

    apiClient.get("/assessment/latest").then(r => { if(r.data?.overallSeverity) setSeverity(r.data.overallSeverity); }).catch(()=>{});

    apiClient.get("/activities").then(r => { setAll(r.data||[]); setActivities(r.data||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  useEffect(() => {
    if(!allActivities.length) return;
    let f = allActivities;
    if(difficulty) f = f.filter((a:any)=>a.difficulty===difficulty);
    if(maxDuration) f = f.filter((a:any)=>a.duration<=Number(maxDuration));
    if(showRecommended && overallSeverity) f = f.filter((a:any)=>Array.isArray(a.recommended)&&a.recommended.includes(overallSeverity));
    setActivities(f);
  },[allActivities,difficulty,maxDuration,showRecommended,overallSeverity]);

  const pillCls = (active:boolean) => `px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${active?"bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-md":"bg-white/30 border-rose-100/50 text-gray-600 hover:bg-white/50"}`;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-gray-800">🎯 Wellness Activities</h1>
          <p className="text-gray-500 mt-1">Guided exercises to calm your mind, reduce stress, and boost well-being.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-5 flex flex-wrap gap-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Difficulty</span>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>setDiff("")}         className={pillCls(difficulty==="")}>All</button>
              {DIFFICULTY.map(d=><button key={d} onClick={()=>setDiff(d)} className={pillCls(difficulty===d)}>{d}</button>)}
              {overallSeverity && (
                <button onClick={()=>setShowRec(v=>!v)} className={pillCls(showRecommended)}>
                  ⭐ Recommended{showRecommended?` (${activities.length})`:""}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Duration</span>
            <div className="flex gap-2 flex-wrap">
              <button onClick={()=>setMaxDur("")} className={pillCls(maxDuration==="")}>Any</button>
              {DURATIONS.map(d=><button key={d} onClick={()=>setMaxDur(String(d))} className={pillCls(maxDuration===String(d))}>≤{d} min</button>)}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="text-5xl animate-float">🌿</span>
            <p>Loading activities…</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-2 text-gray-400">
            <span className="text-5xl">🔍</span>
            <p>No activities match your filters. Try adjusting them!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map((a:any) => {
              const sessions = sessionCounts[a.type]||0;
              const pct = Math.min(100,sessions*20);
              const diffColor = DIFFICULTY_COLOR[a.difficulty]||"#6366f1";
              const diffGrad  = DIFFICULTY_GRAD[a.difficulty]||"from-rose-300 to-pink-300";
              return (
                <div key={a.id}
                  className="glass-card p-6 flex flex-col gap-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-default"
                  style={{ borderTop:`3px solid ${diffColor}` }}>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background:`${diffColor}18` }}>
                      {CATEGORY_ICON[a.category]||"✨"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-sm leading-snug">{a.title}</h3>
                      <div className="flex gap-1.5 flex-wrap mt-1.5">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r ${diffGrad} text-white`}>{a.difficulty}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100/60 text-blue-700">⏱ {a.duration}m</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100/60 text-rose-600">{a.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed flex-1">{a.description}</p>

                  {sessions > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Sessions completed</span><span>{sessions}</span>
                      </div>
                      <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width:`${pct}%`, background:`linear-gradient(90deg,${diffColor},${diffColor}aa)` }}/>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={()=>navigate("/activity-player",{state:{activity:a}})}
                    className="btn-primary w-full py-2.5 text-sm mt-auto"
                  >
                    {sessions>0?"▶ Play Again":"Start Activity →"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
