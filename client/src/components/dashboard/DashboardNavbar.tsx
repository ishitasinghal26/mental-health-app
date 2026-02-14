import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Dashboard.css";

export default function DashboardNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="dash-nav">
      {/* LEFT */}
      <div className="dash-left">
        <span className="dash-logo">MindCare</span>

        <nav className="dash-links">
          <NavLink to="/dashboard" className="dash-link">
            Dashboard
          </NavLink>
          <NavLink to="/mood" className="dash-link">
            Mood
          </NavLink>
          <NavLink to="/journal" className="dash-link">
            Journal
          </NavLink>
          <NavLink to="/chatbot" className="dash-link">
            AI Chat
          </NavLink>
          <NavLink to="/activities" className="dash-link">
            Activities
          </NavLink>
          <NavLink to="/profile" className="dash-link">
            Profile
          </NavLink>
        </nav>
      </div>

      {/* RIGHT */}
      <div className="dash-user">
        <span className="dash-username">Hi, {user?.name}</span>
        <button className="dash-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
