import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";

type Badge = { id:string; emoji:string; title:string; desc:string; earned:(h:Session[])=>boolean };
type Session = { type:string; title:string; average:number; date:string; score?:number|null };

const BADGES: Badge[] = [
  {id:"first_step",  emoji:"🌱",title:"First Step",      desc:"Complete your first activity",         earned:h=>h.length>=1},
  {id:"week_warrior",emoji:"🔥",title:"Week Warrior",    desc:"Complete 5 activities",                earned:h=>h.length>=5},
  {id:"ten_sessions",emoji:"🏆",title:"Dedicated",       desc:"Complete 10 activities",               earned:h=>h.length>=10},
  {id:"breather",    emoji:"💨",title:"Breather",        desc:"Complete a breathing exercise",         earned:h=>h.some(s=>s.type==="breathing")},
  {id:"mindful",     emoji:"🧘",title:"Mindful",         desc:"Complete a meditation session",         earned:h=>h.some(s=>s.type==="meditation")},
  {id:"writer",      emoji:"✍️",title:"Writer",          desc:"Write an unsent letter",               earned:h=>h.some(s=>s.type==="letter-writing")},
  {id:"detoxer",     emoji:"📵",title:"Digital Detoxer", desc:"Complete a digital detox challenge",   earned:h=>h.some(s=>s.type==="digital-detox")},
  {id:"gratitude",   emoji:"🌟",title:"Gratitude Guru",  desc:"Complete the 3 Good Things activity",  earned:h=>h.some(s=>s.type==="three-good-things")},
  {id:"high_score",  emoji:"💎",title:"Top Performer",   desc:"Achieve 90%+ wellness on any activity",earned:h=>h.some(s=>s.average>=90)},
  {id:"grounded",    emoji:"🌍",title:"Grounded",        desc:"Complete a grounding exercise",         earned:h=>h.some(s=>s.type==="grounding")},
  {id:"streak_3",    emoji:"⚡",title:"3-Day Streak",    desc:"Stay active 3 days in a row",          earned:h=>calcStreak(h)>=3},
  {id:"game_player", emoji:"🎮",title:"Game On",         desc:"Play a focus or memory game",           earned:h=>h.some(s=>s.type.startsWith("game-"))},
];

function calcStreak(history:Session[]):number {
  const days=[...new Set(history.map(h=>new Date(h.date).toDateString()))].sort((a,b)=>new Date(b)>new Date(a)?1:-1);
  if(!days.length)return 0;
  let streak=1;
  const today=new Date().toDateString();
  if(days[0]!==today&&days[0]!==new Date(Date.now()-86400000).toDateString())return 0;
  for(let i=1;i<days.length;i++){const diff=(new Date(days[i-1]).getTime()-new Date(days[i]).getTime())/86400000;if(Math.round(diff)===1)streak++;else break;}
  return streak;
}

export default function ProfilePage() {
  const {user,logout,saveConsent} = useAuth();
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get("tab") as "settings"|"history"|"badges" || "settings";
  const [tab,          setTab]    = useState<"settings"|"history"|"badges">(initialTab);
  const [showConsentModal,setModal]= useState(false);
  const [toggling,     setToggling]= useState(false);
  const [message,      setMessage] = useState("");
  const [history,      setHistory] = useState<Session[]>([]);

  const aiEnabled = user?.ai_consent===true;
  const initials  = user?.name ? user.name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2) : "U";

  useEffect(()=>{ setHistory(JSON.parse(localStorage.getItem(`mindcare_history_${user?.id}`)||"[]")); },[user?.id]);

  async function handleToggleConsent(newValue:boolean){
    setToggling(true);
    try{await saveConsent(newValue);setMessage(newValue?"AI insights enabled!":"AI insights disabled.");setModal(false);}
    catch{setMessage("Failed to update. Please try again.");}
    finally{setToggling(false);setTimeout(()=>setMessage(""),3000);}
  }

  const earnedBadges = BADGES.filter(b=>b.earned(history));
  const lockedBadges = BADGES.filter(b=>!b.earned(history));
  const uniqueDays   = new Set(history.map(h=>new Date(h.date).toDateString())).size;
  const avgWellness  = history.length ? Math.round(history.reduce((s,h)=>s+(h.average||0),0)/history.length) : 0;

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Profile Hero */}
        <div className="rounded-3xl p-8 text-white flex items-center gap-6 flex-wrap relative overflow-hidden"
          style={{background:"linear-gradient(135deg,rgba(253,164,175,0.85),rgba(249,168,212,0.78),rgba(253,186,116,0.72))",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.28)",boxShadow:"0 20px 60px rgba(253,164,175,0.35)"}}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2"/>
          <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center text-3xl font-black border-4 border-white/40 shrink-0">{initials}</div>
          <div>
            <div className="font-black text-xl">{user?.name}</div>
            <div className="text-white/75 text-sm mt-0.5">{user?.email}</div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${aiEnabled?"bg-white/25 border-white/40":"bg-white/15 border-white/25"}`}>{aiEnabled?"AI Mode":"Private"}</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 border border-white/25">{calcStreak(history)} day streak</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 border border-white/25">{earnedBadges.length} badges</span>
            </div>
          </div>
        </div>

        {message && <div className="bg-green-50/70 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm font-semibold animate-fade-in">{message}</div>}

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["settings","history","badges"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer
                ${tab===t?"bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-md":"bg-white/35 border-rose-100/50 text-gray-600 hover:bg-white/55"}`}>
              {t==="settings"?"Settings":t==="history"?"Activity History":"Badges"}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {tab==="settings"&&(
          <div className="flex flex-col gap-4">
            {/* AI Settings */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-5">
                <div><h2 className="font-bold text-gray-800">🤖 AI Insights</h2><p className="text-xs text-gray-500 mt-1">Control whether the chatbot uses your DASS results.</p></div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${aiEnabled?"bg-rose-100/60 text-rose-600":"bg-gray-100/60 text-gray-500"}`}>{aiEnabled?"Enabled":"Disabled"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/20 overflow-hidden">
                <div style={{flex:1,minWidth:0}}>
                  <div className="font-semibold text-sm text-gray-800">Personalised AI Support</div>
                  <div className="text-xs text-gray-500 mt-0.5">Your DASS results inform the chatbot's responses.</div>
                </div>
                <button id="toggle-ai-consent" onClick={()=>setModal(true)}
                  className="relative shrink-0 w-12 h-6 rounded-full border-none cursor-pointer transition-all duration-300"
                  style={{background:aiEnabled?"linear-gradient(90deg,#f472b6,#a78bfa)":"#d1d5db"}}>
                  <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300" style={{transform:aiEnabled?"translateX(24px)":"translateX(2px)"}}/>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 bg-white/30 rounded-xl p-3">
                {aiEnabled?"✅ AI mode: Your chatbot references your assessment & mood logs.":"🔒 Private mode: No personal context used in chatbot responses."}
              </p>
            </div>
            {/* Account */}
            <div className="glass-card p-6">
              <h2 className="font-bold text-gray-800 mb-4">⚙️ Account</h2>
              {[["Name",user?.name],["Email",user?.email],["DASS Assessment","✅ Completed"],["AI Consent",aiEnabled?"Enabled":"Disabled"]].map(([l,v])=>(
                <div key={l as string} className="flex justify-between items-center py-2.5 border-b border-white/20 text-sm">
                  <span className="text-gray-500 font-medium">{l}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
              <button id="profile-logout" onClick={logout}
                className="mt-5 px-5 py-2 rounded-full text-sm font-semibold bg-red-100/50 text-red-500 border border-red-200/50 hover:bg-red-100 transition-colors cursor-pointer">
                🚪 Sign out
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {tab==="history"&&(
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              {[["Sessions",history.length,"from-rose-300 to-pink-300"],["Avg Wellness",`${avgWellness}%`,"from-amber-300 to-orange-300"],["Active Days",uniqueDays,"from-emerald-300 to-teal-300"]].map(([l,v,g])=>(
                <div key={l as string} className="glass-card p-4 text-center">
                  <div className={`text-2xl font-black bg-gradient-to-r ${g} bg-clip-text text-transparent`}>{v}</div>
                  <div className="text-xs text-gray-500 mt-1">{l}</div>
                </div>
              ))}
            </div>
            {history.length===0?(
              <div className="glass-card p-12 text-center"><div className="text-5xl mb-3">🌱</div><p className="text-gray-500 text-sm">No activity history yet. Complete an activity to see your progress!</p></div>
            ):(
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-800 mb-4">📋 All Sessions</h2>
                <div className="flex flex-col gap-2">
                  {history.map((s,i)=>(
                    <div key={i} className="flex justify-between items-center py-3 px-4 bg-white/30 rounded-xl">
                      <div><div className="font-semibold text-gray-800 text-sm">{s.title}</div><div className="text-xs text-gray-400 mt-0.5">{new Date(s.date).toLocaleString()}</div></div>
                      <div className={`font-black text-base ${s.average>=70?"text-green-500":s.average>=40?"text-amber-500":"text-red-500"}`}>{s.average}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Badges Tab */}
        {tab==="badges"&&(
          <div className="flex flex-col gap-5">
            {earnedBadges.length>0&&(
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-800 mb-4">✅ Earned Badges ({earnedBadges.length})</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {earnedBadges.map(b=>(
                    <div key={b.id} className="bg-white/40 border border-white/30 rounded-2xl p-4 flex flex-col items-center text-center hover:scale-105 transition-transform">
                      <span className="text-4xl mb-2">{b.emoji}</span>
                      <div className="font-bold text-gray-800 text-xs">{b.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {lockedBadges.length>0&&(
              <div className="glass-card p-6">
                <h2 className="font-bold text-gray-800 mb-4">🔒 Locked Badges ({lockedBadges.length})</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {lockedBadges.map(b=>(
                    <div key={b.id} className="bg-white/20 border border-white/20 rounded-2xl p-4 flex flex-col items-center text-center opacity-50">
                      <span className="text-4xl mb-2">{b.emoji}</span>
                      <div className="font-bold text-gray-600 text-xs">{b.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{b.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {earnedBadges.length===0&&<div className="glass-card p-12 text-center"><div className="text-5xl mb-3">🏅</div><p className="text-gray-500 text-sm">Complete activities to earn your first badge!</p></div>}
          </div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsentModal&&(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=>setModal(false)}>
          <div className="glass-card-strong p-8 max-w-md w-full animate-fade-in" onClick={e=>e.stopPropagation()}>
            <h2 className="font-black text-gray-800 text-xl mb-2">{aiEnabled?"Disable AI Insights?":"Enable AI Insights?"}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{aiEnabled?"Your chatbot will no longer reference your DASS results or personal history.":"Your chatbot will use your DASS assessment and mood logs to provide personalised support."}</p>
            <div className="flex gap-3">
              <button onClick={()=>setModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={()=>handleToggleConsent(!aiEnabled)} disabled={toggling}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-full text-white border-none cursor-pointer transition-all ${aiEnabled?"bg-red-400 hover:bg-red-500":"btn-primary"}`}>
                {toggling?"Saving…":aiEnabled?"Yes, disable":"Yes, enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
