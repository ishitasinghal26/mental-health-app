import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";
import { apiClient } from "../services/apiClient";
import { calculateStreak } from "../utils/streak";
import DassReportModal from "../components/dashboard/DassReportModal";

const MOTIVATIONAL_QUOTES = [
  { q: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or anxious.", a: "Lori Deschene" },
  { q: "This too shall pass. Whatever you are going through right now will not last forever.", a: "Ancient Proverb" },
  { q: "You are allowed to be both a masterpiece and a work in progress simultaneously.", a: "Sophia Bush" },
  { q: "Healing is not linear. Some days you will feel better and some days you will feel worse. And that's okay.", a: "Unknown" },
  { q: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", a: "Max Ehrmann" },
  { q: "Your present circumstances don't determine where you can go; they merely determine where you start.", a: "Nido Qubein" },
  { q: "Rest is not idleness — lying on the grass under the trees on a summer's day is by no means a waste of time.", a: "John Lubbock" },
];

const RECOMMENDED_ACTIVITIES: Record<string, { id:number; title:string; emoji:string; reason:string; type:string }[]> = {
  normal:          [{ id:5, title:"Calm Focus Game",    emoji:"🎯", reason:"Keep your mental sharpness up",           type:"game-focus"        }, { id:2, title:"5-Min Meditation", emoji:"🧘", reason:"Maintain your inner equilibrium",     type:"meditation"        }, { id:9, title:"3 Good Things",   emoji:"🌟", reason:"Daily gratitude builds lasting happiness", type:"three-good-things" }],
  mild:            [{ id:1, title:"Deep Breathing",     emoji:"💨", reason:"Reduces mild stress quickly",             type:"breathing"         }, { id:9, title:"3 Good Things",   emoji:"🌟", reason:"Reframe your focus positively",       type:"three-good-things" }, { id:7, title:"Digital Detox",   emoji:"📵", reason:"Reduce digital noise",                    type:"digital-detox"     }],
  moderate:        [{ id:1, title:"Deep Breathing",     emoji:"💨", reason:"Immediate nervous system reset",          type:"breathing"         }, { id:4, title:"5-4-3-2-1 Grounding", emoji:"🌱", reason:"Break the anxiety cycle",        type:"grounding"         }, { id:8, title:"Write a Letter",  emoji:"✒️", reason:"Release what's building inside",          type:"letter-writing"    }],
  severe:          [{ id:4, title:"Grounding Exercise", emoji:"🌱", reason:"Anchor yourself to the present moment",   type:"grounding"         }, { id:3, title:"Body Scan",       emoji:"🧘", reason:"Release deep physical tension",       type:"bodyscan"          }, { id:8, title:"Write a Letter",  emoji:"✒️", reason:"Get difficult feelings out safely",        type:"letter-writing"    }],
  extremely_severe:[{ id:1, title:"Deep Breathing",     emoji:"💨", reason:"Start here — one breath at a time",       type:"breathing"         }, { id:4, title:"Grounding Exercise", emoji:"🌱", reason:"Reconnect with the present",       type:"grounding"         }, { id:3, title:"Body Scan",       emoji:"🧘", reason:"Gentle relief for overwhelming stress",    type:"bodyscan"          }],
};

type AssessmentSummary = { summary:{ depression:string; anxiety:string; stress:string }; overallSeverity:string } | null;
type Session = { type:string; title:string; average:number; date:string };

const SEVERITY_COLOR: Record<string,string> = { normal:"#10b981", mild:"#f59e0b", moderate:"#f97316", severe:"#ef4444", extremely_severe:"#e11d48" };

const JOURNAL_PROMPTS = [
  "What's been the heaviest thought on your mind lately?",
  "Is there something you wish you could say to someone but haven't?",
  "What are you holding onto that you might need to let go of?",
  "How did you treat yourself today — and was that fair?",
  "What does your body feel right now, and what might it be trying to tell you?",
  "If your feelings could speak, what would they say?",
  "What's one thing that felt hard today, and one thing that helped?",
];

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const aiEnabled  = user?.ai_consent === true;
  const firstName  = user?.name?.split(" ")[0] || "there";

  const [assessment,   setAssessment]   = useState<AssessmentSummary>(null);
  const [streak,       setStreak]       = useState(0);
  const [moodCount,    setMoodCount]    = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [avgWellness,  setAvgWellness]  = useState(0);
  const [showReport,   setShowReport]   = useState(false);
  const [moodChart,    setMoodChart]    = useState<{ date:string; intensity:number }[]>([]);
  const [retaking,     setRetaking]     = useState(false);

  const todayQuote = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  useEffect(() => {
    apiClient.get("/assessment/latest")
      .then(res => { if (res.data?.summary) setAssessment(res.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(`mindcare_history_${user?.id}`);
    if (!stored) return;
    const history: Session[] = JSON.parse(stored);
    if (!history.length) return;
    setStreak(calculateStreak(history));
    setAvgWellness(Math.round(history.reduce((s,h) => s+(h.average||0), 0) / history.length));
  }, [user?.id]);

  useEffect(() => {
    apiClient.get("/moods")
      .then(res => {
        const all = res.data || [];
        setMoodCount(all.length);
        const last7 = all.slice(0, 7).reverse();
        setMoodChart(last7.map((m: any) => ({
          date: new Date(m.created_at).toLocaleDateString("en", { month:"short", day:"numeric" }),
          intensity: m.intensity,
        })));
        if (all.length) {
          const moodAvg = Math.round((all.slice(0,10).reduce((s:number, m:any) => s+(m.intensity||3), 0) / Math.min(all.length, 10)) / 5 * 100);
          setAvgWellness(prev => Math.round((prev + moodAvg) / 2));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiClient.get("/journals")
      .then(res => setJournalCount((res.data||[]).length))
      .catch(() => {});
  }, []);

  // Direct retake — resets assessment and navigates
  async function handleRetake() {
    if (!window.confirm("This will reset your current DASS results. You'll retake the survey. Continue?")) return;
    setRetaking(true);
    try {
      await apiClient.post("/assessment/reset");
      await refreshUser();
      navigate("/assessment");
    } catch {
      alert("Failed to reset. Please try again.");
    } finally {
      setRetaking(false);
    }
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">

        {/* Hero Card — warm peach/rose gradient */}
        <div className="rounded-3xl p-8 text-white relative overflow-hidden"
          style={{ background:"linear-gradient(135deg, rgba(253,164,175,0.85), rgba(249,168,212,0.78), rgba(253,186,116,0.72))", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.28)", boxShadow:"0 20px 60px rgba(253,164,175,0.35)" }}>
          <div className="absolute top-0 right-0 w-52 h-52 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
          <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-white/8 translate-y-1/2 -translate-x-1/2 pointer-events-none"/>
          <p className="text-white/70 text-sm font-medium mb-1">{new Date().toLocaleDateString("en", { weekday:"long", month:"long", day:"numeric" })}</p>
          <h1 className="text-3xl font-black mb-4">{greeting}, {firstName}</h1>
          <div className="flex items-start gap-3 bg-white/18 rounded-2xl p-4 max-w-xl backdrop-blur-sm">
            <span className="text-lg shrink-0 opacity-80">"</span>
            <div>
              <p className="italic text-white/92 text-sm leading-relaxed">{todayQuote.q}</p>
              <p className="text-white/60 text-xs mt-1.5">— {todayQuote.a}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:"🔥", label:"Day Streak",       value:`${streak}`, unit:"days",   grad:"from-orange-200 to-rose-200",   text:"text-orange-600" },
            { icon:"💭", label:"Mood Entries",      value:`${moodCount}`,  unit:"total", grad:"from-pink-200 to-rose-200",     text:"text-rose-600"   },
            { icon:"📓", label:"Journal Entries",   value:`${journalCount}`,unit:"total",grad:"from-peach-100 to-amber-100",  text:"text-amber-600"  },
            { icon:"✨", label:"Wellness Score",    value:`${avgWellness}`,unit:"%",    grad:"from-emerald-100 to-teal-100",  text:"text-emerald-600"},
          ].map(s => (
            <div key={s.label} className="glass-card p-5 flex flex-col gap-2 cursor-default">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-xl shadow-sm`}>{s.icon}</div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${s.text}`}>{s.value}</span>
                <span className="text-xs text-gray-400 font-medium">{s.unit}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Journal Prompt */}
        <JournalPromptCard />

        {/* Two Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* DASS Summary */}
          {assessment ? (
            <div className="glass-card p-6">
              <div className="mb-4">
                <h2 className="font-bold text-gray-800 text-base">Mental Health Assessment</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Overall severity:{" "}
                  <strong style={{ color:SEVERITY_COLOR[assessment.overallSeverity] }}>
                    {assessment.overallSeverity?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                  </strong>
                </p>
              </div>

              {(["depression","anxiety","stress"] as const).map(key => {
                const level = assessment.summary[key];
                const color = SEVERITY_COLOR[level] || "#6b7280";
                const widths: Record<string,string> = { normal:"20%", mild:"40%", moderate:"60%", severe:"80%", extremely_severe:"100%" };
                return (
                  <div key={key} className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-gray-600 capitalize">{key}</span>
                      <span className="font-bold capitalize" style={{ color }}>{level?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</span>
                    </div>
                    <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width:widths[level]||"0%", background:color }}/>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2 mt-5 flex-wrap">
                <button
                  onClick={() => setShowReport(true)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  View Full Report
                </button>
                <button
                  onClick={handleRetake}
                  disabled={retaking}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {retaking ? "Resetting…" : "Retake Survey"}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 text-center min-h-48">
              <div className="text-5xl emoji-pulse">🌸</div>
              <div>
                <h2 className="font-bold text-gray-700 text-base">No Assessment Yet</h2>
                <p className="text-xs text-gray-500 mt-1">Complete the DASS-21 to get personalised insights</p>
              </div>
              <Link to="/assessment" className="btn-primary text-sm px-5 py-2">Take Assessment</Link>
            </div>
          )}

          {/* Recommended Activities */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-gray-800 text-base">Recommended for You</h2>
                <p className="text-xs text-gray-500 mt-0.5">Tailored to your results</p>
              </div>
              <Link to="/recommendations" className="text-xs text-rose-500 font-semibold hover:underline">See all →</Link>
            </div>
            {assessment ? (
              <div className="flex flex-col gap-2">
                {(RECOMMENDED_ACTIVITIES[assessment.overallSeverity] || RECOMMENDED_ACTIVITIES.normal).map(act => (
                  <Link
                    key={act.id}
                    to="/activity-player"
                    state={{ activity:{ id:act.id, title:act.title, type:act.type, duration:5, difficulty:"Beginner", description:act.reason, category:"Wellness", ui:"guided" } }}
                    className="flex items-center gap-3 p-3 bg-white/30 rounded-xl border border-rose-100/40 hover:bg-white/50 hover:border-rose-200/50 transition-all group"
                  >
                    <span className="text-2xl emoji-bounce">{act.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm">{act.title}</div>
                      <div className="text-xs text-gray-500 truncate">{act.reason}</div>
                    </div>
                    <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform shrink-0">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8 text-sm">
                Complete the DASS survey to get personalised activity suggestions.
              </div>
            )}
          </div>
        </div>

        {/* Mood Chart */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-gray-800 text-base">Mood Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Your mood intensity over the last 7 entries</p>
            </div>
            <Link to="/mood" className="text-xs text-rose-500 font-semibold hover:underline">Log mood →</Link>
          </div>

          {moodChart.length > 1 ? (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,200,210,0.4)" />
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:"#9ca3af" }} />
                  <YAxis domain={[1,5]} ticks={[1,2,3,4,5]} tick={{ fontSize:10, fill:"#9ca3af" }} width={22} />
                  <Tooltip formatter={(v:any) => [`${v}/5`, "Mood Intensity"]} contentStyle={{ borderRadius:12, background:"rgba(255,255,255,0.92)", border:"1px solid rgba(255,210,215,0.5)", fontSize:12 }} />
                  <Line type="monotone" dataKey="intensity" stroke="url(#warmGrad)" strokeWidth={3} dot={{ r:5, fill:"#fda4af" }} activeDot={{ r:7 }} />
                  <defs>
                    <linearGradient id="warmGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fda4af" />
                      <stop offset="50%" stopColor="#f9a8d4" />
                      <stop offset="100%" stopColor="#fdba74" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-3xl emoji-wiggle">📊</span>
              <span className="text-sm">Log a few mood entries to see your wellness trend</span>
            </div>
          )}

          {moodChart.length > 0 && (
            <div className="mt-4 bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-sm text-gray-600">
              <span className="font-semibold text-rose-600">Insight: </span>
              {(() => {
                const avg = moodChart.reduce((s,m) => s+m.intensity, 0) / moodChart.length;
                if (avg >= 4) return "You're doing great — try a gratitude practice to stay elevated!";
                if (avg >= 3) return "A 5-min meditation or journaling session could help balance your mood.";
                if (avg >= 2) return "Try deep breathing or grounding — your body needs a gentle reset.";
                return "Start with deep breathing. You're going through a tough time — be gentle with yourself.";
              })()}
            </div>
          )}
        </div>

      </div>
    </div>

    {showReport && <DassReportModal onClose={() => setShowReport(false)} />}
    </>
  );
}

function JournalPromptCard() {
  const today  = new Date().toISOString().slice(0, 10);
  const LS_KEY = `mindkare_journal_prompt_${today}`;
  const [answer, setAnswer] = useState("");
  const [saved,  setSaved]  = useState(() => localStorage.getItem(LS_KEY) === "done");
  const prompt = JOURNAL_PROMPTS[new Date().getDate() % JOURNAL_PROMPTS.length];

  return (
    <div className="glass-card p-6" style={{ background:"rgba(255,241,242,0.45)", borderColor:"rgba(253,164,175,0.35)" }}>
      <div className="mb-4">
        <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Daily Reflection</p>
        <h2 className="font-bold text-gray-800 text-base leading-snug">{prompt}</h2>
        <p className="text-xs text-gray-400 mt-1">No rules. No judgement. Just you.</p>
      </div>

      {saved ? (
        <div className="bg-white/50 border border-rose-100 rounded-2xl p-5 text-center">
          <div className="text-4xl mb-2 emoji-pulse">🌸</div>
          <div className="font-semibold text-rose-700 text-sm">Thank you for sharing. You're seen — and you matter.</div>
        </div>
      ) : (
        <>
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write whatever comes to mind..."
            rows={3}
            className="glass-input resize-y min-h-[80px] text-sm"
          />
          <button
            disabled={!answer.trim()}
            onClick={() => { if (answer.trim()) { localStorage.setItem(LS_KEY, "done"); setSaved(true); } }}
            className="btn-primary mt-3 px-5 py-2 text-sm"
          >
            Done writing
          </button>
        </>
      )}
    </div>
  );
}
