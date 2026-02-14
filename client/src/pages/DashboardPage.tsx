import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import SummaryCards from "../components/dashboard/SummaryCards";
import MoodQuickCheck from "../components/dashboard/MoodQuickCheck";
import RecentActivity from "../components/dashboard/RecentActivity";
import AISuggestions from "../components/dashboard/AISuggestions";
import "../styles/Dashboard.css";

export default function DashboardPage() {
  return (
    <div className="dashboard-root">
      <DashboardNavbar />

      <main className="dashboard-content">
        <h1 className="dashboard-title">Your Dashboard</h1>
        <p className="dashboard-subtitle">
          A quick overview of your mental wellness journey
        </p>

        <SummaryCards />

        <div className="dashboard-grid">
          <MoodQuickCheck />
          <AISuggestions />
        </div>

        <RecentActivity />
      </main>
    </div>
  );
}
