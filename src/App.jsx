import { useState, useEffect } from 'react'
import { localDateStr } from './utils/dates.js'
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

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export default function App() {
  const [date, setDate]       = useState(localDateStr)
  const [log, setLog]         = useState(() => load(LOG_KEY, {}))
  const [goals, setGoals]     = useState(() => load(GOALS_KEY, DEFAULT_GOALS))
  const [library, setLibrary] = useState(() => load(LIBRARY_KEY, []))
  const [health, setHealth]   = useState(() => load(HEALTH_KEY, {}))
  const [panel, setPanel]     = useState(null)

  useEffect(() => { localStorage.setItem(LOG_KEY,     JSON.stringify(log))     }, [log])
  useEffect(() => { localStorage.setItem(GOALS_KEY,   JSON.stringify(goals))   }, [goals])
  useEffect(() => { localStorage.setItem(LIBRARY_KEY, JSON.stringify(library)) }, [library])
  useEffect(() => { localStorage.setItem(HEALTH_KEY,  JSON.stringify(health))  }, [health])

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

      {panel === 'goals'   && <GoalEditor goals={goals} onChange={setGoals} onClose={() => setPanel(null)} />}
      {panel === 'library' && <FoodLibrary library={library} onDelete={deleteFood} onClose={() => setPanel(null)} />}
      {panel === 'trends'  && <TrendsPanel log={log} health={health} onClose={() => setPanel(null)} />}
      {panel === 'export'  && <ExportPanel log={log} health={health} goals={goals} library={library} onClose={() => setPanel(null)} />}

      <DateNav date={date} onChange={setDate} />
      <MacroSummary totals={totals} goals={goals} />
      <HealthMetrics metrics={health[date] || {}} onChange={updateHealthMetrics} />
      <AddFoodForm library={library} onAdd={addEntry} onSaveFood={saveFood} />
      <FoodLog entries={entries} onRemove={removeEntry} />
    </div>
  )
}
