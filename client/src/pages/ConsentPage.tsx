import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ConsentPage() {
  const navigate = useNavigate();
  const { saveConsent } = useAuth();
  const [selected, setSelected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleContinue() {
    if (selected === null) {
      setError("Please choose an option to continue.");
      return;
    }
    setLoading(true);
    try {
      await saveConsent(selected);
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={iconWrap}>🤖</div>
        <h1 style={heading}>Enable AI-Powered Insights?</h1>
        <p style={subheading}>
          MindKare can use your assessment results to personalise your chatbot responses,
          recommendations, and dashboard insights. Your data stays <strong>on your device</strong> and
          is never shared with third parties.
        </p>

        <div style={optionsGrid}>
          {/* YES card */}
          <button
            style={{
              ...optCard,
              ...(selected === true ? optCardSelected : {}),
            }}
            onClick={() => { setSelected(true); setError(""); }}
            id="consent-yes"
          >
            <div style={optIcon}>✨</div>
            <div style={optTitle}>Yes, enable AI insights</div>
            <div style={optDesc}>
              Your chatbot will reference your DASS results and mood history to give personalised,
              context-aware support.
            </div>
            <div style={{ ...checkmark, ...(selected === true ? checkmarkVisible : {}) }}>✓</div>
          </button>

          {/* NO card */}
          <button
            style={{
              ...optCard,
              ...(selected === false ? optCardSelectedNo : {}),
            }}
            onClick={() => { setSelected(false); setError(""); }}
            id="consent-no"
          >
            <div style={optIcon}>🔒</div>
            <div style={optTitle}>No, keep it private</div>
            <div style={optDesc}>
              Your chatbot will still work, but without your personal assessment context.
              You can change this setting anytime from your Profile.
            </div>
            <div style={{ ...checkmark, color: "#10b981", ...(selected === false ? checkmarkVisible : {}) }}>✓</div>
          </button>
        </div>

        {error && <p style={errorText}>{error}</p>}

        <button
          id="consent-continue"
          style={{ ...continueBtn, opacity: selected === null ? 0.5 : 1 }}
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? "Saving…" : "Continue to Dashboard →"}
        </button>

        <p style={noteText}>
          You can change your preference at any time from <strong>Profile → AI Settings</strong>.
        </p>
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem 1rem",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 680,
  background: "white",
  borderRadius: 28,
  padding: "3rem 2.5rem",
  boxShadow: "0 24px 70px rgba(99,102,241,0.14)",
  textAlign: "center",
};

const iconWrap: React.CSSProperties = {
  fontSize: 56,
  marginBottom: "1rem",
};

const heading: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 0.75rem",
};

const subheading: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "1rem",
  lineHeight: 1.6,
  marginBottom: "2rem",
};

const optionsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.25rem",
  marginBottom: "1.5rem",
};

const optCard: React.CSSProperties = {
  position: "relative",
  padding: "1.75rem 1.25rem",
  border: "2px solid #e5e7eb",
  borderRadius: 20,
  background: "#f9fafb",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s",
};

const optCardSelected: React.CSSProperties = {
  border: "2px solid #6366f1",
  background: "#eef2ff",
  boxShadow: "0 0 0 4px rgba(99,102,241,0.12)",
};

const optCardSelectedNo: React.CSSProperties = {
  border: "2px solid #10b981",
  background: "#ecfdf5",
  boxShadow: "0 0 0 4px rgba(16,185,129,0.1)",
};

const optIcon: React.CSSProperties = {
  fontSize: 32,
  marginBottom: "0.75rem",
};

const optTitle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#111827",
  marginBottom: "0.5rem",
};

const optDesc: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#6b7280",
  lineHeight: 1.5,
};

const checkmark: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 18,
  color: "#6366f1",
  fontSize: "1.2rem",
  fontWeight: 800,
  opacity: 0,
  transition: "opacity 0.2s",
};

const checkmarkVisible: React.CSSProperties = {
  opacity: 1,
};

const continueBtn: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  border: "none",
  borderRadius: 14,
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const noteText: React.CSSProperties = {
  marginTop: "1rem",
  fontSize: "0.82rem",
  color: "#9ca3af",
};

const errorText: React.CSSProperties = {
  color: "#dc2626",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  fontWeight: 500,
};
