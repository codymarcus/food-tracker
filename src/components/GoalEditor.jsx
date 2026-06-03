import { useState } from 'react'

export default function GoalEditor({ goals, onChange, onClose }) {
  const [draft, setDraft] = useState(goals)

  function handle(field, val) {
    setDraft(prev => ({ ...prev, [field]: Number(val) || 0 }))
  }

  function save() {
    onChange(draft)
    onClose()
  }

  return (
    <div className="goal-editor">
      <h3>Daily Goals</h3>
      <div className="goal-inputs">
        {[
          { key: 'calories', label: 'Calories', unit: 'kcal' },
          { key: 'protein',  label: 'Protein',  unit: 'g' },
          { key: 'carbs',    label: 'Carbs',    unit: 'g' },
          { key: 'fat',      label: 'Fat',      unit: 'g' },
        ].map(({ key, label, unit }) => (
          <label key={key} className="goal-input-label">
            <span>{label} ({unit})</span>
            <input
              className="input input-macro"
              type="number"
              min="0"
              value={draft[key]}
              onChange={e => handle(key, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button className="btn-primary" onClick={save}>Save Goals</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
