import { useState, useEffect } from 'react'
import { WORKOUT_TYPES } from '../utils/workouts.js'

export default function HealthMetrics({ metrics, onChange }) {
  const [weight, setWeight] = useState(metrics.weight ?? '')
  const [steps, setSteps]   = useState(metrics.steps  ?? '')

  // Sync when date changes (metrics prop changes)
  useEffect(() => {
    setWeight(metrics.weight ?? '')
    setSteps(metrics.steps   ?? '')
  }, [metrics])

  function commitWeight() {
    const val = weight === '' ? null : Number(weight)
    if (!isNaN(val)) onChange({ weight: val })
  }

  function commitSteps() {
    const val = steps === '' ? null : Math.round(Number(steps))
    if (!isNaN(val)) onChange({ steps: val })
  }

  const workoutType = metrics.workout?.completed ? metrics.workout.type ?? null : null

  function selectWorkout(type) {
    if (workoutType === type) {
      onChange({ workout: { completed: false, type: null } })
    } else {
      onChange({ workout: { completed: true, type } })
    }
  }

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
              className={`workout-toggle ${workoutType === key ? 'active' : ''}`}
              onClick={() => selectWorkout(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
