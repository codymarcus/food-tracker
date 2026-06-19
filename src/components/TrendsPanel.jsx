import { useState } from 'react'
import { localDateStr, shiftDate } from '../utils/dates.js'
import { goalsAt } from '../utils/goals.js'
import { WORKOUT_TYPES, workoutEmoji } from '../utils/workouts.js'
import LineChart from './LineChart.jsx'

const STEPS_GOAL = 10000

function buildDateRange(days) {
  const today = localDateStr()
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    dates.push(shiftDate(today, -i))
  }
  return dates
}

function dailyCalories(log, date) {
  const entries = log[date]
  if (!entries?.length) return null
  const total = entries.reduce((sum, e) => sum + (e.calories || 0), 0)
  return total > 0 ? Math.round(total) : null
}

function average(values) {
  const nonNull = values.filter(v => v !== null && v !== undefined)
  if (!nonNull.length) return null
  return nonNull.reduce((a, b) => a + b, 0) / nonNull.length
}

export default function TrendsPanel({ log, health, goalHistory, onClose }) {
  const [range, setRange] = useState(7)
  const dates = buildDateRange(range)

  const caloriesData = dates.map(date => ({ date, value: dailyCalories(log, date) }))
  const weightData   = dates.map(date => ({ date, value: health[date]?.weight ?? null }))
  const stepsData    = dates.map(date => ({ date, value: health[date]?.steps  ?? null }))

  const calorieGoalData = dates.map(date => ({ date, value: goalsAt(goalHistory, date).calories }))
  const stepsGoalData   = dates.map(date => ({ date, value: STEPS_GOAL }))
  const workoutMarkers  = dates.map(date => ({ date, emoji: workoutEmoji(health[date]?.workout) }))
  const hasWorkoutMarkers = workoutMarkers.some(m => m.emoji)

  // Exclude today — its totals are still in progress and would skew the average down
  const avgCalories = average(caloriesData.slice(0, -1).map(d => d.value))
  const avgSteps    = average(stepsData.slice(0, -1).map(d => d.value))

  const weighIns = weightData.filter(d => d.value !== null)
  const weightDiff = weighIns.length >= 2
    ? Math.round((weighIns[weighIns.length - 1].value - weighIns[0].value) * 10) / 10
    : null

  return (
    <div className="trends-panel">
      <div className="panel-header">
        <h3>Trends</h3>
        <button className="btn-ghost small" onClick={onClose}>✕</button>
      </div>
      <div className="trends-range-toggle">
        <button className={`toggle-btn ${range === 7  ? 'active' : ''}`} onClick={() => setRange(7)}>7 Days</button>
        <button className={`toggle-btn ${range === 30 ? 'active' : ''}`} onClick={() => setRange(30)}>30 Days</button>
      </div>

      <div className="trend-stats">
        <div className="trend-stat">
          <span className="trend-stat-label">Avg Calories</span>
          <span className="trend-stat-value">
            {avgCalories != null ? Math.round(avgCalories).toLocaleString() : '—'}
          </span>
        </div>
        <div className="trend-stat">
          <span className="trend-stat-label">Avg Steps</span>
          <span className="trend-stat-value">
            {avgSteps != null ? Math.round(avgSteps).toLocaleString() : '—'}
          </span>
        </div>
        <div className="trend-stat">
          <span className="trend-stat-label">Weight Change</span>
          <span className="trend-stat-value">
            {weightDiff != null ? `${weightDiff > 0 ? '+' : ''}${weightDiff} lbs` : '—'}
          </span>
        </div>
      </div>

      <LineChart
        title="Calories" data={caloriesData} unit="cal" color="#22c55e"
        refLine={{ data: calorieGoalData, color: '#15803d', label: 'Goal' }}
        markers={workoutMarkers}
      />
      {hasWorkoutMarkers && (
        <p className="chart-marker-legend">
          {WORKOUT_TYPES.map(w => `${w.emoji} ${w.label}`).join('   ')}
        </p>
      )}
      <LineChart title="Weight" data={weightData} unit="lbs" color="#3b82f6" />
      <LineChart
        title="Steps" data={stepsData} unit="steps" color="#f97316"
        refLine={{ data: stepsGoalData, color: '#c2410c', label: '10,000' }}
      />
    </div>
  )
}
