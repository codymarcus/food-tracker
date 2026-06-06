import { exportCSV, exportJSON } from '../utils/export.js'

export default function ExportPanel({ log, health, goals, library, onClose }) {
  return (
    <div className="goal-editor">
      <div className="panel-header">
        <h3>Export Data</h3>
        <button className="btn-ghost small" onClick={onClose}>✕</button>
      </div>
      <p className="export-description">
        Download all your tracked data for analysis in a spreadsheet or other tool.
      </p>
      <div className="export-actions">
        <button className="btn-primary" onClick={() => exportCSV(log, health)}>
          Download CSV
        </button>
        <button className="btn-ghost" onClick={() => exportJSON(log, health, goals, library)}>
          Download JSON
        </button>
      </div>
    </div>
  )
}
