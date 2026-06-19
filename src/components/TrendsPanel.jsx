import { useState } from 'react'
import { goalsAt } from '../utils/goals.js'
import { WORKOUT_TYPES, workoutEmoji } from '../utils/workouts.js'
import { buildDateRange, dailyCalories, dailyProtein, average, movingAverage, rateOfLossPerWeek } from '../utils/trends.js'
import LineChart from './LineChart.jsx'

export default function TrendsPanel({ log, health, goalHistory, onClose }) {
  const [range, setRange] = useState(7)
  const dates = buildDateRange(range)
  const lastIndex = dates.length - 1
  const todayGoals = goalsAt(goalHistory, dates[lastIndex])

  const caloriesData = dates.map(date => ({ date, value: dailyCalories(log, date) }))
  const proteinData  = dates.map(date => ({ date, value: dailyProtein(log, date) }))
  const weightData   = dates.map(date => ({ date, value: health[date]?.weight ?? null }))
  const stepsData    = dates.map(date => ({ date, value: health[date]?.steps  ?? null }))

  const weightMA = movingAverage(weightData.map(d => d.value), 7)
  const weightMAData = dates.map((date, i) => ({ date, value: weightMA[i] }))

  const calorieGoalData = dates.map(date => ({ date, value: goalsAt(goalHistory, date).calories }))
  const stepsGoalData   = dates.map(date => ({ date, value: goalsAt(goalHistory, date).stepsGoal }))
  const proteinGoalData = dates.map(date => ({ date, value: goalsAt(goalHistory, date).protein }))
  const workoutMarkers  = dates.map(date => ({ date, emoji: workoutEmoji(health[date]?.workout) }))
  const hasWorkoutMarkers = workoutMarkers.some(m => m.emoji)

  // Exclude today — its total is still in progress and would skew the average down
  const avgCalories = average(caloriesData.slice(0, -1).map(d => d.value))

  const weighIns = weightData.filter(d => d.value !== null)
  const weightDiff = weighIns.length >= 2
    ? Math.round((weighIns[weighIns.length - 1].value - weighIns[0].value) * 10) / 10
    : null

  const rateOfLoss = rateOfLossPerWeek(weightData.map(d => d.value))

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
          <span className="trend-stat-label">Weight Change</span>
          <span className="trend-stat-value">
            {weightDiff != null ? `${weightDiff > 0 ? '+' : ''}${weightDiff} lbs` : '—'}
          </span>
        </div>
        <div className="trend-stat">
          <span className="trend-stat-label">Rate of Loss</span>
          <span className="trend-stat-value">
            {rateOfLoss != null ? `${rateOfLoss > 0 ? '+' : ''}${rateOfLoss.toFixed(1)}/wk` : '—'}
          </span>
        </div>
      </div>

      <LineChart
        title="Weight" data={weightData} unit="lbs" color="#3b82f6"
        band={{ low: todayGoals.weightLow, high: todayGoals.weightHigh, color: '#3b82f6' }}
        secondaryLine={{ data: weightMAData, color: '#1d4ed8', label: '7-day avg' }}
      />

      <LineChart
        title="Calories" data={caloriesData} unit="cal" color="#22c55e"
        refLine={{ data: calorieGoalData, color: '#15803d', label: 'Goal' }}
        partialFromIndex={lastIndex}
      />

      <LineChart
        title="Steps" data={stepsData} unit="steps" color="#f97316"
        refLine={{ data: stepsGoalData, color: '#c2410c', label: 'Goal' }}
        markers={workoutMarkers} markerPlacement="value" compact
      />
      {hasWorkoutMarkers && (
        <p className="chart-marker-legend">
          {WORKOUT_TYPES.map(w => `${w.emoji} ${w.label}`).join('   ')} — flat ≠ rest
        </p>
      )}

      <LineChart
        title="Protein" data={proteinData} unit="g" color="#3b82f6"
        refLine={{ data: proteinGoalData, color: '#1d4ed8', label: 'Floor' }}
        partialFromIndex={lastIndex}
        compact
      />
    </div>
  )
}
