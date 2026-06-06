import { useState } from 'react'
import { localDateStr, shiftDate } from '../utils/dates.js'
import LineChart from './LineChart.jsx'

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

export default function TrendsPanel({ log, health, onClose }) {
  const [range, setRange] = useState(7)
  const dates = buildDateRange(range)

  const caloriesData = dates.map(date => ({ date, value: dailyCalories(log, date) }))
  const weightData   = dates.map(date => ({ date, value: health[date]?.weight ?? null }))
  const stepsData    = dates.map(date => ({ date, value: health[date]?.steps  ?? null }))

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
      <LineChart title="Calories" data={caloriesData} unit="kcal"  color="#22c55e" />
      <LineChart title="Weight"   data={weightData}   unit="lbs"   color="#3b82f6" />
      <LineChart title="Steps"    data={stepsData}    unit="steps" color="#f97316" />
    </div>
  )
}
