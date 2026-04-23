import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppLogo from "../common/AppLogo";

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
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const aiEnabled = user?.ai_consent === true;

  function handleLogout() { logout(); navigate("/"); }

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <nav className="sticky top-0 z-50 bg-white/15 backdrop-blur-xl border-b border-white/25 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-15 flex items-center justify-between gap-3" style={{ height: 58 }}>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center shrink-0 no-underline">
          <AppLogo height={32} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center flex-wrap">
          {NAV_LINKS.map(l => {
            const active = location.pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium no-underline transition-all duration-200 whitespace-nowrap
                  ${active
                    ? "bg-white/40 backdrop-blur-sm text-rose-600 font-semibold shadow-sm border border-rose-200/40"
                    : "text-gray-600 hover:bg-white/25 hover:text-rose-500"
                  }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
          {aiEnabled && (
            <Link
              to="/chatbot"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold no-underline transition-all duration-200
                ${location.pathname === "/chatbot"
                  ? "bg-gradient-to-r from-rose-300 to-pink-300 text-white shadow-md"
                  : "bg-white/25 text-rose-500 hover:bg-white/40 border border-rose-200/40"
                }`}
            >
              <span>🤖</span>
              <span>AI Chat</span>
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mode pill */}
          <span className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
            aiEnabled
              ? "bg-rose-100/60 text-rose-600 border-rose-200/50"
              : "bg-emerald-100/60 text-emerald-700 border-emerald-200/50"
          }`}>
            {aiEnabled ? "🤖 AI mode" : "🔒 Private"}
          </span>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              id="navbar-avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 text-white font-bold text-sm border-2 border-white/40 shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              {initials}
            </button>

            {menuOpen && (
              <div
                className="absolute top-11 right-0 glass-card-strong min-w-[200px] overflow-hidden z-50 animate-fade-in"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-4 py-3 border-b border-white/20">
                  <div className="font-bold text-gray-800 text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <Link to="/profile"           className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-white/30 no-underline transition-colors">⚙️ Profile &amp; History</Link>
                <Link to="/profile?tab=badges" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-white/30 no-underline transition-colors">🏅 My Badges</Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/40 transition-colors border-t border-white/20 cursor-pointer bg-transparent border-x-0 border-b-0"
                >
                  🚪 Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden bg-white/25 border border-white/30 rounded-full w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-white/40 transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden glass-panel rounded-none border-t border-white/20 p-3 flex flex-col gap-1 animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          {NAV_LINKS.map(l => {
            const active = location.pathname === l.path;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium no-underline transition-all
                  ${active ? "bg-white/40 text-rose-600 font-semibold" : "text-gray-700 hover:bg-white/30"}`}
              >
                {l.icon} {l.label}
              </Link>
            );
          })}
          {aiEnabled && (
            <Link to="/chatbot" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-white/30 no-underline transition-all">
              🤖 AI Chat
            </Link>
          )}
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-white/30 no-underline transition-all">
            👤 Profile
          </Link>
        </div>
      )}
    </nav>
  );
}
