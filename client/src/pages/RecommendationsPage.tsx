import { useEffect, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";
import { apiClient } from "../services/apiClient";

type Assessment = { summary:{ depression:string; anxiety:string; stress:string }; overallSeverity:string; lifestyle?:{ sleepRisk:string; screenRisk:string; stressSelf:string } }|null;
type Rec = { icon:string; title:string; body:string; tag:string };

const RECS: Record<string,Record<string,Rec[]>> = {
  depression:{
    normal:[{icon:"🌅",title:"Maintain your routine",body:"Keep doing what's working. A consistent sleep, eat, move rhythm keeps mood stable and resilient.",tag:"Lifestyle"},{icon:"🎨",title:"Creative expression",body:"Art, music, writing — creating anything activates reward pathways. Spend 15 min/day on a creative hobby.",tag:"Wellness"}],
    mild:[{icon:"🚶",title:"Daily movement",body:"30 min of brisk walking raises endorphins and serotonin as effectively as mild antidepressants. Start today.",tag:"Physical"},{icon:"🌞",title:"Sunlight exposure",body:"Get 15–20 minutes of morning sunlight. It resets your circadian rhythm and lifts mood naturally.",tag:"Lifestyle"},{icon:"📓",title:"Gratitude journaling",body:"Write 3 specific things you're grateful for each morning. Specificity matters more than length.",tag:"CBT"}],
    moderate:[{icon:"🧠",title:"Behavioural Activation",body:"Depression reduces motivation. Schedule one small pleasurable activity daily even when you don't feel like it.",tag:"CBT"},{icon:"🤝",title:"Social connection",body:"Isolation deepens depression. Reach out to one person today — even a text counts.",tag:"Social"},{icon:"😴",title:"Sleep hygiene",body:"Set a fixed wake time. Avoid screens 1 hr before bed. Breaking sleep patterns helps mood.",tag:"Lifestyle"},{icon:"🩺",title:"Consider professional support",body:"Moderate depression responds very well to therapy (especially CBT). Consider speaking to a therapist.",tag:"Professional"}],
    severe:[{icon:"🆘",title:"Please seek help now",body:"Severe depression is serious but very treatable. Please speak to a mental health professional as soon as possible.",tag:"Urgent"},{icon:"📞",title:"Helpline",body:"iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 | Available 24/7.",tag:"Crisis"},{icon:"🧪",title:"Structured Therapy",body:"Evidence-based therapies like CBT, DBT, and IPT have strong results for severe depression.",tag:"Professional"}],
    extremely_severe:[{icon:"🚨",title:"Immediate support needed",body:"Please do not face this alone. Reach out to someone you trust or a crisis line right now. You matter.",tag:"Crisis"},{icon:"📞",title:"India Crisis Line",body:"iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",tag:"Crisis"}],
  },
  anxiety:{
    normal:[{icon:"🫁",title:"Box breathing",body:"Breathe in 4s → hold 4s → out 4s → hold 4s. Practice daily to keep the nervous system regulated.",tag:"Breathing"}],
    mild:[{icon:"🫁",title:"4-7-8 breathing",body:"Inhale 4 counts, hold 7, exhale 8. Do 3-4 cycles whenever anxiety rises.",tag:"Breathing"},{icon:"🌿",title:"5-4-3-2-1 grounding",body:"Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",tag:"Grounding"},{icon:"☕",title:"Limit caffeine & alcohol",body:"Both amplify anxiety symptoms. Reduce coffee to 1 cup before noon and alcohol to weekends.",tag:"Lifestyle"}],
    moderate:[{icon:"🧘",title:"Progressive Muscle Relaxation",body:"Tense and release each muscle group from toes to head. 15 min/day reduces chronic anxiety.",tag:"Mindfulness"},{icon:"📝",title:"Worry journaling",body:"Write down what you're worried about + what you can control + one small action.",tag:"CBT"},{icon:"🚫",title:"Reduce news/social media",body:"Limit news to 20 min/day. Constant information overload feeds anxiety loops.",tag:"Digital Wellness"}],
    severe:[{icon:"🩺",title:"Seek professional help",body:"Severe anxiety responds to CBT with Exposure Therapy. A psychologist can guide you safely.",tag:"Professional"},{icon:"📞",title:"Crisis support",body:"iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",tag:"Crisis"}],
    extremely_severe:[{icon:"🚨",title:"Please act now",body:"Extremely severe anxiety can be debilitating. Contact a mental health professional or emergency service.",tag:"Crisis"},{icon:"📞",title:"India Crisis Line",body:"iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",tag:"Crisis"}],
  },
  stress:{
    normal:[{icon:"🧘",title:"Preventive mindfulness",body:"10 minutes of mindfulness daily — even when you feel fine — builds stress resilience.",tag:"Mindfulness"}],
    mild:[{icon:"🎵",title:"Music & movement",body:"Put on music you love and move. Dance, walk, stretch — even 10 min shifts stress hormones.",tag:"Physical"},{icon:"📅",title:"Time-block your day",body:"Unstructured time + too many tasks = stress. Pick 3 priorities each morning and time-block them.",tag:"Productivity"},{icon:"🌳",title:"Nature exposure",body:"Even 20 min in green spaces reduces cortisol. Walk in a park, sit near a window.",tag:"Lifestyle"}],
    moderate:[{icon:"🚫",title:"Learn to say no",body:"Overcommitment drives moderate stress. Practice assertive but kind refusals. Your energy is finite.",tag:"Boundaries"},{icon:"🛁",title:"Recovery rituals",body:"Design a 30-min recovery ritual after work: shower, tea, no phone, gentle movement.",tag:"Lifestyle"},{icon:"💬",title:"Talk it out",body:"Verbalising stress reduces it significantly. Talk to a friend, family member, or therapist.",tag:"Social"}],
    severe:[{icon:"🩺",title:"Professional support",body:"Chronic severe stress leads to burnout. A therapist can give you practical coping structures.",tag:"Professional"},{icon:"😴",title:"Prioritise recovery sleep",body:"Severe stress depletes the body. 8 hrs of sleep is recovery, not laziness.",tag:"Physical"}],
    extremely_severe:[{icon:"🚨",title:"Burnout risk is high",body:"Please speak to a doctor or therapist immediately. Extreme stress affects physical health and cognition.",tag:"Urgent"},{icon:"📞",title:"India Crisis Line",body:"iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345",tag:"Crisis"}],
  },
};

const LIFESTYLE_RECS: Rec[] = [
  {icon:"😴",title:"Sleep 7-9 hours",body:"Sleep is when the brain processes emotions and clears stress hormones. Non-negotiable for mental health.",tag:"Sleep"},
  {icon:"📱",title:"Digital detox",body:"Take one full hour before bed with no screens. Replace it with a book, conversation, or stretching.",tag:"Digital Wellness"},
  {icon:"🏃",title:"Move your body",body:"150 min/week of moderate movement is the single most evidence-backed mental health intervention.",tag:"Physical"},
  {icon:"🥗",title:"Gut-brain connection",body:"Eat fermented foods, omega-3s, and reduce ultra-processed food. The gut produces 90% of serotonin.",tag:"Nutrition"},
];

const TAG_CLS: Record<string,string> = {
  Lifestyle:"bg-green-100/60 text-green-700", Physical:"bg-orange-100/60 text-orange-700",
  CBT:"bg-indigo-100/60 text-indigo-700", Mindfulness:"bg-pink-100/60 text-pink-600",
  Social:"bg-cyan-100/60 text-cyan-700", Professional:"bg-blue-100/60 text-blue-700",
  Crisis:"bg-red-100/60 text-red-700", Urgent:"bg-red-100/60 text-red-700",
  Breathing:"bg-sky-100/60 text-sky-700", Grounding:"bg-emerald-100/60 text-emerald-700",
  "Digital Wellness":"bg-gray-100/60 text-gray-700", Boundaries:"bg-violet-100/60 text-violet-700",
  Productivity:"bg-amber-100/60 text-amber-700", Wellness:"bg-indigo-100/60 text-indigo-700",
  Sleep:"bg-blue-100/60 text-blue-700", Nutrition:"bg-green-100/60 text-green-700",
};

const SEVERITY_COLOR: Record<string,string> = { normal:"#10b981", mild:"#f59e0b", moderate:"#f97316", severe:"#ef4444", extremely_severe:"#7c3aed" };

function getSeverityRecs(domain:"depression"|"anxiety"|"stress",level:string):Rec[] {
  const d=RECS[domain]; if(!d)return [];
  const levels=["normal","mild","moderate","severe","extremely_severe"];
  const idx=levels.indexOf(level);
  for(let i=idx;i>=0;i--){if(d[levels[i]]?.length)return d[levels[i]];}
  return d["normal"]||[];
}

export default function RecommendationsPage() {
  const [assessment,setAssessment]=useState<Assessment>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    apiClient.get("/assessment/latest").then(r=>{if(r.data?.summary)setAssessment(r.data);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const dep=assessment?.summary.depression||"normal";
  const anx=assessment?.summary.anxiety||"normal";
  const str=assessment?.summary.stress||"normal";
  const overall=assessment?.overallSeverity||"normal";

  const allRecs=[...getSeverityRecs("depression",dep),...getSeverityRecs("anxiety",anx),...getSeverityRecs("stress",str)];
  const seen=new Set<string>();
  const uniqueRecs=allRecs.filter(r=>{if(seen.has(r.title))return false;seen.add(r.title);return true;});

  return (
    <div className="min-h-screen">
      <AppNavbar />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">💡 Your Personalised Recommendations</h1>
            <p className="text-gray-500 mt-1">Based on your DASS-21 results — practical steps to improve your mental wellness.</p>
          </div>
          {assessment && (
            <div className="flex gap-2 flex-wrap">
              {(["depression","anxiety","stress"] as const).map(d=>(
                <span key={d} className="text-xs font-bold px-3 py-1 rounded-full border"
                  style={{ background:(SEVERITY_COLOR[assessment.summary[d]]||"#6b7280")+"18", color:SEVERITY_COLOR[assessment.summary[d]]||"#6b7280", borderColor:(SEVERITY_COLOR[assessment.summary[d]]||"#6b7280")+"40" }}>
                  {d.charAt(0).toUpperCase()+d.slice(1)}: {assessment.summary[d]?.replace(/_/g," ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading your recommendations…</div>
        ) : !assessment ? (
          <div className="glass-card p-12 text-center flex flex-col items-center gap-4 text-gray-400">
            <span className="text-5xl">📋</span>
            <p>Complete your DASS-21 assessment first to get personalised recommendations.</p>
            <a href="/assessment" className="btn-primary px-6 py-2.5 no-underline text-sm">Take Assessment →</a>
          </div>
        ) : (
          <>
            {/* Status banner */}
            <div className="glass-card p-5 flex items-center gap-4 border-l-4"
              style={{ borderColor:SEVERITY_COLOR[overall] }}>
              <span className="text-3xl shrink-0">{overall==="normal"?"🌟":overall==="mild"?"🌤️":overall==="moderate"?"⚠️":"🚨"}</span>
              <div>
                <div className="font-black text-gray-800">Overall Level: {overall.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {overall==="normal"&&"You're doing well! These recommendations will help you maintain and grow."}
                  {overall==="mild"&&"You have some stress/mood concerns. Small consistent changes will make a big difference."}
                  {overall==="moderate"&&"Your scores show significant mental health challenges. Prioritise these recommendations."}
                  {(overall==="severe"||overall==="extremely_severe")&&"You are experiencing serious distress. Please seek professional support alongside these tips."}
                </div>
              </div>
            </div>

            {/* Domain sections */}
            {(["depression","anxiety","stress"] as const).map(domain => {
              const level=assessment.summary[domain];
              const recs=getSeverityRecs(domain,level);
              const color=SEVERITY_COLOR[level]||"#6b7280";
              return (
                <section key={domain}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{background:color}}/>
                    <h2 className="font-black text-gray-800 text-base">
                      {domain==="depression"?"😔 Depression":domain==="anxiety"?"😰 Anxiety":"😤 Stress"} — {level.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recs.map((r,i)=><RecCard key={i} rec={r}/>)}
                  </div>
                </section>
              );
            })}

            {/* Lifestyle */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-green-400 shrink-0"/>
                <h2 className="font-black text-gray-800 text-base">🌱 Universal Lifestyle Pillars</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {LIFESTYLE_RECS.map((r,i)=><RecCard key={i} rec={r}/>)}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
              ⚕️ <strong>Important:</strong> These recommendations are for informational purposes only and do not replace professional medical or psychological advice. If you are in distress, please consult a licensed mental health professional.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RecCard({rec}:{rec:Rec}) {
  const tagCls = TAG_CLS[rec.tag]||"bg-gray-100/60 text-gray-700";
  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200">
      <span className="text-3xl">{rec.icon}</span>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-gray-800 text-sm flex-1">{rec.title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${tagCls}`}>{rec.tag}</span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{rec.body}</p>
    </div>
  );
}
