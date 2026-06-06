import { useState, useEffect } from 'react'

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

  const workoutCompleted = metrics.workout?.completed ?? null

  function toggleWorkout() {
    if (workoutCompleted === null || workoutCompleted === false) {
      onChange({ workout: { completed: true } })
    } else {
      onChange({ workout: { completed: false } })
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

        <div className="health-field health-field-workout">
          <span className="health-field-label">Workout</span>
          <button
            className={`workout-toggle ${workoutCompleted === true ? 'active' : ''}`}
            onClick={toggleWorkout}
          >
            {workoutCompleted === true ? '✓ Done' : 'Log'}
          </button>
        </div>
      </div>
    </div>
  )
}
