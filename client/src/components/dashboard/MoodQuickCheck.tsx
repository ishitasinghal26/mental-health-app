import "../../styles/Dashboard.css";

const moods = ["😄", "🙂", "😐", "😟", "😔"];

export default function MoodQuickCheck() {
  return (
    <div className="dash-card">
      <h3>How are you feeling right now?</h3>
      <div className="mood-row">
        {moods.map((mood) => (
          <button key={mood} className="mood-btn">
            {mood}
          </button>
        ))}
      </div>
      <p className="hint-text">
        Quick check-ins help track emotional patterns.
      </p>
    </div>
  );
}
