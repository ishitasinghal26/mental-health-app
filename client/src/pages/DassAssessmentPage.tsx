import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";

const DASS_QUESTIONS = [
  { id: 0,  text: "I couldn't seem to experience any positive feeling at all.", scale: "D" },
  { id: 1,  text: "I was aware of dryness of my mouth.", scale: "A" },
  { id: 2,  text: "I couldn't seem to experience any negative feeling at all.", scale: "D" },
  { id: 3,  text: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness).", scale: "A" },
  { id: 4,  text: "I just couldn't seem to get going.", scale: "D" },
  { id: 5,  text: "I tended to over-react to situations.", scale: "S" },
  { id: 6,  text: "I had a feeling of shakiness (e.g. legs going to give way).", scale: "A" },
  { id: 7,  text: "I found it difficult to relax.", scale: "S" },
  { id: 8,  text: "I found myself in situations that made me so anxious I was most relieved when they ended.", scale: "A" },
  { id: 9,  text: "I felt that I had nothing to look forward to.", scale: "D" },
  { id: 10, text: "I found myself getting agitated.", scale: "S" },
  { id: 11, text: "I found it difficult to relax.", scale: "S" },
  { id: 12, text: "I felt down-hearted and blue.", scale: "D" },
  { id: 13, text: "I was intolerant of anything that kept me from getting on with what I was doing.", scale: "S" },
  { id: 14, text: "I felt I was close to panic.", scale: "A" },
  { id: 15, text: "I was unable to become enthusiastic about anything.", scale: "D" },
  { id: 16, text: "I felt I wasn't worth much as a person.", scale: "D" },
  { id: 17, text: "I felt that I was rather touchy.", scale: "S" },
  { id: 18, text: "I was aware of the action of my heart in the absence of physical exertion.", scale: "A" },
  { id: 19, text: "I felt scared without any good reason.", scale: "A" },
  { id: 20, text: "I felt that life was meaningless.", scale: "D" },
];

const OPTIONS = [
  { value: 0, label: "Did not apply to me at all" },
  { value: 1, label: "Applied to me to some degree" },
  { value: 2, label: "Applied to me to a considerable degree" },
  { value: 3, label: "Applied to me very much" },
];

const DASS_PER_PAGE = 7;

export default function DassAssessmentPage() {
  const navigate = useNavigate();
  const { updateUser, refreshUser } = useAuth();

  const [step,        setStep]        = useState<"dass" | "lifestyle" | "submitting">("dass");
  const [page,        setPage]        = useState(0);
  const [dassAnswers, setDassAnswers] = useState<number[]>(Array(21).fill(-1));
  const [survey,      setSurvey]      = useState({ sleep: "", screen: "", stress: "" });
  const [error,       setError]       = useState("");

  const totalPages    = 3;
  const pageStart     = page * DASS_PER_PAGE;
  const pageQuestions = DASS_QUESTIONS.slice(pageStart, pageStart + DASS_PER_PAGE);

  function setAnswer(idx: number, val: number) {
    const next = [...dassAnswers]; next[idx] = val; setDassAnswers(next);
  }

  function nextPage() {
    const answered = pageQuestions.every(q => dassAnswers[q.id] >= 0);
    if (!answered) { setError("Please answer all questions before continuing."); return; }
    setError("");
    if (page < totalPages - 1) { setPage(page + 1); window.scrollTo(0, 0); }
    else { setStep("lifestyle"); window.scrollTo(0, 0); }
  }

  function prevPage() {
    if (page > 0) setPage(page - 1);
    else setStep("dass");
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    if (!survey.sleep || !survey.screen || !survey.stress) {
      setError("Please answer all lifestyle questions."); return;
    }
    setError(""); setStep("submitting");
    try {
      await apiClient.post("/assessment/submit", {
        dassAnswers,
        survey: { sleepHours: survey.sleep, screenHours: survey.screen, stressLevel: survey.stress },
      });
      await refreshUser();
      navigate("/consent");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Submission failed. Please try again.");
      setStep("lifestyle");
    }
  }

  const progress = step === "lifestyle" ? 100 : ((page + 1) / totalPages) * 75;

  if (step === "submitting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card-strong p-14 text-center animate-fade-in max-w-md w-full">
          <div className="text-6xl mb-4 animate-float">🧠</div>
          <h2 className="text-xl font-black gradient-text mb-2">Analysing your results…</h2>
          <p className="text-gray-500">This will only take a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-5%] w-80 h-80 rounded-full bg-rose-200/25 blur-3xl animate-float" />
        <div className="absolute bottom-0 left-[-5%] w-72 h-72 rounded-full bg-pink-300/15 blur-3xl animate-float-2" />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <div className="glass-card-strong p-8">
          {/* Progress bar */}
          <div className="h-1.5 bg-white/30 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg,#f472b6,#a78bfa,#93c5fd)" }}
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-3">
            {step === "lifestyle" ? "Step 4 of 4 — Lifestyle Check" : `Step ${page + 1} of 4 — DASS-21`}
          </p>

          {step === "lifestyle" ? (
            <>
              <h1 className="text-2xl font-black text-gray-800 mb-1">A few more questions…</h1>
              <p className="text-sm text-gray-500 mb-6">These help personalise your wellness plan.</p>

              <div className="flex flex-col gap-5">
                {/* Sleep */}
                <div className="glass-panel p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">🌙 How many hours of sleep do you typically get per night?</label>
                  <div className="flex flex-wrap gap-2">
                    {["< 5 hrs", "5–6 hrs", "7–8 hrs", "> 8 hrs"].map(o => (
                      <button
                        key={o}
                        onClick={() => setSurvey({ ...survey, sleep: o })}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
                          ${survey.sleep === o
                            ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-md"
                            : "bg-white/40 border-white/40 text-gray-600 hover:bg-white/60"}`}
                      >{o}</button>
                    ))}
                  </div>
                </div>

                {/* Screen */}
                <div className="glass-panel p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📱 How many hours of screen time (non-work) do you have daily?</label>
                  <div className="flex flex-wrap gap-2">
                    {["< 1 hr", "1–3 hrs", "3–5 hrs", "> 5 hrs"].map(o => (
                      <button
                        key={o}
                        onClick={() => setSurvey({ ...survey, screen: o })}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer
                          ${survey.screen === o
                            ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-md"
                            : "bg-white/40 border-white/40 text-gray-600 hover:bg-white/60"}`}
                      >{o}</button>
                    ))}
                  </div>
                </div>

                {/* Stress */}
                <div className="glass-panel p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">⚡ How would you rate your current stress level? (1 = very low, 5 = very high)</label>
                  <div className="flex gap-2 flex-wrap">
                    {["1", "2", "3", "4", "5"].map(o => (
                      <button
                        key={o}
                        onClick={() => setSurvey({ ...survey, stress: o })}
                        className={`w-12 h-12 rounded-full text-base font-bold border transition-all duration-200 cursor-pointer
                          ${survey.stress === o
                            ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white border-transparent shadow-md"
                            : "bg-white/40 border-white/40 text-gray-600 hover:bg-white/60"}`}
                      >{o}</button>
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}

              <div className="flex justify-between mt-8">
                <button onClick={() => { setStep("dass"); setPage(2); }} className="btn-ghost">← Back</button>
                <button onClick={handleSubmit} className="btn-primary px-8 py-2.5">Submit Assessment →</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-gray-800 mb-1">How have you been feeling?</h1>
              <p className="text-sm text-gray-500 mb-6">
                Over the <strong>past week</strong>, how much did each statement apply to you?
              </p>

              <div className="flex flex-col gap-4">
                {pageQuestions.map(q => (
                  <div key={q.id} className="glass-panel p-5">
                    <p className="text-sm font-medium text-gray-700 mb-3 leading-relaxed">
                      <span className="text-rose-400 font-bold mr-1">{q.id + 1}.</span> {q.text}
                    </p>
                    <div className="flex flex-col gap-2">
                      {OPTIONS.map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer border transition-all duration-150 text-sm
                            ${dassAnswers[q.id] === opt.value
                              ? "border-rose-400 bg-rose-50/60 text-rose-600 font-semibold"
                              : "border-white/30 bg-white/30 text-gray-600 hover:bg-white/50"}`}
                        >
                          <input
                            type="radio"
                            name={`q${q.id}`}
                            value={opt.value}
                            checked={dassAnswers[q.id] === opt.value}
                            onChange={() => setAnswer(q.id, opt.value)}
                            className="hidden"
                          />
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                            ${dassAnswers[q.id] === opt.value
                              ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white"
                              : "bg-white/60 text-gray-500 border border-white/40"}`}
                          >{opt.value}</span>
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}

              {/* Supportive message */}
              <p className="text-center text-sm text-rose-400 font-medium mt-5 animate-fade-in">
                💛 Thank you for being patient — just a few more questions to go.
              </p>

              <div className="flex justify-between mt-4">
                {page > 0
                  ? <button onClick={prevPage} className="btn-ghost">← Back</button>
                  : <div />}
                <button onClick={nextPage} className="btn-primary px-8 py-2.5">
                  {page < totalPages - 1 ? "Next →" : "Lifestyle Questions →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
