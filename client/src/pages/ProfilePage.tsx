import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AppNavbar from "../components/navbar/AppNavbar";

const SEVERITY_COLOR: Record<string, string> = {
  normal: "#10b981",
  mild: "#f59e0b",
  moderate: "#f97316",
  severe: "#ef4444",
  extremely_severe: "#7c3aed",
};

export default function ProfilePage() {
  const { user, logout, saveConsent } = useAuth();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState("");

  const aiEnabled = user?.ai_consent === true;
  const firstName = user?.name?.split(" ")[0] || "";
  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  async function handleToggleConsent(newValue: boolean) {
    setToggling(true);
    try {
      await saveConsent(newValue);
      setMessage(newValue ? "AI insights enabled!" : "AI insights disabled.");
      setShowConsentModal(false);
    } catch {
      setMessage("Failed to update. Please try again.");
    } finally {
      setToggling(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div style={page}>
      <AppNavbar />
      <div style={container}>
        {/* Page header */}
        <h1 style={pageTitle}>Profile & Settings</h1>

        {/* Profile card */}
        <div style={card}>
          <div style={avatarBig}>{initials}</div>
          <div style={{ marginTop: "1rem" }}>
            <div style={userName}>{user?.name}</div>
            <div style={userEmail}>{user?.email}</div>
          </div>
        </div>

        {message && (
          <div style={toastMsg}>{message}</div>
        )}

        {/* AI Settings */}
        <div style={settingsCard}>
          <div style={settingsHeader}>
            <div>
              <h2 style={sectionTitle}>🤖 AI Insights</h2>
              <p style={sectionSub}>Control whether your chatbot uses your DASS assessment for personalised responses.</p>
            </div>
            <div style={{ ...statusBadge, ...(aiEnabled ? statusOn : statusOff) }}>
              {aiEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>

          <div style={settingRow}>
            <div>
              <div style={settingLabel}>Personalised AI Support</div>
              <div style={settingDesc}>
                Your DASS results and mood history inform the chatbot's responses.
              </div>
            </div>
            <button
              id="toggle-ai-consent"
              style={{ ...toggleBtn, background: aiEnabled ? "#6366f1" : "#d1d5db" }}
              onClick={() => setShowConsentModal(true)}
            >
              <span style={{ ...toggleKnob, transform: aiEnabled ? "translateX(22px)" : "translateX(2px)" }} />
            </button>
          </div>

          <p style={noteText}>
            {aiEnabled
              ? "✅ AI mode is active. Your chatbot greets you by name and tailors advice based on your assessment."
              : "🔒 Private mode is active. No personal context is used in chatbot responses."}
          </p>
        </div>

        {/* Account card */}
        <div style={settingsCard}>
          <h2 style={sectionTitle}>⚙️ Account</h2>
          <div style={infoRow}><span style={infoLabel}>Name</span><span>{user?.name}</span></div>
          <div style={infoRow}><span style={infoLabel}>Email</span><span>{user?.email}</span></div>
          <div style={infoRow}>
            <span style={infoLabel}>DASS Assessment</span>
            <span style={{ color: "#10b981", fontWeight: 600 }}>✅ Completed</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>AI Consent</span>
            <span style={{ fontWeight: 600, color: aiEnabled ? "#6366f1" : "#6b7280" }}>
              {aiEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          <button
            id="profile-logout"
            style={logoutBtn}
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Consent toggle modal */}
      {showConsentModal && (
        <div style={modalOverlay} onClick={() => setShowConsentModal(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.2rem" }}>
              {aiEnabled ? "Disable AI Insights?" : "Enable AI Insights?"}
            </h2>
            <p style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              {aiEnabled
                ? "Your chatbot will no longer reference your DASS results or personal history. It will still work in basic mode."
                : "Your chatbot will use your DASS assessment and mood logs to provide personalised, context-aware mental health support."}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button style={cancelBtn} onClick={() => setShowConsentModal(false)}>Cancel</button>
              <button
                style={{ ...confirmBtn, background: aiEnabled ? "#ef4444" : "#6366f1" }}
                onClick={() => handleToggleConsent(!aiEnabled)}
                disabled={toggling}
              >
                {toggling ? "Saving…" : aiEnabled ? "Yes, disable" : "Yes, enable"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
const page: React.CSSProperties = { minHeight: "100vh", background: "#f8fafc" };

const container: React.CSSProperties = {
  maxWidth: 700,
  margin: "0 auto",
  padding: "2rem 1.5rem",
  display: "grid",
  gap: "1.25rem",
};

const pageTitle: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 800,
  color: "#111827",
  margin: 0,
};

const card: React.CSSProperties = {
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  borderRadius: 24,
  padding: "2.5rem",
  textAlign: "center",
};

const avatarBig: React.CSSProperties = {
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.75rem",
  fontWeight: 800,
  margin: "0 auto",
};

const userName: React.CSSProperties = { fontSize: "1.3rem", fontWeight: 700 };
const userEmail: React.CSSProperties = { opacity: 0.8, marginTop: 4 };

const settingsCard: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: "1.75rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
};

const settingsHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "1.25rem",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "1.05rem",
  fontWeight: 700,
  color: "#111827",
  margin: 0,
};

const sectionSub: React.CSSProperties = {
  fontSize: "0.83rem",
  color: "#6b7280",
  marginTop: 4,
};

const statusBadge: React.CSSProperties = {
  padding: "0.25rem 0.75rem",
  borderRadius: 99,
  fontSize: "0.78rem",
  fontWeight: 700,
};

const statusOn: React.CSSProperties = { background: "#eef2ff", color: "#4338ca" };
const statusOff: React.CSSProperties = { background: "#f4f4f5", color: "#71717a" };

const settingRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 0",
  borderTop: "1px solid #f5f5f5",
};

const settingLabel: React.CSSProperties = { fontWeight: 600, fontSize: "0.92rem", color: "#111827" };
const settingDesc: React.CSSProperties = { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 };

const toggleBtn: React.CSSProperties = {
  width: 48,
  height: 26,
  borderRadius: 99,
  border: "none",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.25s",
  flexShrink: 0,
};

const toggleKnob: React.CSSProperties = {
  position: "absolute",
  top: 3,
  width: 20,
  height: 20,
  background: "white",
  borderRadius: "50%",
  transition: "transform 0.25s",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

const noteText: React.CSSProperties = {
  fontSize: "0.83rem",
  color: "#6b7280",
  marginTop: "0.75rem",
  padding: "0.75rem",
  background: "#f9fafb",
  borderRadius: 10,
};

const infoRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.7rem 0",
  borderBottom: "1px solid #f5f5f5",
  fontSize: "0.9rem",
};

const infoLabel: React.CSSProperties = { color: "#6b7280", fontWeight: 500 };

const logoutBtn: React.CSSProperties = {
  marginTop: "1.25rem",
  padding: "0.65rem 1.5rem",
  background: "#fef2f2",
  color: "#dc2626",
  border: "1.5px solid #fecaca",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const toastMsg: React.CSSProperties = {
  background: "#ecfdf5",
  color: "#065f46",
  border: "1px solid #bbf7d0",
  padding: "0.75rem 1.25rem",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: "0.9rem",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const modal: React.CSSProperties = {
  background: "white",
  borderRadius: 24,
  padding: "2rem",
  width: "100%",
  maxWidth: 440,
  boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "0.7rem",
  background: "#f3f4f6",
  color: "#374151",
  border: "none",
  borderRadius: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const confirmBtn: React.CSSProperties = {
  flex: 1,
  padding: "0.7rem",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};
