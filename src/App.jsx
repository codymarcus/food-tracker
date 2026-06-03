import { useState, useEffect } from 'react'
import MacroSummary from './components/MacroSummary'
import FoodLog from './components/FoodLog'
import AddFoodForm from './components/AddFoodForm'
import DateNav from './components/DateNav'
import GoalEditor from './components/GoalEditor'
import './App.css'

const STORAGE_KEY = 'food-tracker-log'
const GOALS_KEY = 'food-tracker-goals'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export default function App() {
  const [date, setDate] = useState(todayKey)
  const [log, setLog] = useState(loadLog)
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(GOALS_KEY)) || DEFAULT_GOALS }
    catch { return DEFAULT_GOALS }
  })
  const [showGoals, setShowGoals] = useState(false)

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)) }, [log])
  useEffect(() => { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)) }, [goals])

  const entries = log[date] || []

  function addEntry(entry) {
    setLog(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), { ...entry, id: Date.now() }]
    }))
  }

  function removeEntry(id) {
    setLog(prev => ({
      ...prev,
      [date]: (prev[date] || []).filter(e => e.id !== id)
    }))
  }

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Tracker</h1>
        <button className="btn-ghost" onClick={() => setShowGoals(v => !v)}>
          {showGoals ? '✕ Close' : '⚙ Goals'}
        </button>
      </header>

      {showGoals && (
        <GoalEditor goals={goals} onChange={setGoals} onClose={() => setShowGoals(false)} />
      )}

      <DateNav date={date} onChange={setDate} />
      <MacroSummary totals={totals} goals={goals} />
      <AddFoodForm onAdd={addEntry} />
      <FoodLog entries={entries} onRemove={removeEntry} />
    </div>
  )
}
