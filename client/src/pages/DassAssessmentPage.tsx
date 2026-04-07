import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiClient } from "../services/apiClient";

const DASS_QUESTIONS = [
  // Depression (D) – items 0,2,4,9,12,15,17
  { id: 0, text: "I couldn't seem to experience any positive feeling at all.", scale: "D" },
  { id: 1, text: "I was aware of dryness of my mouth.", scale: "A" },
  { id: 2, text: "I couldn't seem to experience any negative feeling at all.", scale: "D" },
  { id: 3, text: "I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness).", scale: "A" },
  { id: 4, text: "I just couldn't seem to get going.", scale: "D" },
  { id: 5, text: "I tended to over-react to situations.", scale: "S" },
  { id: 6, text: "I had a feeling of shakiness (e.g. legs going to give way).", scale: "A" },
  { id: 7, text: "I found it difficult to relax.", scale: "S" },
  { id: 8, text: "I found myself in situations that made me so anxious I was most relieved when they ended.", scale: "A" },
  { id: 9, text: "I felt that I had nothing to look forward to.", scale: "D" },
  { id: 10, text: "I found myself getting agitated.", scale: "S" },
  { id: 11, text: "I found it difficult to relax.", scale: "S" },
  { id: 12, text: "I felt down-hearted and blue.", scale: "D" },
  { id: 13, text: "I was intolerant of anything that kept me from getting on with what I was doing.", scale: "S" },
  { id: 14, text: "I felt I was close to panic.", scale: "A" },
  { id: 15, text: "I was unable to become enthusiastic about anything.", scale: "D" },
  { id: 16, text: "I felt I wasn't worth much as a person.", scale: "D" },
  { id: 17, text: "I felt that I was rather touchy.", scale: "S" },
  { id: 18, text: "I was aware of the action of my heart in the absence of physical exertion (e.g. sense of heart rate increase).", scale: "A" },
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

  const [step, setStep] = useState<"dass" | "lifestyle" | "submitting">("dass");
  const [page, setPage] = useState(0); // 0,1,2 for 3 pages of 7
  const [dassAnswers, setDassAnswers] = useState<number[]>(Array(21).fill(-1));
  const [survey, setSurvey] = useState({ sleep: "", screen: "", stress: "" });
  const [error, setError] = useState("");

  const totalPages = 3;
  const pageStart = page * DASS_PER_PAGE;
  const pageQuestions = DASS_QUESTIONS.slice(pageStart, pageStart + DASS_PER_PAGE);

  function setAnswer(idx: number, val: number) {
    const next = [...dassAnswers];
    next[idx] = val;
    setDassAnswers(next);
  }

  function nextPage() {
    const answered = pageQuestions.every((q) => dassAnswers[q.id] >= 0);
    if (!answered) {
      setError("Please answer all questions before continuing.");
      return;
    }
    setError("");
    if (page < totalPages - 1) {
      setPage(page + 1);
      window.scrollTo(0, 0);
    } else {
      setStep("lifestyle");
      window.scrollTo(0, 0);
    }
  }

  function prevPage() {
    if (page > 0) setPage(page - 1);
    else setStep("dass");
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    if (!survey.sleep || !survey.screen || !survey.stress) {
      setError("Please answer all lifestyle questions.");
      return;
    }
    setError("");
    setStep("submitting");
    try {
      await apiClient.post("/assessment/submit", {
        dassAnswers,
        survey: {
          sleepHours: survey.sleep,
          screenHours: survey.screen,
          stressLevel: survey.stress,
        },
      });
      await refreshUser();
      navigate("/consent");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Submission failed. Please try again.");
      setStep("lifestyle");
    }
  }

  if (step === "submitting") {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 48 }}>🧠</div>
            <h2 style={{ marginTop: "1rem", color: "#6366f1" }}>Analysing your results…</h2>
            <p style={{ color: "#6b7280" }}>This will only take a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "lifestyle") {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={progressBar}>
            <div style={{ ...progressFill, width: "100%" }} />
          </div>
          <p style={stepLabel}>Step 4 of 4 — Lifestyle Check</p>
          <h1 style={heading}>A few more questions…</h1>
          <p style={subheading}>These help personalise your wellness plan.</p>

          <div style={qBlock}>
            <label style={qLabel}>🌙 How many hours of sleep do you typically get per night?</label>
            <div style={optRow}>
              {["< 5 hrs", "5–6 hrs", "7–8 hrs", "> 8 hrs"].map((o) => (
                <button
                  key={o}
                  style={{ ...optBtn, ...(survey.sleep === o ? optSelected : {}) }}
                  onClick={() => setSurvey({ ...survey, sleep: o })}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div style={qBlock}>
            <label style={qLabel}>📱 How many hours of screen time (non-work) do you have daily?</label>
            <div style={optRow}>
              {["< 1 hr", "1–3 hrs", "3–5 hrs", "> 5 hrs"].map((o) => (
                <button
                  key={o}
                  style={{ ...optBtn, ...(survey.screen === o ? optSelected : {}) }}
                  onClick={() => setSurvey({ ...survey, screen: o })}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div style={qBlock}>
            <label style={qLabel}>⚡ How would you rate your current stress level (1 = very low, 5 = very high)?</label>
            <div style={optRow}>
              {["1", "2", "3", "4", "5"].map((o) => (
                <button
                  key={o}
                  style={{ ...optBtn, ...(survey.stress === o ? optSelected : {}) }}
                  onClick={() => setSurvey({ ...survey, stress: o })}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={errorText}>{error}</p>}

          <div style={navRow}>
            <button style={backBtn} onClick={() => { setStep("dass"); setPage(2); }}>← Back</button>
            <button style={nextBtn} onClick={handleSubmit}>Submit Assessment →</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        {/* Progress bar */}
        <div style={progressBar}>
          <div style={{ ...progressFill, width: `${((page + 1) / totalPages) * 75}%` }} />
        </div>
        <p style={stepLabel}>Step {page + 1} of 4 — DASS-21 Assessment</p>

        <h1 style={heading}>How have you been feeling?</h1>
        <p style={subheading}>
          Over the <strong>past week</strong>, how much did each statement apply to you?
        </p>

        <div style={{ display: "grid", gap: "1.5rem", marginTop: "1.5rem" }}>
          {pageQuestions.map((q) => (
            <div key={q.id} style={qBlock}>
              <p style={qLabel}>
                <span style={qNum}>{q.id + 1}.</span> {q.text}
              </p>
              <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
                {OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      ...radioLabel,
                      ...(dassAnswers[q.id] === opt.value ? radioSelected : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value={opt.value}
                      checked={dassAnswers[q.id] === opt.value}
                      onChange={() => setAnswer(q.id, opt.value)}
                      style={{ marginRight: "0.75rem" }}
                    />
                    <span style={optScore}>{opt.value}</span>
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p style={errorText}>{error}</p>}

        <div style={navRow}>
          {page > 0 ? (
            <button style={backBtn} onClick={prevPage}>← Back</button>
          ) : (
            <div />
          )}
          <button style={nextBtn} onClick={nextPage}>
            {page < totalPages - 1 ? "Next →" : "Lifestyle Questions →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "2rem 1rem",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 700,
  background: "white",
  borderRadius: 24,
  padding: "2.5rem",
  boxShadow: "0 20px 60px rgba(99,102,241,0.12)",
};

const progressBar: React.CSSProperties = {
  height: 6,
  background: "#e5e7eb",
  borderRadius: 99,
  marginBottom: "1.25rem",
  overflow: "hidden",
};

const progressFill: React.CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg,#6366f1,#a855f7)",
  borderRadius: 99,
  transition: "width 0.4s ease",
};

const stepLabel: React.CSSProperties = {
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#6366f1",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "0.5rem",
};

const heading: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 700,
  color: "#111827",
  margin: 0,
};

const subheading: React.CSSProperties = {
  color: "#6b7280",
  marginTop: "0.4rem",
  marginBottom: 0,
};

const qBlock: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 14,
  padding: "1.25rem",
  border: "1px solid #e5e7eb",
};

const qLabel: React.CSSProperties = {
  fontWeight: 500,
  color: "#374151",
  fontSize: "0.95rem",
  lineHeight: 1.5,
  margin: 0,
};

const qNum: React.CSSProperties = {
  fontWeight: 700,
  color: "#6366f1",
  marginRight: "0.3rem",
};

const radioLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "0.6rem 0.9rem",
  borderRadius: 10,
  cursor: "pointer",
  fontSize: "0.9rem",
  color: "#374151",
  border: "1.5px solid transparent",
  background: "white",
  transition: "all 0.15s",
};

const radioSelected: React.CSSProperties = {
  borderColor: "#6366f1",
  background: "#eef2ff",
  color: "#4338ca",
  fontWeight: 600,
};

const optScore: React.CSSProperties = {
  minWidth: 24,
  height: 24,
  background: "#6366f1",
  color: "white",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.78rem",
  fontWeight: 700,
  marginRight: "0.75rem",
};

const optRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  marginTop: "0.75rem",
};

const optBtn: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: 10,
  border: "1.5px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontSize: "0.9rem",
  color: "#374151",
  transition: "all 0.15s",
  fontWeight: 500,
};

const optSelected: React.CSSProperties = {
  borderColor: "#6366f1",
  background: "#eef2ff",
  color: "#4338ca",
  fontWeight: 700,
};

const navRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "2rem",
};

const nextBtn: React.CSSProperties = {
  padding: "0.75rem 1.75rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: "0.95rem",
  cursor: "pointer",
};

const backBtn: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  background: "transparent",
  color: "#6b7280",
  border: "1.5px solid #d1d5db",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const errorText: React.CSSProperties = {
  color: "#dc2626",
  marginTop: "1rem",
  fontSize: "0.9rem",
  fontWeight: 500,
};
