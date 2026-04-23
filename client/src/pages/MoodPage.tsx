import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import AppNavbar from "../components/navbar/AppNavbar";
import { getMoods, addMood, deleteMood, updateMood, MoodEntry } from "../services/moodApi";

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

const MOOD_FEEDBACK: Record<string,string> = {
  Happy:    "Amazing! Your happiness is contagious. Keep riding this wave!",
  Calm:     "That calm energy is beautiful. Carry it with you today.",
  Neutral:  "Feeling neutral is okay. You're steady — and that's strength.",
  Sad:      "It's okay to feel sad. You're not alone. Be gentle with yourself today.",
  Stressed: "Take a breath. Stress is temporary. Try a breathing activity to find calm.",
};

const MOOD_COLOR: Record<string,string> = {
  Happy:"#22c55e", Calm:"#3b82f6", Neutral:"#a3a3a3", Sad:"#6366f1", Stressed:"#ef4444",
};

const MOOD_EMOJI: Record<string,string> = {
  Happy:"😊", Calm:"😌", Neutral:"😐", Sad:"😔", Stressed:"😰",
};

// Different animation per mood to make it feel alive
const MOOD_ANIM: Record<string,string> = {
  Happy:"emoji-bounce", Calm:"emoji-pulse", Neutral:"",
  Sad:"emoji-wiggle", Stressed:"emoji-pulse",
};

export default function MoodPage() {
  const [moods,         setMoods]    = useState<MoodEntry[]>([]);
  const [loading,       setLoading]  = useState(true);
  const [saving,        setSaving]   = useState(false);
  const [editId,        setEditId]   = useState<number|null>(null);
  const [editMood,      setEditMood] = useState("Happy");
  const [editIntensity, setEditInt]  = useState(3);
  const [editNote,      setEditNote] = useState("");
  const [search,        setSearch]   = useState("");
  const [filter,        setFilter]   = useState<"week"|"month">("week");
  const [selectedMood,  setSelMood]  = useState("Happy");
  const [intensity,     setIntensity]= useState(3);
  const [note,          setNote]     = useState("");
  const [toast,         setToast]    = useState("");

  useEffect(() => { getMoods().then(setMoods).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const entry = await addMood({ mood:selectedMood, intensity, note });
      setMoods(prev=>[entry,...prev]);
      setNote(""); setIntensity(3);
      setToast(MOOD_FEEDBACK[selectedMood]||"Mood logged!");
      setTimeout(()=>setToast(""),4000);
    } catch { alert("Failed to save mood. Please try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id:number) { await deleteMood(id); setMoods(prev=>prev.filter(m=>m.id!==id)); }

  async function handleUpdate() {
    if (editId===null) return;
    const updated = await updateMood(editId,{mood:editMood,intensity:editIntensity,note:editNote});
    setMoods(prev=>prev.map(m=>m.id===editId?updated:m));
    setEditId(null);
  }

  const filtered = useMemo(()=>{
    const days=filter==="week"?7:30;
    const cutoff=new Date(Date.now()-days*86400000);
    return moods.filter(m=>new Date(m.created_at)>=cutoff);
  },[moods,filter]);

  const searched = useMemo(()=>{
    const s=search.toLowerCase();
    return filtered.filter(m=>m.mood.toLowerCase().includes(s)||(m.note||"").toLowerCase().includes(s));
  },[filtered,search]);

  const chartData = useMemo(()=>
    searched.slice().reverse().map(m=>({
      date:new Date(m.created_at).toLocaleDateString("en",{month:"short",day:"numeric"}),
      intensity:m.intensity, mood:m.mood,
    })),[searched]);

  const pillCls = (active:boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
     ${active ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-sm"
              : "bg-white/40 border-rose-100/60 text-gray-600 hover:bg-white/60"}`;

  return (
    <div className="min-h-screen">
      <AppNavbar />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card-strong px-6 py-3 z-50 font-semibold text-gray-700 text-sm whitespace-nowrap animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Mood Tracker</h1>
          <p className="text-gray-500 mt-1">Log how you're feeling and track patterns over time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Log Mood */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-gray-800 mb-1">How are you feeling?</h2>
            <p className="text-xs text-gray-400 mb-5">Select a mood and log how intense it feels</p>

            {/* Mood grid — large animated emojis */}
            <div className="grid grid-cols-5 gap-2 mb-5">
              {MOODS.map(m => (
                <button
                  key={m}
                  onClick={() => setSelMood(m)}
                  className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                    ${selectedMood===m
                      ? "border-rose-300 bg-rose-50/60 shadow-md scale-105"
                      : "border-white/40 bg-white/25 hover:bg-white/45 hover:border-rose-100"}`}
                >
                  <span className={`text-3xl ${MOOD_ANIM[m]}`}>{MOOD_EMOJI[m]}</span>
                  <span className={`text-xs font-semibold ${selectedMood===m?"text-rose-600":"text-gray-500"}`}>{m}</span>
                </button>
              ))}
            </div>

            {/* Intensity */}
            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Intensity</label>
                <span className="text-sm font-bold gradient-text">{intensity}/5</span>
              </div>
              <input type="range" min={1} max={5} value={intensity} onChange={e=>setIntensity(Number(e.target.value))} className="w-full"/>
              <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Low</span><span>High</span></div>
            </div>

            {/* Note */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What's on your mind?" rows={3} className="glass-input resize-none text-sm"/>
            </div>

            <button onClick={handleSave} disabled={saving} className="btn-primary w-full py-2.5 text-sm">
              {saving ? "Saving…" : "Save Mood"}
            </button>
          </div>

          {/* Trend Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Mood Trend</h2>
              <div className="flex gap-2">
                {(["week","month"] as const).map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} className={pillCls(filter===f)}>
                    {f==="week"?"7 days":"30 days"}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length>0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,200,210,0.4)"/>
                    <XAxis dataKey="date" tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <Tooltip formatter={(val:any,_:any,e:any)=>[`${val}/5 (${e.payload.mood})`,"Intensity"]} contentStyle={{borderRadius:12,background:"rgba(255,255,255,0.92)",border:"1px solid rgba(255,210,215,0.5)",fontSize:12}}/>
                    <Line type="monotone" dataKey="intensity" stroke="url(#moodGradWarm)" strokeWidth={3} dot={{r:5,fill:"#fda4af"}} activeDot={{r:7}}/>
                    <defs>
                      <linearGradient id="moodGradWarm" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#fda4af"/>
                        <stop offset="100%" stopColor="#fdba74"/>
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-5xl emoji-pulse">📈</span>
                <p className="text-sm text-center">Log a few moods to see your trend here</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="font-bold text-gray-800">Mood History</h2>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mood or note…" className="glass-input text-sm w-52"/>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading…</div>
          ) : searched.length===0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-400">
              <span className="text-5xl emoji-bounce">😶</span>
              <p className="text-sm">No mood entries yet. Start logging to see them here!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {searched.map(m=>(
                <div key={m.id}
                  className="bg-white/35 backdrop-blur-sm rounded-2xl p-4 border-l-4 hover:bg-white/50 transition-all"
                  style={{borderColor:MOOD_COLOR[m.mood]||"#a3a3a3"}}>
                  {editId===m.id ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2 flex-wrap">
                        {MOODS.map(mo=>(
                          <button key={mo} onClick={()=>setEditMood(mo)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${editMood===mo?"bg-rose-100 text-rose-600 border-rose-200":"bg-white/40 border-white/30 text-gray-600"}`}>
                            {MOOD_EMOJI[mo]} {mo}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-500 font-semibold whitespace-nowrap">Intensity: {editIntensity}</label>
                        <input type="range" min={1} max={5} value={editIntensity} onChange={e=>setEditInt(Number(e.target.value))} className="flex-1"/>
                      </div>
                      <input value={editNote} onChange={e=>setEditNote(e.target.value)} placeholder="Note…" className="glass-input text-sm"/>
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="btn-primary text-xs px-4 py-1.5">Save</button>
                        <button onClick={()=>setEditId(null)} className="btn-secondary text-xs px-4 py-1.5">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <span className={`text-3xl shrink-0 ${MOOD_ANIM[m.mood]}`}>{MOOD_EMOJI[m.mood]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-gray-800 text-sm">{m.mood}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-gray-500 border border-white/30">intensity {m.intensity}/5</span>
                        </div>
                        {m.note && <p className="text-xs text-gray-500 truncate">{m.note}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={()=>{setEditId(m.id);setEditMood(m.mood);setEditInt(m.intensity);setEditNote(m.note||"");}}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/40 text-gray-600 hover:bg-white/60 border border-white/30">✏️</button>
                        <button onClick={()=>handleDelete(m.id)}
                          className="text-xs px-2.5 py-1 rounded-full bg-red-50/60 text-red-400 hover:bg-red-50 border border-red-100/50">🗑</button>
                      </div>
                    </div>
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
