import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";
import { getJournals, createJournal, deleteJournal, updateJournal, JournalEntry } from "../services/journalApi";

const MOODS = ["Happy","Calm","Neutral","Sad","Stressed"];
const MOOD_COLOR: Record<string,string> = { Happy:"#22c55e",Calm:"#3b82f6",Neutral:"#a3a3a3",Sad:"#6366f1",Stressed:"#ef4444" };
const MOOD_EMOJI: Record<string,string> = { Happy:"😊",Calm:"😌",Neutral:"😐",Sad:"😔",Stressed:"😰" };
const MOOD_ANIM:  Record<string,string> = { Happy:"emoji-bounce",Calm:"emoji-pulse",Neutral:"",Sad:"emoji-wiggle",Stressed:"emoji-pulse" };

const JOURNAL_FEEDBACK: Record<string,string> = {
  Happy:"Your joy is captured forever in this entry.",
  Calm:"Your peaceful reflections are a gift to your future self.",
  Neutral:"Entry saved. Showing up on neutral days takes strength.",
  Sad:"That took courage. You're not alone.",
  Stressed:"Getting words out of your head is the first step to relief.",
};

type EditState = { title:string; content:string; mood:string; intensity:number; tags:string };

export default function JournalPage() {
  const [entries,   setEntries]   = useState<JournalEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editId,    setEditId]    = useState<number|null>(null);
  const [editState, setEditState] = useState<EditState>({title:"",content:"",mood:"Neutral",intensity:3,tags:""});
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<"week"|"month">("week");
  const [form,      setForm]      = useState({title:"",content:"",mood:"Neutral",intensity:3,tags:""});
  const [expanded,  setExpanded]  = useState<number|null>(null);
  const [toast,     setToast]     = useState("");

  useEffect(()=>{ getJournals().then(setEntries).catch(()=>{}).finally(()=>setLoading(false)); },[]);

  async function handleCreate() {
    if (!form.title.trim()||!form.content.trim()){alert("Title & content are required.");return;}
    setSaving(true);
    try {
      const entry = await createJournal({title:form.title.trim(),content:form.content.trim(),mood:form.mood,intensity:form.intensity,tags:form.tags.split(",").map(t=>t.trim()).filter(Boolean)});
      setEntries(prev=>[entry,...prev]);
      setForm({title:"",content:"",mood:"Neutral",intensity:3,tags:""});
      setToast(JOURNAL_FEEDBACK[form.mood]||"Entry saved!");
      setTimeout(()=>setToast(""),4500);
    } catch { alert("Failed to save journal."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id:number){ await deleteJournal(id); setEntries(prev=>prev.filter(e=>e.id!==id)); if(editId===id)setEditId(null); }

  async function handleUpdate(){
    if(editId===null)return;
    const updated=await updateJournal(editId,{title:editState.title,content:editState.content,mood:editState.mood,intensity:editState.intensity,tags:editState.tags.split(",").map(t=>t.trim()).filter(Boolean)});
    setEntries(prev=>prev.map(e=>e.id===editId?updated:e));
    setEditId(null);
  }

  const filtered = useMemo(()=>{const days=filter==="week"?7:30;const cutoff=new Date(Date.now()-days*86400000);return entries.filter(e=>new Date(e.created_at)>=cutoff);},[entries,filter]);
  const searched  = useMemo(()=>{const s=search.toLowerCase();if(!s)return filtered;return filtered.filter(e=>e.title.toLowerCase().includes(s)||e.content.toLowerCase().includes(s));},[filtered,search]);

  const pillCls = (active:boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
     ${active?"bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-sm":"bg-white/40 border-rose-100/60 text-gray-600 hover:bg-white/60"}`;

  return (
    <div className="min-h-screen">
      <AppNavbar />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-card-strong px-6 py-3 z-50 font-semibold text-gray-700 text-sm whitespace-nowrap animate-fade-in">
          {toast}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Journal</h1>
          <p className="text-gray-500 mt-1">Capture your thoughts, reflect on your feelings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* New Entry Form */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-gray-800 mb-1">New Entry</h2>
            <p className="text-xs text-gray-400 mb-4">What's on your mind today?</p>
            <div className="flex flex-col gap-3">
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Give this entry a title…" className="glass-input text-sm"/>
              <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Write freely. No rules, no judgement…" rows={5} className="glass-input resize-none text-sm"/>

              {/* Mood picker with animated emojis */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Mood</label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m=>(
                    <button key={m} onClick={()=>setForm({...form,mood:m})}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all
                        ${form.mood===m?"bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-sm":"bg-white/40 border-rose-100/60 text-gray-600 hover:bg-white/60"}`}>
                      <span className={form.mood===m?MOOD_ANIM[m]:""}>{MOOD_EMOJI[m]}</span> {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <div className="flex justify-between mb-1"><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Intensity</label><span className="gradient-text text-sm font-bold">{form.intensity}/5</span></div>
                <input type="range" min={1} max={5} value={form.intensity} onChange={e=>setForm({...form,intensity:Number(e.target.value)})} className="w-full"/>
              </div>

              <input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Tags: anxiety, sleep, work…" className="glass-input text-sm"/>
              <button onClick={handleCreate} disabled={saving} className="btn-primary w-full py-2.5 text-sm">{saving?"Saving…":"Save Entry"}</button>
            </div>
          </div>

          {/* Stats panel */}
          <div className="glass-card p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-bold text-gray-800 mb-3">Your Journal Stats</h2>
              <div className="grid grid-cols-2 gap-3">
                {[["Total Entries",entries.length,"text-rose-500"],["This Period",filtered.length,"text-pink-500"],["Happy",entries.filter(e=>e.mood==="Happy").length,"text-emerald-500"],["Stressed",entries.filter(e=>e.mood==="Stressed").length,"text-amber-500"]].map(([l,v,t])=>(
                  <div key={l as string} className="bg-white/35 rounded-xl p-4 text-center border border-rose-100/40">
                    <div className={`text-2xl font-black ${t}`}>{v}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Period filter */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Filter period</p>
              <div className="flex gap-2">
                {(["week","month"] as const).map(f=><button key={f} onClick={()=>setFilter(f)} className={pillCls(filter===f)}>{f==="week"?"Last 7 days":"Last 30 days"}</button>)}
              </div>
            </div>

            {/* Mood distribution */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Mood distribution</p>
              <div className="flex flex-col gap-1.5">
                {MOODS.map(m=>{
                  const count=entries.filter(e=>e.mood===m).length;
                  const pct=entries.length?Math.round(count/entries.length*100):0;
                  return (
                    <div key={m} className="flex items-center gap-2">
                      <span className={`text-base w-6 ${MOOD_ANIM[m]}`}>{MOOD_EMOJI[m]}</span>
                      <span className="text-xs text-gray-600 w-14">{m}</span>
                      <div className="flex-1 h-1.5 bg-white/40 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`,background:MOOD_COLOR[m]}}/>
                      </div>
                      <span className="text-xs text-gray-400 w-6">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="font-bold text-gray-800">Journal History</h2>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…" className="glass-input text-sm w-48"/>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading…</div>
          ) : searched.length===0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2 text-gray-400">
              <span className="text-5xl emoji-bounce">📖</span>
              <p className="text-sm">No journal entries yet. Start writing!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {searched.map(e=>(
                <div key={e.id} className="bg-white/35 rounded-2xl p-5 border-l-4 hover:bg-white/50 transition-all" style={{borderColor:MOOD_COLOR[e.mood]||"#a3a3a3"}}>
                  {editId===e.id ? (
                    <div className="flex flex-col gap-3">
                      <input value={editState.title} onChange={ev=>setEditState({...editState,title:ev.target.value})} className="glass-input text-sm"/>
                      <textarea value={editState.content} onChange={ev=>setEditState({...editState,content:ev.target.value})} rows={4} className="glass-input resize-none text-sm"/>
                      <div className="flex gap-2 flex-wrap">
                        {MOODS.map(m=><button key={m} onClick={()=>setEditState({...editState,mood:m})} className={`px-3 py-1 rounded-full text-xs cursor-pointer border transition-all ${editState.mood===m?"bg-rose-100 text-rose-600 border-rose-200":"bg-white/40 border-white/30 text-gray-600"}`}>{MOOD_EMOJI[m]} {m}</button>)}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="btn-primary text-xs px-4 py-1.5">Save</button>
                        <button onClick={()=>setEditId(null)} className="btn-secondary text-xs px-4 py-1.5">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xl ${MOOD_ANIM[e.mood]}`}>{MOOD_EMOJI[e.mood]}</span>
                          <span className="font-bold text-gray-800 text-sm truncate">{e.title}</span>
                        </div>
                        <p className={`text-sm text-gray-600 cursor-pointer leading-relaxed ${expanded===e.id?"":"line-clamp-2"}`} onClick={()=>setExpanded(expanded===e.id?null:e.id)}>{e.content}</p>
                        {(e.tags||[]).length>0&&<div className="flex gap-1 flex-wrap mt-2">{(e.tags||[]).map(t=><span key={t} className="text-xs px-2 py-0.5 bg-rose-50/60 rounded-full text-rose-500 border border-rose-100/50">{t}</span>)}</div>}
                        <p className="text-xs text-gray-400 mt-1.5">{new Date(e.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={()=>{setEditId(e.id);setEditState({title:e.title,content:e.content,mood:e.mood,intensity:e.intensity||3,tags:(e.tags||[]).join(", ")});}} className="text-xs px-2.5 py-1 rounded-full bg-white/40 text-gray-600 hover:bg-white/60 border border-white/30">✏️</button>
                        <button onClick={()=>handleDelete(e.id)} className="text-xs px-2.5 py-1 rounded-full bg-red-50/60 text-red-400 hover:bg-red-50 border border-red-100/50">🗑</button>
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
