import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MoodPage from "../pages/MoodPage";
import ProfilePage from "../pages/ProfilePage";
import ActivitiesPage from "../pages/ActivitiesPage";
import ActivityPlayer from "../pages/ActivityPlayer";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main pages */}
        <Route path="/dashboard" element={<MoodPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />

        {/* IMPORTANT — PLAYER PAGE (must be INSIDE Routes) */}
        <Route path="/activity-player" element={<ActivityPlayer />} />

        {/* Default */}
        <Route path="*" element={<LoginPage />} />

      </Routes>
    </Router>
  );
}



