import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

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

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
<<<<<<< HEAD

      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/mood" element={<ProtectedRoute><MoodPage /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
      <Route path="/activities" element={<ProtectedRoute><ActivitiesPage /></ProtectedRoute>} />
      <Route path="/activity-player" element={<ProtectedRoute><ActivityPlayer /></ProtectedRoute>} />
      <Route path="/activity-result" element={<ProtectedRoute><ActivityResult /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

=======
      <Route
  path="/mood"
  element={
    <ProtectedRoute>
      <MoodPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/journal"
  element={
    <ProtectedRoute>
      <JournalPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/chatbot"
  element={
    <ProtectedRoute>
      <ChatbotPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/activities"
  element={
    <ProtectedRoute>
      <ActivitiesPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>404 — Page not found</h2>
<<<<<<< HEAD
            <p>The page you're looking for doesn't exist. <a href="/">Go home</a></p>
=======
            <p>
              The page you're looking for doesn't exist. <a href="/">Go home</a>
            </p>
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
<<<<<<< HEAD

=======
>>>>>>> 15c026de024d9fe0400678d837f1f5deac47fcdc
