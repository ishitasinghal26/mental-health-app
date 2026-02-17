import "../../styles/Mood.css";
import "../../styles/Dashboard.css";

type Props = {
  entry: any;
  onClose: () => void;
  onSave: (updated: any) => void;
  onUpdate: () => void;
};

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

export default function EditMoodModal({
  entry,
  onClose,
  onSave,
  onUpdate,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Edit Mood Entry</h3>

        <select
          className="journal-select"
          value={entry.mood}
          onChange={(e) =>
            onSave({ ...entry, mood: e.target.value })
          }
        >
          {MOODS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <label>Intensity: {entry.intensity}</label>
        <input
          type="range"
          min="1"
          max="5"
          value={entry.intensity}
          onChange={(e) =>
            onSave({
              ...entry,
              intensity: Number(e.target.value),
            })
          }
          style={{ width: "100%" }}
        />

        <textarea
          className="journal-textarea"
          value={entry.note}
          onChange={(e) =>
            onSave({ ...entry, note: e.target.value })
          }
        />

        <div className="journal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button className="primary-btn" onClick={onUpdate}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
