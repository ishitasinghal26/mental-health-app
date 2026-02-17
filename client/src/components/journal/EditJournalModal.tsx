import "../../styles/Journal.css";
import "../../styles/Dashboard.css";

type Props = {
  entry: any;
  onClose: () => void;
  onSave: (updated: any) => void;
  onUpdate: () => void;   // NEW
};

const MOODS = ["Happy", "Calm", "Neutral", "Sad", "Stressed"];

export default function EditJournalModal({
  entry,
  onClose,
  onSave,
  onUpdate,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card large">
        <h3>Edit Journal Entry</h3>

        <input
          className="journal-input"
          value={entry.title}
          onChange={(e) =>
            onSave({ ...entry, title: e.target.value })
          }
        />

        <textarea
          className="journal-textarea"
          value={entry.content}
          onChange={(e) =>
            onSave({ ...entry, content: e.target.value })
          }
        />

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

        <input
          className="journal-input"
          value={entry.tags.join(", ")}
          onChange={(e) =>
            onSave({
              ...entry,
              tags: e.target.value.split(",").map((t) => t.trim()),
            })
          }
        />

        {/* ✅ ACTION BUTTONS */}
        <div className="modal-actions">
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
