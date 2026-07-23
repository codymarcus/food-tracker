import { useState, useEffect } from 'react'
import { WORKOUT_TYPES, workoutCarbBonus, workoutCalorieBonus } from '../utils/workouts.js'

export default function HealthMetrics({ metrics, onChange }) {
  const [weight, setWeight] = useState(metrics.weight ?? '')
  const [steps, setSteps]   = useState(metrics.steps  ?? '')
  const [hoursDraft, setHoursDraft] = useState(metrics.workout?.hours ?? {})

  // Sync when date changes (metrics prop changes)
  useEffect(() => {
    setWeight(metrics.weight ?? '')
    setSteps(metrics.steps   ?? '')
    setHoursDraft(metrics.workout?.hours ?? {})
  }, [metrics])

  function commitWeight() {
    const val = weight === '' ? null : Number(weight)
    if (!isNaN(val)) onChange({ weight: val })
  }

  function commitSteps() {
    const val = steps === '' ? null : Math.round(Number(steps))
    if (!isNaN(val)) onChange({ steps: val })
  }

  const selectedTypes = metrics.workout?.types ?? []
  const hours = metrics.workout?.hours ?? {}

  function toggleWorkoutType(type) {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    const nextHours = { ...hours }
    if (!next.includes(type)) delete nextHours[type]
    onChange({ workout: { completed: next.length > 0, types: next, hours: nextHours } })
  }

  function commitHours(type) {
    const raw = hoursDraft[type]
    const val = raw === '' || raw === undefined ? null : Number(raw)
    const nextHours = { ...hours }
    if (val === null || isNaN(val) || val <= 0) delete nextHours[type]
    else nextHours[type] = val
    onChange({ workout: { completed: selectedTypes.length > 0, types: selectedTypes, hours: nextHours } })
  }

  const carbBonus = workoutCarbBonus(metrics.workout)
  const calorieBonus = workoutCalorieBonus(metrics.workout)

  return (
    <div className="health-metrics">
      <div className="health-metrics-row">
        <div className="health-field">
          <span className="health-field-label">Weight</span>
          <div className="health-input-wrap">
            <input
              className="health-input"
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              onBlur={commitWeight}
            />
            <span className="health-unit">lbs</span>
          </div>
        </div>

        <div className="health-field">
          <span className="health-field-label">Steps</span>
          <div className="health-input-wrap">
            <input
              className="health-input"
              type="text"
              inputMode="numeric"
              placeholder="—"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              onBlur={commitSteps}
            />
          </div>
        </div>
      </div>

      <div className="health-field health-field-workout">
        <span className="health-field-label">Workout</span>
        <div className="workout-options">
          {WORKOUT_TYPES.map(({ key, label }) => (
            <button
              key={key}
              className={`workout-toggle ${selectedTypes.includes(key) ? 'active' : ''}`}
              onClick={() => toggleWorkoutType(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {WORKOUT_TYPES.filter(w => w.tracksHours && selectedTypes.includes(w.key)).map(w => (
          <label key={w.key} className="workout-hours-row">
            <span>{w.label} — how many hours?</span>
            <div className="health-input-wrap">
              <input
                className="health-input small"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={hoursDraft[w.key] ?? ''}
                onChange={e => setHoursDraft(prev => ({ ...prev, [w.key]: e.target.value }))}
                onBlur={() => commitHours(w.key)}
              />
              <span className="health-unit">hrs</span>
            </div>
          </label>
        ))}

        {carbBonus > 0 && (
          <p className="workout-carb-bonus">
            +{carbBonus}g carbs (+{calorieBonus} cal) added to today's goal
          </p>
        )}
      </div>
    </div>
  )
}
