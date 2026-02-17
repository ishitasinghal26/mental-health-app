import "../../styles/Dashboard.css";

export default function SummaryCards() {
  return (
    <div className="summary-cards">
      <div className="summary-card">
        <h3>Current Streak</h3>
        <p className="summary-value">5 days</p>
        <span>Consistency matters 🌱</span>
      </div>

      <div className="summary-card">
        <h3>Average Mood</h3>
        <p className="summary-value">🙂 Calm</p>
        <span>Last 7 days</span>
      </div>

      <div className="summary-card">
        <h3>Journal Entries</h3>
        <p className="summary-value">12</p>
        <span>This month</span>
      </div>
    </div>
  );
}
