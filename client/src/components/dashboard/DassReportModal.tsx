import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";

type FullReport = {
  depression_score: number;
  anxiety_score:    number;
  stress_score:     number;
  depression_level: string;
  anxiety_level:    string;
  stress_level:     string;
  sleep_risk:       string;
  screen_risk:      string;
  stress_self:      string;
  overall_severity: string;
  created_at:       string;
};

const SEVERITY_COLOR: Record<string, string> = {
  normal:           "#10b981",
  mild:             "#f59e0b",
  moderate:         "#f97316",
  severe:           "#ef4444",
  extremely_severe: "#7c3aed",
};

const SEVERITY_LABEL: Record<string, string> = {
  normal:           "Normal",
  mild:             "Mild",
  moderate:         "Moderate",
  severe:           "Severe",
  extremely_severe: "Extremely Severe",
};

// DASS-21 clinical thresholds
const DASS_THRESHOLDS = {
  depression: [
    { max: 9,  label: "Normal",           info: "Minimal or no depressive symptoms." },
    { max: 13, label: "Mild",             info: "Some low mood; may benefit from self-care strategies." },
    { max: 20, label: "Moderate",         info: "Persistent low mood; professional support is recommended." },
    { max: 27, label: "Severe",           info: "Significant depression; please seek professional help." },
    { max: Infinity, label: "Extremely Severe", info: "Very high depression. Urgent professional care is advised." },
  ],
  anxiety: [
    { max: 7,  label: "Normal",           info: "Minimal anxiety symptoms." },
    { max: 9,  label: "Mild",             info: "Slight anxious feelings; manageable with self-care." },
    { max: 14, label: "Moderate",         info: "Noticeable anxiety; consider speaking with a therapist." },
    { max: 19, label: "Severe",           info: "High anxiety; professional support is recommended." },
    { max: Infinity, label: "Extremely Severe", info: "Very high anxiety. Please seek professional help promptly." },
  ],
  stress: [
    { max: 14, label: "Normal",           info: "Your stress is within a healthy range." },
    { max: 18, label: "Mild",             info: "Elevated stress; prioritize rest and relaxation." },
    { max: 25, label: "Moderate",         info: "Notable stress levels; stress management techniques recommended." },
    { max: 33, label: "Severe",           info: "High stress; consider professional support." },
    { max: Infinity, label: "Extremely Severe", info: "Very high stress. Seek immediate support." },
  ],
};

function getThresholdInfo(domain: keyof typeof DASS_THRESHOLDS, score: number) {
  for (const t of DASS_THRESHOLDS[domain]) {
    if (score <= t.max) return t;
  }
  return DASS_THRESHOLDS[domain][DASS_THRESHOLDS[domain].length - 1];
}

const MAX_SCORES = { depression: 42, anxiety: 42, stress: 42 };

interface Props {
  onClose: () => void;
}

export default function DassReportModal({ onClose }: Props) {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    apiClient.get("/assessment/full")
      .then(r => setReport(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRetake() {
    if (!window.confirm("This will reset your current DASS report and let you retake the assessment. Continue?")) return;
    setResetting(true);
    try {
      await apiClient.post("/assessment/reset");
      await refreshUser();          // update dass_completed → false in context
      onClose();
      navigate("/assessment");
    } catch {
      alert("Failed to reset assessment. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={modalHeader}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>
              📊 Full DASS-21 Report
            </h2>
            {report && (
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#9ca3af" }}>
                Taken on {new Date(report.created_at).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={retakeBtn} onClick={handleRetake} disabled={resetting}>
              {resetting ? "Resetting…" : "🔄 Retake Survey"}
            </button>
            <button style={closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div style={body}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>Loading your report…</div>
          ) : !report ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
              <div style={{ fontSize: 44 }}>📋</div>
              <p>No assessment data found.</p>
              <button style={retakeBtn} onClick={() => { onClose(); navigate("/assessment"); }}>
                Take Assessment Now
              </button>
            </div>
          ) : (
            <>
              {/* Overall Severity */}
              <div style={{ ...overallBadge, background: (SEVERITY_COLOR[report.overall_severity] || "#6b7280") + "15", border: `2px solid ${SEVERITY_COLOR[report.overall_severity] || "#6b7280"}` }}>
                <span style={{ fontSize: 28 }}>
                  {report.overall_severity === "normal" ? "🌟" : report.overall_severity === "mild" ? "🌤️" : report.overall_severity === "moderate" ? "⚠️" : "🚨"}
                </span>
                <div>
                  <div style={{ fontWeight: 800, color: "#111827", fontSize: "1rem" }}>
                    Overall: {SEVERITY_LABEL[report.overall_severity] || report.overall_severity}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    Based on your Depression, Anxiety &amp; Stress scores combined.
                  </div>
                </div>
              </div>

              {/* Three domain scores */}
              <div style={domainsGrid}>
                {(["depression", "anxiety", "stress"] as const).map(domain => {
                  const score = report[`${domain}_score` as keyof FullReport] as number;
                  const level = report[`${domain}_level` as keyof FullReport] as string;
                  const color = SEVERITY_COLOR[level] || "#6b7280";
                  const pct   = Math.round((score / MAX_SCORES[domain]) * 100);
                  const info  = getThresholdInfo(domain, score);
                  return (
                    <div key={domain} style={{ ...domainCard, borderTop: `4px solid ${color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <span style={{ fontWeight: 700, color: "#374151", fontSize: "0.95rem", textTransform: "capitalize" }}>
                          {domain}
                        </span>
                        <span style={{ ...pill, background: color + "18", color }}>
                          {SEVERITY_LABEL[level] || level}
                        </span>
                      </div>

                      <div style={{ fontSize: "2rem", fontWeight: 800, color, marginBottom: "0.5rem" }}>
                        {score}
                        <span style={{ fontSize: "1rem", fontWeight: 400, color: "#9ca3af" }}> / {MAX_SCORES[domain]}</span>
                      </div>

                      {/* Score bar */}
                      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginBottom: "0.75rem" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
                      </div>

                      <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{info.info}</p>

                      {/* Threshold reference */}
                      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                        {DASS_THRESHOLDS[domain].slice(0, -1).map(t => (
                          <span
                            key={t.label}
                            style={{
                              fontSize: "0.68rem",
                              padding: "0.15rem 0.45rem",
                              borderRadius: 99,
                              background: (score <= t.max && score > (DASS_THRESHOLDS[domain][DASS_THRESHOLDS[domain].indexOf(t) - 1]?.max ?? -1)) ? color + "20" : "#f3f4f6",
                              color: (score <= t.max && score > (DASS_THRESHOLDS[domain][DASS_THRESHOLDS[domain].indexOf(t) - 1]?.max ?? -1)) ? color : "#9ca3af",
                              fontWeight: 600,
                              border: (score <= t.max && score > (DASS_THRESHOLDS[domain][DASS_THRESHOLDS[domain].indexOf(t) - 1]?.max ?? -1)) ? `1px solid ${color}` : "1px solid transparent",
                            }}
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lifestyle Factors */}
              <div style={sectionCard}>
                <h3 style={sectionTitle}>🌙 Lifestyle Risk Factors</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                  <LifestyleItem icon="😴" label="Sleep Risk" value={report.sleep_risk} />
                  <LifestyleItem icon="📱" label="Screen Time Risk" value={report.screen_risk} />
                  <LifestyleItem icon="🧠" label="Self-Rated Stress" value={report.stress_self} />
                </div>
              </div>

              {/* Clinical Disclaimer */}
              <div style={disclaimer}>
                <strong>⚕️ Important:</strong> This assessment is for educational purposes only and does not replace professional medical advice. If you are experiencing severe distress, please consult a licensed mental health professional.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LifestyleItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const isHigh = value === "high" || value === "severe" || value === "extremely_severe";
  const color = isHigh ? "#ef4444" : value === "moderate" ? "#f59e0b" : "#10b981";
  return (
    <div style={{ background: "#f9fafb", borderRadius: 12, padding: "0.85rem", border: "1px solid #f0f0f0" }}>
      <div style={{ fontSize: 20, marginBottom: "0.3rem" }}>{icon}</div>
      <div style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color, fontSize: "0.9rem", textTransform: "capitalize" }}>{value || "—"}</div>
    </div>
  );
}

/* ── Styles ── */
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(4px)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const modal: React.CSSProperties = {
  background: "white",
  borderRadius: 24,
  width: "100%",
  maxWidth: 820,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
  overflow: "hidden",
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "1.5rem 1.75rem",
  borderBottom: "1px solid #f0f0f0",
  gap: "1rem",
  flexWrap: "wrap",
};

const body: React.CSSProperties = {
  padding: "1.5rem 1.75rem",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const retakeBtn: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: 10,
  border: "1.5px solid #6366f1",
  background: "#eef2ff",
  color: "#4338ca",
  fontWeight: 700,
  fontSize: "0.85rem",
  cursor: "pointer",
};

const closeBtn: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderRadius: 10,
  border: "1.5px solid #e5e7eb",
  background: "white",
  color: "#6b7280",
  fontWeight: 700,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const overallBadge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1.1rem 1.25rem",
  borderRadius: 16,
};

const domainsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

const domainCard: React.CSSProperties = {
  background: "#fafafa",
  borderRadius: 16,
  padding: "1.25rem",
  border: "1px solid #f0f0f0",
};

const pill: React.CSSProperties = {
  padding: "0.2rem 0.6rem",
  borderRadius: 99,
  fontSize: "0.75rem",
  fontWeight: 700,
};

const sectionCard: React.CSSProperties = {
  background: "#fafafa",
  borderRadius: 16,
  padding: "1.25rem",
  border: "1px solid #f0f0f0",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 0.85rem",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "#374151",
};

const disclaimer: React.CSSProperties = {
  background: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: 12,
  padding: "0.9rem 1.1rem",
  fontSize: "0.82rem",
  color: "#92400e",
  lineHeight: 1.6,
};
