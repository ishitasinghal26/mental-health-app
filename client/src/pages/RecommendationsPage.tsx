import React, { useEffect, useState } from "react";
import AppNavbar from "../components/navbar/AppNavbar";
import { apiClient } from "../services/apiClient";

type Assessment = {
  summary: { depression: string; anxiety: string; stress: string };
  overallSeverity: string;
  lifestyle?: { sleepRisk: string; screenRisk: string; stressSelf: string };
} | null;

/* ── Pre-written Recommendation Data ── */
type Rec = { icon: string; title: string; body: string; tag: string };

const RECS: Record<string, Record<string, Rec[]>> = {
  depression: {
    normal: [
      { icon: "🌅", title: "Maintain your routine", body: "Keep doing what's working. A consistent sleep, eat, move rhythm keeps mood stable and resilient.", tag: "Lifestyle" },
      { icon: "🎨", title: "Creative expression", body: "Art, music, writing — creating anything activates reward pathways. Spend 15 min/day on a creative hobby.", tag: "Wellness" },
    ],
    mild: [
      { icon: "🚶", title: "Daily movement", body: "30 min of brisk walking raises endorphins and serotonin as effectively as mild antidepressants. Start today.", tag: "Physical" },
      { icon: "🌞", title: "Sunlight exposure", body: "Get 15–20 minutes of morning sunlight. It resets your circadian rhythm and lifts mood naturally.", tag: "Lifestyle" },
      { icon: "📓", title: "Gratitude journaling", body: "Write 3 specific things you're grateful for each morning. Specificity matters more than length.", tag: "CBT" },
    ],
    moderate: [
      { icon: "🧠", title: "Behavioural Activation", body: "Depression reduces motivation. Schedule one small pleasurable activity daily even when you don't feel like it — action precedes motivation.", tag: "CBT" },
      { icon: "🤝", title: "Social connection", body: "Isolation deepens depression. Reach out to one person today — even a text counts.", tag: "Social" },
      { icon: "😴", title: "Sleep hygiene", body: "Set a fixed wake time. Avoid screens 1 hr before bed. Depression and poor sleep create a cycle — breaking sleep patterns helps mood.", tag: "Lifestyle" },
      { icon: "🩺", title: "Consider professional support", body: "Moderate depression responds very well to therapy (especially CBT). Consider speaking to a therapist on our Therapists page.", tag: "Professional" },
    ],
    severe: [
      { icon: "🆘", title: "Please seek help now", body: "Severe depression is serious but very treatable. Please speak to a mental health professional as soon as possible.", tag: "Urgent" },
      { icon: "📞", title: "Helpline", body: "iCall (India): 9152987821 | Vandrevala Foundation: 1860-2662-345 | Available 24/7.", tag: "Crisis" },
      { icon: "🧪", title: "Structured Therapy", body: "Evidence-based therapies like CBT, DBT, and IPT have strong results for severe depression. Ask your doctor about options.", tag: "Professional" },
    ],
    extremely_severe: [
      { icon: "🚨", title: "Immediate support needed", body: "Please do not face this alone. Reach out to someone you trust or a crisis line right now. You matter.", tag: "Crisis" },
      { icon: "📞", title: "India Crisis Line", body: "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 — available 24 hours.", tag: "Crisis" },
    ],
  },
  anxiety: {
    normal: [
      { icon: "🫁", title: "Box breathing", body: "Breathe in 4s → hold 4s → out 4s → hold 4s. Practice daily to keep the nervous system regulated.", tag: "Breathing" },
    ],
    mild: [
      { icon: "🫁", title: "4-7-8 breathing", body: "Inhale 4 counts, hold 7, exhale 8. Do 3-4 cycles whenever anxiety rises. Activates the parasympathetic system.", tag: "Breathing" },
      { icon: "🌿", title: "5-4-3-2-1 grounding", body: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Interrupts anxiety spirals.", tag: "Grounding" },
      { icon: "☕", title: "Limit caffeine & alcohol", body: "Both amplify anxiety symptoms. Try reducing coffee to 1 cup before noon and alcohol to weekends only.", tag: "Lifestyle" },
    ],
    moderate: [
      { icon: "🧘", title: "Progressive Muscle Relaxation", body: "Tense and release each muscle group from toes to head. 15 min/day reduces chronic anxiety significantly.", tag: "Mindfulness" },
      { icon: "📝", title: "Worry journaling", body: "Write down what you're worried about + what you can control + one small action. Externalises the worry.", tag: "CBT" },
      { icon: "🚫", title: "Reduce news/social media", body: "Limit news to 20 min/day. Constant information overload feeds anxiety loops.", tag: "Digital Wellness" },
    ],
    severe: [
      { icon: "🩺", title: "Seek professional help", body: "Severe anxiety responds to CBT with Exposure Therapy. A psychologist can guide you safely.", tag: "Professional" },
      { icon: "📞", title: "Crisis support", body: "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345", tag: "Crisis" },
    ],
    extremely_severe: [
      { icon: "🚨", title: "Please act now", body: "Extremely severe anxiety can be debilitating. Contact a mental health professional or go to an emergency service.", tag: "Crisis" },
      { icon: "📞", title: "India Crisis Line", body: "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345", tag: "Crisis" },
    ],
  },
  stress: {
    normal: [
      { icon: "🧘", title: "Preventive mindfulness", body: "10 minutes of mindfulness daily — even when you feel fine — builds stress resilience.", tag: "Mindfulness" },
    ],
    mild: [
      { icon: "🎵", title: "Music & movement", body: "Put on music you love and move. Dance, walk, stretch — even 10 min shifts your stress hormones.", tag: "Physical" },
      { icon: "📅", title: "Time-block your day", body: "Unstructured time + too many tasks = stress. Pick 3 priorities each morning and time-block them.", tag: "Productivity" },
      { icon: "🌳", title: "Nature exposure", body: "Even 20 min in green spaces reduces cortisol. Walk in a park, balcony, or sit near a window.", tag: "Lifestyle" },
    ],
    moderate: [
      { icon: "🚫", title: "Learn to say no", body: "Overcommitment drives moderate stress. Practice assertive but kind refusals. Your energy is finite.", tag: "Boundaries" },
      { icon: "🛁", title: "Recovery rituals", body: "Design a 30-min recovery ritual after work: shower, tea, no phone, gentle movement. Signal your nervous system to downregulate.", tag: "Lifestyle" },
      { icon: "💬", title: "Talk it out", body: "Verbalising stress reduces it significantly. Talk to a friend, family member, or therapist — even journaling helps.", tag: "Social" },
    ],
    severe: [
      { icon: "🩺", title: "Professional support", body: "Chronic severe stress leads to burnout. A therapist or counsellor can give you practical coping structures.", tag: "Professional" },
      { icon: "😴", title: "Prioritise recovery sleep", body: "Severe stress depletes the body. 8 hrs of sleep is recovery, not laziness. It's physiologically necessary.", tag: "Physical" },
    ],
    extremely_severe: [
      { icon: "🚨", title: "Burnout risk is high", body: "Please speak to a doctor or therapist immediately. Extreme stress affects physical health, immune function, and cognition.", tag: "Urgent" },
      { icon: "📞", title: "India Crisis Line", body: "iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345", tag: "Crisis" },
    ],
  },
};

const LIFESTYLE_RECS: Rec[] = [
  { icon: "😴", title: "Sleep 7-9 hours", body: "Sleep is when the brain processes emotions and clears stress hormones. Non-negotiable for mental health.", tag: "Sleep" },
  { icon: "📱", title: "Digital detox", body: "Take one full hour before bed with no screens. Try replacing it with a book, conversation, or stretching.", tag: "Digital Wellness" },
  { icon: "🏃", title: "Move your body", body: "150 min/week of moderate movement is the single most evidence-backed mental health intervention.", tag: "Physical" },
  { icon: "🥗", title: "Gut-brain connection", body: "Eat fermented foods (curd, idli), omega-3s (walnuts, flaxseed), and reduce ultra-processed food. The gut produces 90% of serotonin.", tag: "Nutrition" },
];

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  Lifestyle:        { bg: "#f0fdf4", text: "#065f46" },
  Physical:         { bg: "#fff7ed", text: "#9a3412" },
  CBT:              { bg: "#eef2ff", text: "#3730a3" },
  Mindfulness:      { bg: "#fdf4ff", text: "#7e22ce" },
  Social:           { bg: "#ecfeff", text: "#155e75" },
  Professional:     { bg: "#f0f9ff", text: "#0c4a6e" },
  Crisis:           { bg: "#fef2f2", text: "#991b1b" },
  Urgent:           { bg: "#fef2f2", text: "#991b1b" },
  Breathing:        { bg: "#e0f2fe", text: "#075985" },
  Grounding:        { bg: "#f0fdf4", text: "#166534" },
  "Digital Wellness": { bg: "#fafafa", text: "#374151" },
  Boundaries:       { bg: "#fdf4ff", text: "#6b21a8" },
  Productivity:     { bg: "#fffbeb", text: "#92400e" },
  Wellness:         { bg: "#eef2ff", text: "#4338ca" },
  Sleep:            { bg: "#eff6ff", text: "#1e40af" },
  Nutrition:        { bg: "#f0fdf4", text: "#15803d" },
};

const SEVERITY_COLOR: Record<string, string> = {
  normal: "#10b981", mild: "#f59e0b", moderate: "#f97316",
  severe: "#ef4444", extremely_severe: "#7c3aed",
};

function getSeverityRecs(domain: "depression" | "anxiety" | "stress", level: string): Rec[] {
  const domainRecs = RECS[domain];
  if (!domainRecs) return [];
  // Fallback chain
  const levels = ["normal", "mild", "moderate", "severe", "extremely_severe"];
  const idx = levels.indexOf(level);
  for (let i = idx; i >= 0; i--) {
    if (domainRecs[levels[i]]?.length) return domainRecs[levels[i]];
  }
  return domainRecs["normal"] || [];
}

export default function RecommendationsPage() {
  const [assessment, setAssessment] = useState<Assessment>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/assessment/latest")
      .then(r => { if (r.data?.summary) setAssessment(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dep = assessment?.summary.depression || "normal";
  const anx = assessment?.summary.anxiety    || "normal";
  const str = assessment?.summary.stress     || "normal";
  const overall = assessment?.overallSeverity || "normal";

  const allRecs = [
    ...getSeverityRecs("depression", dep),
    ...getSeverityRecs("anxiety", anx),
    ...getSeverityRecs("stress", str),
  ];
  // Deduplicate by title
  const seen = new Set<string>();
  const uniqueRecs = allRecs.filter(r => { if (seen.has(r.title)) return false; seen.add(r.title); return true; });

  return (
    <div style={page}>
      <AppNavbar />
      <div style={container}>

        {/* Header */}
        <div style={pageHeader}>
          <div>
            <h1 style={title}>💡 Your Personalised Recommendations</h1>
            <p style={sub}>
              Based on your DASS-21 results — practical steps to improve your mental wellness, one day at a time.
            </p>
          </div>
          {assessment && (
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
              {(["depression", "anxiety", "stress"] as const).map(d => (
                <div key={d} style={{
                  padding: "0.3rem 0.8rem", borderRadius: 99,
                  background: (SEVERITY_COLOR[assessment.summary[d]] || "#6b7280") + "18",
                  color: SEVERITY_COLOR[assessment.summary[d]] || "#6b7280",
                  fontSize: "0.78rem", fontWeight: 700, border: `1.5px solid ${SEVERITY_COLOR[assessment.summary[d]] || "#6b7280"}40`,
                }}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}: {assessment.summary[d]?.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Loading your recommendations…</div>
        ) : !assessment ? (
          <div style={noAssess}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p>Complete your DASS-21 assessment first to get personalised recommendations.</p>
            <a href="/assessment" style={cta}>Take Assessment →</a>
          </div>
        ) : (
          <>
            {/* Overall status banner */}
            <div style={{ ...statusBanner, borderLeft: `5px solid ${SEVERITY_COLOR[overall]}` }}>
              <span style={{ fontSize: 28 }}>
                {overall === "normal" ? "🌟" : overall === "mild" ? "🌤️" : overall === "moderate" ? "⚠️" : "🚨"}
              </span>
              <div>
                <div style={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>
                  Overall Level: {overall.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: 2 }}>
                  {overall === "normal" && "You're doing well! These recommendations will help you maintain and grow."}
                  {overall === "mild" && "You have some stress/mood concerns. Small consistent changes will make a big difference."}
                  {overall === "moderate" && "Your scores show significant mental health challenges. Prioritise these recommendations."}
                  {(overall === "severe" || overall === "extremely_severe") && "You are experiencing serious distress. Please seek professional support alongside these tips."}
                </div>
              </div>
            </div>

            {/* Domain-specific recs */}
            {(["depression", "anxiety", "stress"] as const).map(domain => {
              const level = assessment.summary[domain];
              const recs = getSeverityRecs(domain, level);
              const color = SEVERITY_COLOR[level] || "#6b7280";
              return (
                <section key={domain}>
                  <div style={sectionHeader}>
                    <span style={{ ...sectionDot, background: color }} />
                    <h2 style={sectionTitle}>
                      {domain === "depression" ? "😔 Depression" : domain === "anxiety" ? "😰 Anxiety" : "😤 Stress"} — {level.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </h2>
                  </div>
                  <div style={grid}>
                    {recs.map((r, i) => <RecCard key={i} rec={r} />)}
                  </div>
                </section>
              );
            })}

            {/* Lifestyle section */}
            <section>
              <div style={sectionHeader}>
                <span style={{ ...sectionDot, background: "#10b981" }} />
                <h2 style={sectionTitle}>🌱 Universal Lifestyle Pillars</h2>
              </div>
              <div style={grid}>
                {LIFESTYLE_RECS.map((r, i) => <RecCard key={i} rec={r} />)}
              </div>
            </section>

            {/* Disclaimer */}
            <div style={disclaimer}>
              ⚕️ <strong>Important:</strong> These recommendations are for informational purposes only and are not a substitute for professional medical or psychological advice. If you are in distress, please consult a licensed mental health professional.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RecCard({ rec }: { rec: Rec }) {
  const colors = TAG_COLOR[rec.tag] || { bg: "#f9fafb", text: "#374151" };
  return (
    <div style={card}>
      <div style={{ fontSize: 30, marginBottom: "0.6rem" }}>{rec.icon}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <h3 style={cardTitle}>{rec.title}</h3>
        <span style={{ ...tagPill, background: colors.bg, color: colors.text }}>{rec.tag}</span>
      </div>
      <p style={cardBody}>{rec.body}</p>
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };
const container: React.CSSProperties = {
  maxWidth: 1050, margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gap: "2rem",
};
const pageHeader: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  flexWrap: "wrap", gap: "1rem",
};
const title: React.CSSProperties = { fontSize: "1.75rem", fontWeight: 800, color: "#111827", margin: 0 };
const sub: React.CSSProperties = { color: "#6b7280", marginTop: 6 };

const statusBanner: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: "1rem",
  background: "white", borderRadius: 16, padding: "1.25rem 1.5rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const sectionHeader: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" };
const sectionDot: React.CSSProperties = { width: 12, height: 12, borderRadius: "50%", display: "inline-block" };
const sectionTitle: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 800, color: "#111827", margin: 0 };

const grid: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1rem",
};

const card: React.CSSProperties = {
  background: "white", borderRadius: 18, padding: "1.4rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: "1px solid #f5f5f5",
};
const cardTitle: React.CSSProperties = { fontWeight: 700, color: "#111827", fontSize: "0.95rem", margin: 0, flex: 1, paddingRight: "0.5rem" };
const cardBody: React.CSSProperties = { fontSize: "0.87rem", color: "#6b7280", lineHeight: 1.65, margin: 0 };
const tagPill: React.CSSProperties = {
  fontSize: "0.68rem", fontWeight: 700, padding: "0.2rem 0.55rem",
  borderRadius: 99, whiteSpace: "nowrap",
};
const noAssess: React.CSSProperties = {
  textAlign: "center", background: "white", borderRadius: 20, padding: "3rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)", color: "#6b7280",
  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
};
const cta: React.CSSProperties = {
  padding: "0.7rem 1.5rem", background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white", borderRadius: 12, fontWeight: 700, textDecoration: "none",
};
const disclaimer: React.CSSProperties = {
  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14,
  padding: "1rem 1.25rem", fontSize: "0.82rem", color: "#92400e", lineHeight: 1.6,
};
