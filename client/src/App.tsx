import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MoodPage from "./pages/MoodPage";
import JournalPage from "./pages/JournalPage";
import ChatbotPage from "./pages/ChatbotPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ActivityPlayer from "./pages/ActivityPlayer";
import ActivityResult from "./pages/ActivityResult";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import DassAssessmentPage from "./pages/DassAssessmentPage";
import ConsentPage from "./pages/ConsentPage";
import TherapistsPage from "./pages/TherapistsPage";

/** Must be logged in */
function AuthOnly({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

/** Logged-in but must complete DASS first */
function AssessmentRoute({ children }: { children: JSX.Element }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.dass_completed) return <Navigate to="/consent" replace />;
  return children;
}

/** Logged-in + DASS done, must give consent */
function ConsentRoute({ children }: { children: JSX.Element }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user?.dass_completed) return <Navigate to="/assessment" replace />;
  if (user?.ai_consent !== null && user?.ai_consent !== undefined)
    return <Navigate to="/dashboard" replace />;
  return children;
}

/** Full route: logged in + DASS done + consent given */
function FullRoute({ children }: { children: JSX.Element }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user?.dass_completed) return <Navigate to="/assessment" replace />;
  if (user?.ai_consent === null || user?.ai_consent === undefined)
    return <Navigate to="/consent" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding flow */}
      <Route path="/assessment" element={<AssessmentRoute><DassAssessmentPage /></AssessmentRoute>} />
      <Route path="/consent" element={<ConsentRoute><ConsentPage /></ConsentRoute>} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={<FullRoute><DashboardPage /></FullRoute>} />
      <Route path="/mood" element={<FullRoute><MoodPage /></FullRoute>} />
      <Route path="/journal" element={<FullRoute><JournalPage /></FullRoute>} />
      <Route path="/chatbot" element={<FullRoute><ChatbotPage /></FullRoute>} />
      <Route path="/activities" element={<FullRoute><ActivitiesPage /></FullRoute>} />
      <Route path="/activity-player" element={<FullRoute><ActivityPlayer /></FullRoute>} />
      <Route path="/activity-result" element={<FullRoute><ActivityResult /></FullRoute>} />
      <Route path="/history" element={<FullRoute><HistoryPage /></FullRoute>} />
      <Route path="/profile" element={<FullRoute><ProfilePage /></FullRoute>} />
      <Route path="/therapists" element={<FullRoute><TherapistsPage /></FullRoute>} />

      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>404 — Page not found</h2>
            <p>The page you're looking for doesn't exist. <a href="/">Go home</a></p>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
