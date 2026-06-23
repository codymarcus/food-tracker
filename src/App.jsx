import { useState, useEffect } from 'react'
import { localDateStr } from './utils/dates.js'
import { migrateGoals, goalsAt } from './utils/goals.js'
import { migrateHealth, workoutCarbBonus } from './utils/workouts.js'
import MacroSummary from './components/MacroSummary'
import FoodLog from './components/FoodLog'
import AddFoodForm from './components/AddFoodForm'
import DateNav from './components/DateNav'
import GoalEditor from './components/GoalEditor'
import FoodLibrary from './components/FoodLibrary'
import HealthMetrics from './components/HealthMetrics'
import TrendsPanel from './components/TrendsPanel'
import ExportPanel from './components/ExportPanel'
import './App.css'

const LOG_KEY     = 'food-tracker-log'
const GOALS_KEY   = 'food-tracker-goals'
const LIBRARY_KEY = 'food-tracker-library'
const HEALTH_KEY  = 'food-tracker-health'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

export default function App() {
  const [date, setDate]             = useState(localDateStr)
  const [log, setLog]               = useState(() => load(LOG_KEY, {}))
  const [goalHistory, setGoalHistory] = useState(() => migrateGoals(load(GOALS_KEY, null)))
  const [library, setLibrary]       = useState(() => load(LIBRARY_KEY, []))
  const [health, setHealth]         = useState(() => migrateHealth(load(HEALTH_KEY, {})))
  const [panel, setPanel]           = useState(null)

  useEffect(() => { localStorage.setItem(LOG_KEY,     JSON.stringify(log))         }, [log])
  useEffect(() => { localStorage.setItem(GOALS_KEY,   JSON.stringify(goalHistory)) }, [goalHistory])
  useEffect(() => { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))     }, [library])
  useEffect(() => { localStorage.setItem(HEALTH_KEY,  JSON.stringify(health))      }, [health])

  const goals = goalsAt(goalHistory, date)
  const carbBonus = workoutCarbBonus(health[date]?.workout)
  const displayGoals = carbBonus > 0 ? { ...goals, carbs: goals.carbs + carbBonus } : goals

  function updateGoals(newGoals) {
    const today = localDateStr()
    setGoalHistory(prev => {
      const without = prev.filter(g => g.date !== today)
      return [...without, { date: today, ...newGoals }].sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  const entries = log[date] || []

  function addEntry(entry) {
    setLog(prev => ({ ...prev, [date]: [...(prev[date] || []), { ...entry, id: Date.now() }] }))
  }

  function removeEntry(id) {
    setLog(prev => ({ ...prev, [date]: (prev[date] || []).filter(e => e.id !== id) }))
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

  function updateHealthMetrics(patch) {
    setHealth(prev => ({ ...prev, [date]: { ...(prev[date] || {}), ...patch } }))
  }

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein:  acc.protein  + (e.protein  || 0),
      carbs:    acc.carbs    + (e.carbs    || 0),
      fat:      acc.fat      + (e.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  function togglePanel(name) {
    setPanel(p => p === name ? null : name)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Food Tracker</h1>
        <div className="header-actions">
          <button className="btn-ghost small" onClick={() => togglePanel('trends')}>Trends</button>
          <button className="btn-ghost small" onClick={() => togglePanel('library')}>My Foods</button>
          <button className="btn-ghost small" onClick={() => togglePanel('goals')}>Goals</button>
          <button className="btn-ghost small" onClick={() => togglePanel('export')}>Export</button>
        </div>
      </header>

      {panel === 'goals'   && <GoalEditor goals={goals} onChange={updateGoals} onClose={() => setPanel(null)} />}
      {panel === 'library' && <FoodLibrary library={library} onDelete={deleteFood} onClose={() => setPanel(null)} />}
      {panel === 'trends'  && <TrendsPanel log={log} health={health} goalHistory={goalHistory} onClose={() => setPanel(null)} />}
      {panel === 'export'  && <ExportPanel log={log} health={health} goals={goalHistory} library={library} onClose={() => setPanel(null)} />}

      <DateNav date={date} onChange={setDate} />
      <MacroSummary totals={totals} goals={displayGoals} />
      <HealthMetrics metrics={health[date] || {}} onChange={updateHealthMetrics} />
      <AddFoodForm library={library} onAdd={addEntry} onSaveFood={saveFood} />
      <FoodLog entries={entries} onRemove={removeEntry} />
    </div>
  )
}
