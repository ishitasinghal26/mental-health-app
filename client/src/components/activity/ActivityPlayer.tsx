import "./ActivityPlayer.css";

export default function ActivityPlayer({ activity, onClose }: any) {
  if (!activity) return null;

  return (
    <div className="player-overlay">
      <div className="player-card">
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>

        {/* Special breathing animation */}
        {activity.category === "Breathing" && (
          <div className="breathing-container">
            <div className="breathing-circle"></div>
            <p className="breathing-text">Breathe slowly...</p>
          </div>
        )}

        <button className="finish-btn" onClick={onClose}>
          Finish Activity
        </button>
      </div>
    </div>
  );
}
