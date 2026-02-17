import "../../styles/Dashboard.css";

export default function AISuggestions() {
  return (
    <div className="dash-card">
      <h3>AI Suggestions</h3>
      <ul className="ai-list">
        <li>🧘 Try a 5-minute breathing exercise</li>
        <li>📓 Write a short gratitude journal</li>
        <li>🚶 Take a short walk away from screens</li>
      </ul>
      <p className="hint-text">
        Suggestions are based on your recent activity.
      </p>
    </div>
  );
}
