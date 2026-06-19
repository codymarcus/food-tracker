import { useState } from 'react'

export default function GoalEditor({ goals, onChange, onClose }) {
  const [draft, setDraft] = useState(goals)

  function handle(field, val) {
    setDraft(prev => ({ ...prev, [field]: Number(val) || 0 }))
  }

  function handleNullable(field, val) {
    setDraft(prev => ({ ...prev, [field]: val === '' ? null : Number(val) }))
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

      <h3>Activity &amp; Weight</h3>
      <div className="goal-inputs">
        <label className="goal-input-label">
          <span>Steps Goal</span>
          <input
            className="input input-macro"
            type="number"
            min="0"
            value={draft.stepsGoal}
            onChange={e => handle('stepsGoal', e.target.value)}
          />
        </label>
        <label className="goal-input-label">
          <span>Target Low (lbs)</span>
          <input
            className="input input-macro"
            type="number"
            placeholder="—"
            value={draft.weightLow ?? ''}
            onChange={e => handleNullable('weightLow', e.target.value)}
          />
        </label>
        <label className="goal-input-label">
          <span>Target High (lbs)</span>
          <input
            className="input input-macro"
            type="number"
            placeholder="—"
            value={draft.weightHigh ?? ''}
            onChange={e => handleNullable('weightHigh', e.target.value)}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={save}>Save Goals</button>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
