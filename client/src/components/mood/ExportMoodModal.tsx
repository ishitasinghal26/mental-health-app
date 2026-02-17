import "../../styles/Mood.css";
import "../../styles/Dashboard.css";

type Props = {
  onClose: () => void;
  onExport: (opts: any) => void;
};

export default function ExportMoodModal({ onClose, onExport }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Export Mood Report</h3>

        <label>
          <input type="checkbox" id="chart" defaultChecked />
          Include Chart
        </label>

        <label>
          <input type="checkbox" id="entries" defaultChecked />
          Include Entries
        </label>

        <select id="range" className="journal-select">
          <option value="day">Particular Day</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>

        <div className="journal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            onClick={() =>
              onExport({
                includeChart: (document.getElementById("chart") as HTMLInputElement).checked,
                includeEntries: (document.getElementById("entries") as HTMLInputElement).checked,
                range: (document.getElementById("range") as HTMLSelectElement).value,
              })
            }
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
