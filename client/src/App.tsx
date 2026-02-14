// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MoodPage from "./pages/MoodPage";
import JournalPage from "./pages/JournalPage";
import ChatbotPage from "./pages/ChatbotPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ProfilePage from "./pages/ProfilePage";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth();
  if (loading) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }
  return token ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>404 — Page not found</h2>
            <p>
              The page you're looking for doesn't exist. <a href="/">Go home</a>
            </p>
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
