import { useState, useEffect } from 'react'
import MacroSummary from './components/MacroSummary'
import FoodLog from './components/FoodLog'
import AddFoodForm from './components/AddFoodForm'
import DateNav from './components/DateNav'
import GoalEditor from './components/GoalEditor'
import FoodLibrary from './components/FoodLibrary'
import './App.css'

const LOG_KEY = 'food-tracker-log'
const GOALS_KEY = 'food-tracker-goals'
const LIBRARY_KEY = 'food-tracker-library'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export default function App() {
  const [date, setDate] = useState(todayKey)
  const [log, setLog] = useState(() => load(LOG_KEY, {}))
  const [goals, setGoals] = useState(() => load(GOALS_KEY, DEFAULT_GOALS))
  const [library, setLibrary] = useState(() => load(LIBRARY_KEY, []))
  const [panel, setPanel] = useState(null)

  useEffect(() => { localStorage.setItem(LOG_KEY, JSON.stringify(log)) }, [log])
  useEffect(() => { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)) }, [goals])
  useEffect(() => { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library)) }, [library])

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

  function saveFood(food) {
    setLibrary(prev => {
      const exists = prev.find(f => f.id === food.id)
      return exists ? prev.map(f => f.id === food.id ? food : f) : [...prev, food]
    })
  }

  function deleteFood(id) {
    setLibrary(prev => prev.filter(f => f.id !== id))
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
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => setPanel(p => p === 'library' ? null : 'library')}>
            My Foods
          </button>
          <button className="btn-ghost" onClick={() => setPanel(p => p === 'goals' ? null : 'goals')}>
            Goals
          </button>
        </div>
      </header>

      {panel === 'goals' && (
        <GoalEditor goals={goals} onChange={setGoals} onClose={() => setPanel(null)} />
      )}
      {panel === 'library' && (
        <FoodLibrary library={library} onDelete={deleteFood} onClose={() => setPanel(null)} />
      )}

      <DateNav date={date} onChange={setDate} />
      <MacroSummary totals={totals} goals={goals} />
      <AddFoodForm library={library} onAdd={addEntry} onSaveFood={saveFood} />
      <FoodLog entries={entries} onRemove={removeEntry} />
    </div>
  )
}
