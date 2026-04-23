import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function ActivityResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const activity = state?.activity;
  const score    = state?.score ?? null;
  const barsRef  = useRef<HTMLDivElement>(null);

  if (!activity) return null;

  function rand(base: number) {
    return Math.max(40, Math.min(95, base + Math.floor(Math.random() * 15 - 7)));
  }

  function generateMetrics() {
    switch (activity.type) {
      case "breathing":
        return { title:"Your breathing rhythm stabilized", insight:"Slow breathing activates the parasympathetic nervous system and reduces cortisol.", stats:[{label:"Calmness",value:rand(70)},{label:"Heart Rate Balance",value:rand(65)},{label:"Tension Reduced",value:rand(60)}] };
      case "meditation":
        return { title:"Your mind entered a focused state", insight:"Short mindfulness sessions improve attention span and emotional regulation.", stats:[{label:"Focus",value:rand(80)},{label:"Mental Clarity",value:rand(75)},{label:"Thought Control",value:rand(65)}] };
      case "bodyscan":
        return { title:"Body relaxation achieved", insight:"Body scanning improves interoception and reduces physical stress signals.", stats:[{label:"Muscle Relaxation",value:rand(85)},{label:"Body Awareness",value:rand(70)},{label:"Stress Release",value:rand(65)}] };
      case "grounding":
        return { title:"Anxiety reduced successfully", insight:"Grounding interrupts anxious thought loops by reconnecting senses to the present moment.", stats:[{label:"Anxiety Relief",value:rand(75)},{label:"Present-Moment Awareness",value:rand(80)},{label:"Emotional Steadiness",value:rand(65)}] };
      case "game-focus":
        return { title:"Focus session complete!", insight:"Cognitive games strengthen prefrontal cortex circuits associated with sustained attention.", stats:[{label:"Concentration",value:rand(85)},{label:"Reaction Speed",value:rand(75)},{label:"Mental Sharpness",value:rand(80)}] };
      case "game-memory":
        return { title:"Memory sharpness tested!", insight:"Memory exercises build neuroplasticity and slow cognitive decline.", stats:[{label:"Memory Recall",value:rand(80)},{label:"Pattern Recognition",value:rand(75)},{label:"Focus",value:rand(70)}] };
      case "digital-detox":
        return { title:"Tech-free time achieved!", insight:"Disconnecting from screens reduces cortisol and improves sleep quality.", stats:[{label:"Mind Rest",value:rand(85)},{label:"Eye Strain Reduced",value:rand(90)},{label:"Clarity",value:rand(75)}] };
      case "letter-writing":
        return { title:"Emotions processed through writing", insight:"Writing unsent letters externalises difficult feelings and fosters emotional clarity.", stats:[{label:"Emotional Release",value:rand(80)},{label:"Perspective Gained",value:rand(75)},{label:"Inner Peace",value:rand(70)}] };
      case "three-good-things":
        return { title:"Gratitude practice complete", insight:"Noting positive events rewires your brain toward optimism over time.", stats:[{label:"Gratitude",value:rand(90)},{label:"Optimism",value:rand(80)},{label:"Life Satisfaction",value:rand(85)}] };
      default:
        return { title:"Activity complete!", insight:"Great work — every step toward wellness counts.", stats:[{label:"Wellness",value:rand(70)},{label:"Engagement",value:rand(75)},{label:"Progress",value:rand(65)}] };
    }
  }

  const result = generateMetrics();
  const average = Math.round(result.stats.reduce((s,m) => s+m.value, 0) / result.stats.length);

  function moodEmoji(avg: number) {
    if (avg >= 80) return "🌟";
    if (avg >= 65) return "😊";
    if (avg >= 50) return "😌";
    return "🌱";
  }

  useEffect(() => {
    const stored = localStorage.getItem(`mindcare_history_${user?.id}`);
    const history = stored ? JSON.parse(stored) : [];
    history.unshift({ type:activity.type, title:activity.title, average, date:new Date().toISOString() });
    localStorage.setItem(`mindcare_history_${user?.id}`, JSON.stringify(history.slice(0,100)));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Floating bg blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-rose-200/35 blur-3xl animate-float"/>
        <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 rounded-full bg-pink-200/30 blur-3xl animate-float-2"/>
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6 animate-fade-in">

        {/* Success badge */}
        <div className="text-6xl emoji-bounce">{moodEmoji(average)}</div>

        {/* Score hero card */}
        <div className="glass-card-strong w-full p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">Session Complete</p>
          <h1 className="text-2xl font-black text-gray-800 leading-snug">{result.title}</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{result.insight}</p>

          {score !== null && (
            <div className="mt-4 inline-block px-6 py-2 rounded-full bg-gradient-to-r from-rose-300 to-pink-300 text-white font-black text-lg shadow-md">
              Score: {score}
            </div>
          )}

          {/* Wellness ring */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9155" fill="none"
                  stroke="url(#resultGrad)"
                  strokeWidth="3"
                  strokeDasharray={`${average} ${100 - average}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 1.2s ease" }}
                />
                <defs>
                  <linearGradient id="resultGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fda4af"/>
                    <stop offset="100%" stopColor="#f9a8d4"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-rose-500">{average}%</span>
                <span className="text-xs text-gray-400">wellness</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="glass-card w-full p-6">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Session Breakdown</h2>
          <div className="flex flex-col gap-4" ref={barsRef}>
            {result.stats.map(s => (
              <div key={s.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700">{s.label}</span>
                  <span className="text-sm font-bold text-rose-500">{s.value}%</span>
                </div>
                <div className="h-2.5 bg-white/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width:`${s.value}%`, background:"linear-gradient(90deg,#fda4af,#f9a8d4)", transition:"width 1.2s ease" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <Link to="/activities" className="btn-secondary flex-1 py-3 text-sm text-center">
            More Activities
          </Link>
          <Link to="/dashboard" className="btn-primary flex-1 py-3 text-sm text-center no-underline">
            Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}
