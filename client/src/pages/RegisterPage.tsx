import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  function validate() {
    if (!name.trim() || name.trim().length < 2) return "Enter your full name (at least 2 characters).";
    if (!email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password);
      navigate("/assessment");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        {/* Logo */}
        <div style={logoRow}>
          <span style={{ fontSize: 28 }}>🧠</span>
          <span style={logoText}>MindKare</span>
        </div>

        <h1 style={heading}>Create your account</h1>
        <p style={sub}>Start your journey toward better mental wellness.</p>

        <form onSubmit={handleSubmit} style={form} noValidate>
          <div>
            <label style={label}>Full name</label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              style={input}
              autoComplete="name"
            />
          </div>

          <div>
            <label style={label}>Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={input}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="register-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={input}
                autoComplete="new-password"
              />
              <button
                type="button"
                style={showBtn}
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label style={label}>Confirm password</label>
            <input
              id="register-confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              style={{
                ...input,
                borderColor: confirm && confirm !== password ? "#ef4444" : undefined,
              }}
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 4 }}>Passwords do not match.</p>
            )}
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <button
            id="register-submit"
            type="submit"
            style={{ ...submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up →"}
          </button>
        </form>

        <p style={footer}>
          Already have an account?{" "}
          <Link to="/login" style={link}>Login</Link>
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
  padding: "1.5rem",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 460,
  background: "white",
  borderRadius: 24,
  padding: "2.5rem 2rem",
  boxShadow: "0 24px 70px rgba(99,102,241,0.13)",
};

const logoRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};

const logoText: React.CSSProperties = {
  fontWeight: 800,
  fontSize: "1.2rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heading: React.CSSProperties = {
  fontSize: "1.65rem",
  fontWeight: 800,
  color: "#111827",
  margin: "0 0 6px",
};

const sub: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "0.95rem",
  marginBottom: "1.75rem",
};

const form: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.35rem",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: 10,
  border: "1.5px solid #e5e7eb",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const showBtn: React.CSSProperties = {
  position: "absolute",
  right: "0.75rem",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "#6366f1",
  fontWeight: 600,
  fontSize: "0.82rem",
  cursor: "pointer",
  padding: 0,
};

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#dc2626",
  border: "1px solid #fecaca",
  borderRadius: 10,
  padding: "0.65rem 0.9rem",
  fontSize: "0.88rem",
  fontWeight: 500,
};

const submitBtn: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  color: "white",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  transition: "opacity 0.2s",
  marginTop: "0.25rem",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "1.25rem",
  fontSize: "0.9rem",
  color: "#6b7280",
};

const link: React.CSSProperties = {
  color: "#6366f1",
  fontWeight: 700,
  textDecoration: "none",
};
