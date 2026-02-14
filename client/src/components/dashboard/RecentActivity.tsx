import "../../styles/Dashboard.css";

export default function RecentActivity() {
  return (
    <div className="dash-card full-width">
      <h3>Recent Activity</h3>

      <ul className="activity-list">
        <li>📓 Journaled about stress — <span>Today</span></li>
        <li>🙂 Mood check-in — <span>Yesterday</span></li>
        <li>🧘 Completed breathing exercise — <span>2 days ago</span></li>
      </ul>
    </div>
  );
}
