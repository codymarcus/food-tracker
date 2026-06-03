import { useState, useRef, useEffect } from 'react'

const EMPTY_NEW = { name: '', type: 'weight', refGrams: '', unitLabel: '', calories: '', protein: '', carbs: '', fat: '' }

function calcMacros(food, input) {
  const multiplier = food.type === 'weight'
    ? (Number(input) || 0) / (food.refGrams || 1)
    : (Number(input) || 0)
  return {
    calories: Math.round(food.calories * multiplier),
    protein:  Math.round(food.protein  * multiplier * 10) / 10,
    carbs:    Math.round(food.carbs    * multiplier * 10) / 10,
    fat:      Math.round(food.fat      * multiplier * 10) / 10,
  }
}

export default function AddFoodForm({ library, onAdd, onSaveFood }) {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [showDrop, setShowDrop]   = useState(false)
  const [selected, setSelected]   = useState(null)
  const [amount, setAmount]       = useState('')
  const [defining, setDefining]   = useState(false)
  const [newFood, setNewFood]     = useState(EMPTY_NEW)
  const wrapRef = useRef()

  useEffect(() => {
    function handler(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!open) {
    return <button className="add-food-trigger" onClick={() => setOpen(true)}>+ Add Food</button>
  }

  const filtered = library.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  function selectFood(food) {
    setSelected(food)
    setQuery(food.name)
    setShowDrop(false)
    setDefining(false)
    setAmount('')
  }

  function startDefining() {
    setShowDrop(false)
    setDefining(true)
    setSelected(null)
    setNewFood({ ...EMPTY_NEW, name: query })
  }

  function setNew(field, val) {
    setNewFood(prev => ({ ...prev, [field]: val }))
  }

  function saveNew() {
    const food = {
      id: Date.now(),
      name: newFood.name.trim(),
      type: newFood.type,
      refGrams: newFood.type === 'weight' ? Number(newFood.refGrams) || 100 : null,
      unitLabel: newFood.type === 'unit' ? (newFood.unitLabel.trim() || 'unit') : null,
      calories: Number(newFood.calories) || 0,
      protein:  Number(newFood.protein)  || 0,
      carbs:    Number(newFood.carbs)    || 0,
      fat:      Number(newFood.fat)      || 0,
    }
    onSaveFood(food)
    setDefining(false)
    setNewFood(EMPTY_NEW)
    setSelected(food)
    setQuery(food.name)
    setAmount('')
  }

  function submit() {
    if (!selected || !amount) return
    const macros = calcMacros(selected, amount)
    const label = selected.type === 'weight'
      ? `${amount}g`
      : `${amount} ${selected.unitLabel}`
    onAdd({ name: selected.name, serving: label, ...macros })
    reset()
  }

  function reset() {
    setOpen(false)
    setQuery('')
    setSelected(null)
    setAmount('')
    setDefining(false)
    setNewFood(EMPTY_NEW)
    setShowDrop(false)
  }

  const preview = selected && amount ? calcMacros(selected, amount) : null

  return (
    <div className="add-food-form" ref={wrapRef}>
      <h3>Add Food</h3>

      {/* Search row */}
      {!defining && (
        <div className="search-wrap">
          <input
            className="input input-name"
            placeholder={library.length ? 'Search your foods…' : 'Search or add a food…'}
            value={query}
            autoFocus
            onChange={e => { setQuery(e.target.value); setSelected(null); setShowDrop(true) }}
            onFocus={() => setShowDrop(true)}
          />
          {showDrop && (
            <ul className="dropdown">
              {filtered.map(f => (
                <li key={f.id} onMouseDown={() => selectFood(f)}>
                  <span className="dd-name">{f.name}</span>
                  <span className="dd-meta">
                    {f.type === 'weight' ? `per ${f.refGrams}g` : `per ${f.unitLabel}`}
                  </span>
                </li>
              ))}
              <li className="dd-new" onMouseDown={startDefining}>
                + Add "{query || 'new food'}" to My Foods
              </li>
            </ul>
          )}
        </div>
      )}

      {/* Define new food */}
      {defining && (
        <div className="define-food">
          <div className="form-row">
            <label className="field-label">Food name</label>
            <input className="input input-name" value={newFood.name}
              autoFocus onChange={e => setNew('name', e.target.value)} />
          </div>

          <div className="form-row">
            <label className="field-label">Track by</label>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${newFood.type === 'weight' ? 'active' : ''}`}
                onClick={() => setNew('type', 'weight')}>Weight (g)</button>
              <button
                className={`toggle-btn ${newFood.type === 'unit' ? 'active' : ''}`}
                onClick={() => setNew('type', 'unit')}>Units</button>
            </div>
          </div>

          {newFood.type === 'weight' ? (
            <div className="form-row inline-row">
              <label className="field-label">Macros are per</label>
              <input className="input input-macro" type="number" min="1" placeholder="100"
                value={newFood.refGrams} onChange={e => setNew('refGrams', e.target.value)} />
              <span className="unit">g</span>
            </div>
          ) : (
            <div className="form-row inline-row">
              <label className="field-label">Unit name</label>
              <input className="input input-name" placeholder="e.g. egg, slice, cup"
                value={newFood.unitLabel} onChange={e => setNew('unitLabel', e.target.value)} />
            </div>
          )}

          <div className="macro-inputs">
            {[
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein',  label: 'Protein',  unit: 'g' },
              { key: 'carbs',    label: 'Carbs',    unit: 'g' },
              { key: 'fat',      label: 'Fat',      unit: 'g' },
            ].map(({ key, label, unit }) => (
              <label key={key} className="macro-input-label">
                <span>{label}</span>
                <input className="input input-macro" type="number" min="0" step="0.1"
                  placeholder="0" value={newFood[key]} onChange={e => setNew(key, e.target.value)} />
                <span className="unit">{unit}</span>
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={saveNew} disabled={!newFood.name.trim()}>
              Save & Log
            </button>
            <button className="btn-ghost" onClick={() => setDefining(false)}>Back</button>
          </div>
        </div>
      )}

      {/* Amount entry */}
      {selected && !defining && (
        <div className="amount-section">
          <div className="selected-badge">
            <span className="selected-name">{selected.name}</span>
            <span className="selected-ref">
              {selected.type === 'weight'
                ? `macros per ${selected.refGrams}g`
                : `macros per ${selected.unitLabel}`}
            </span>
          </div>
          <div className="amount-row">
            <input
              className="input input-macro amount-input"
              type="number"
              min="0"
              step={selected.type === 'weight' ? '1' : '0.5'}
              placeholder={selected.type === 'weight' ? 'grams' : 'quantity'}
              value={amount}
              autoFocus
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <span className="amount-unit">{selected.type === 'weight' ? 'g' : selected.unitLabel}</span>
          </div>
          {preview && (
            <div className="macro-preview">
              <span className="prev-item cal">{preview.calories} kcal</span>
              <span className="prev-item pro">P {preview.protein}g</span>
              <span className="prev-item carb">C {preview.carbs}g</span>
              <span className="prev-item fat">F {preview.fat}g</span>
            </div>
          )}
          <div className="form-actions">
            <button className="btn-primary" onClick={submit} disabled={!amount}>Add</button>
            <button className="btn-ghost" onClick={reset}>Cancel</button>
          </div>
        </div>
      )}

      {!selected && !defining && (
        <div className="form-actions" style={{ marginTop: 8 }}>
          <button className="btn-ghost" onClick={reset}>Cancel</button>
        </div>
      )}
    </div>
  )
}
