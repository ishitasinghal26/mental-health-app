import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { path: "/dashboard",       label: "Dashboard",       icon: "🏠" },
  { path: "/recommendations", label: "Recommendations", icon: "💡" },
  { path: "/mood",            label: "Mood",            icon: "💭" },
  { path: "/journal",         label: "Journal",         icon: "📓" },
  { path: "/activities",      label: "Activities",      icon: "🎯" },
  { path: "/therapists",      label: "Therapists",      icon: "🩺" },
];

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const aiEnabled = user?.ai_consent === true;

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav style={navWrap}>
      <div style={navInner}>
        {/* Logo */}
        <Link to="/dashboard" style={logo}>
          <span style={logoIcon}>🧠</span>
          <span style={logoText}>MindKare</span>
        </Link>

        {/* Desktop nav links */}
        <div style={linksRow}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              style={{
                ...navLink,
                ...(location.pathname === l.path ? navLinkActive : {}),
              }}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          ))}
          {aiEnabled && (
            <Link
              to="/chatbot"
              style={{
                ...navLink,
                ...(location.pathname === "/chatbot" ? navLinkActive : {}),
                background: location.pathname === "/chatbot" ? "#eef2ff" : "linear-gradient(135deg,#eef2ff,#fdf4ff)",
                color: "#4338ca",
                fontWeight: 700,
              }}
            >
              <span>🤖</span>
              <span>AI Chat</span>
            </Link>
          )}
        </div>

        {/* Right side */}
        <div style={rightSide}>
          {/* Mode pill */}
          <div style={{ ...modePill, ...(aiEnabled ? modePillAI : modePillPrivate) }}>
            {aiEnabled ? "🤖 AI mode" : "🔒 Private"}
          </div>

          {/* Avatar dropdown */}
          <div style={{ position: "relative" }}>
            <button
              id="navbar-avatar"
              style={avatarBtn}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {initials}
            </button>
            {menuOpen && (
              <div style={dropdown} onClick={() => setMenuOpen(false)}>
                <div style={dropdownHeader}>
                  <div style={{ fontWeight: 700, color: "#111" }}>{user?.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{user?.email}</div>
                </div>
                <Link to="/profile" style={dropdownItem}>⚙️ Profile &amp; History</Link>
                <Link to="/profile?tab=badges" style={dropdownItem}>🏅 My Badges</Link>
                <button style={dropdownItemBtn} onClick={handleLogout}>🚪 Sign out</button>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button style={burgerBtn} onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={mobileMenu} onClick={() => setMobileOpen(false)}>
          {NAV_LINKS.map((l) => (
            <Link key={l.path} to={l.path} style={{
              ...mobileLink,
              ...(location.pathname === l.path ? { background: "#eef2ff", color: "#4338ca" } : {}),
            }}>
              {l.icon} {l.label}
            </Link>
          ))}
          {aiEnabled && <Link to="/chatbot" style={{ ...mobileLink, color: "#4338ca" }}>🤖 AI Chat</Link>}
          <Link to="/profile" style={mobileLink}>👤 Profile &amp; History</Link>
        </div>
      )}
    </nav>
  );
}

/* ── Styles ── */
const navWrap: React.CSSProperties = {
  position: "sticky", top: 0, zIndex: 100,
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #f0f0f0",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

const navInner: React.CSSProperties = {
  maxWidth: 1280, margin: "0 auto", padding: "0 1.25rem",
  height: 60, display: "flex", alignItems: "center",
  justifyContent: "space-between", gap: "0.75rem",
};

const logo: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.5rem",
  textDecoration: "none", flexShrink: 0,
};

const logoIcon: React.CSSProperties = { fontSize: 22 };
const logoText: React.CSSProperties = {
  fontWeight: 800, fontSize: "1.1rem",
  background: "linear-gradient(135deg,#6366f1,#a855f7)",
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
};

const linksRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.15rem",
  flex: 1, justifyContent: "center", flexWrap: "wrap",
};

const navLink: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.3rem",
  padding: "0.4rem 0.7rem", borderRadius: 10,
  textDecoration: "none", fontSize: "0.83rem",
  fontWeight: 500, color: "#6b7280", transition: "all 0.15s",
  whiteSpace: "nowrap",
};
const navLinkActive: React.CSSProperties = {
  background: "#eef2ff", color: "#4338ca", fontWeight: 700,
};

const rightSide: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0,
};
const modePill: React.CSSProperties = {
  padding: "0.28rem 0.7rem", borderRadius: 99,
  fontSize: "0.72rem", fontWeight: 700,
};
const modePillAI: React.CSSProperties = { background: "#eef2ff", color: "#4338ca" };
const modePillPrivate: React.CSSProperties = { background: "#f0fdf4", color: "#065f46" };

const avatarBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: "50%",
  background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white",
  border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const burgerBtn: React.CSSProperties = {
  display: "none", background: "none", border: "none",
  fontSize: "1.2rem", cursor: "pointer", color: "#6b7280",
  "@media(max-width:768px)": { display: "flex" },
} as React.CSSProperties;

const dropdown: React.CSSProperties = {
  position: "absolute", top: "calc(100% + 8px)", right: 0,
  background: "white", borderRadius: 16,
  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
  minWidth: 220, overflow: "hidden", zIndex: 200,
  border: "1px solid #f0f0f0",
};
const dropdownHeader: React.CSSProperties = {
  padding: "1rem 1.1rem 0.75rem", borderBottom: "1px solid #f5f5f5",
};
const dropdownItem: React.CSSProperties = {
  display: "block", padding: "0.7rem 1.1rem",
  fontSize: "0.9rem", color: "#374151", textDecoration: "none", cursor: "pointer",
};
const dropdownItemBtn: React.CSSProperties = {
  display: "block", width: "100%", padding: "0.7rem 1.1rem",
  fontSize: "0.9rem", color: "#dc2626", background: "none",
  border: "none", textAlign: "left", cursor: "pointer",
};

const mobileMenu: React.CSSProperties = {
  display: "flex", flexDirection: "column",
  borderTop: "1px solid #f0f0f0", padding: "0.5rem",
  background: "white",
};
const mobileLink: React.CSSProperties = {
  padding: "0.75rem 1rem", borderRadius: 10, textDecoration: "none",
  color: "#374151", fontWeight: 500, fontSize: "0.9rem",
};
