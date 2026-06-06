import { useState, useRef, useEffect } from 'react'

const EMPTY_NEW    = { name: '', type: 'weight', refGrams: '', unitLabel: '', calories: '', protein: '', carbs: '', fat: '' }
const EMPTY_ONEOFF = { name: '', calories: '', protein: '', carbs: '', fat: '' }
const EMPTY_FIELDS = { amount: '', calories: '', protein: '', carbs: '', fat: '' }

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'cal' },
  { key: 'protein',  label: 'Protein',  unit: 'g' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g' },
  { key: 'fat',      label: 'Fat',      unit: 'g' },
]

function multiplierFor(food, amount) {
  return food.type === 'weight'
    ? (Number(amount) || 0) / (food.refGrams || 1)
    : (Number(amount) || 0)
}

function fmtMacro(key, v) {
  return key === 'calories' ? String(Math.round(v)) : String(Math.round(v * 10) / 10)
}

export default function AddFoodForm({ library, onAdd, onSaveFood }) {
  const [open, setOpen]         = useState(false)
  const [mode, setMode]         = useState('search')
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(null)
  const [fields, setFields]     = useState(EMPTY_FIELDS)
  const [newFood, setNewFood]   = useState(EMPTY_NEW)
  const [oneOff, setOneOff]     = useState(EMPTY_ONEOFF)
  const searchRef = useRef()

  useEffect(() => {
    if (open && mode === 'search') setTimeout(() => searchRef.current?.focus(), 80)
  }, [open, mode])

  function reset() {
    setOpen(false)
    setMode('search')
    setQuery('')
    setSelected(null)
    setFields(EMPTY_FIELDS)
    setNewFood(EMPTY_NEW)
    setOneOff(EMPTY_ONEOFF)
  }

  function selectFood(food) {
    setSelected(food)
    setFields(EMPTY_FIELDS)
    setMode('amount')
  }

  function startOneOff() {
    setOneOff({ ...EMPTY_ONEOFF, name: query })
    setMode('oneoff')
  }

  function startDefine() {
    setNewFood({ ...EMPTY_NEW, name: query })
    setMode('define')
  }

  function setNew(field, val) { setNewFood(prev => ({ ...prev, [field]: val })) }
  function setOff(field, val) { setOneOff(prev => ({ ...prev, [field]: val })) }

  // Bidirectional field handler: editing any field recalculates all others
  function handleField(food, key, val) {
    if (key === 'amount') {
      const a = Number(val) || 0
      const m = multiplierFor(food, val)
      setFields({
        amount: val,
        calories: a > 0 ? fmtMacro('calories', food.calories * m) : '',
        protein:  a > 0 ? fmtMacro('protein',  food.protein  * m) : '',
        carbs:    a > 0 ? fmtMacro('carbs',    food.carbs    * m) : '',
        fat:      a > 0 ? fmtMacro('fat',      food.fat      * m) : '',
      })
    } else {
      // Solve for amount from this macro, then derive the rest
      const rate = food.type === 'weight'
        ? food[key] / (food.refGrams || 1)
        : food[key]
      const target = Number(val) || 0
      const a = rate > 0 ? target / rate : 0
      const m = a > 0 ? multiplierFor(food, a) : 0
      const next = { ...EMPTY_FIELDS, [key]: val }
      if (a > 0) {
        next.amount = String(food.type === 'weight' ? Math.round(a * 10) / 10 : Math.round(a * 100) / 100)
        for (const mk of ['calories', 'protein', 'carbs', 'fat']) {
          if (mk !== key) next[mk] = fmtMacro(mk, food[mk] * m)
        }
      }
      setFields(next)
    }
  }

  function submitAmount() {
    if (!selected || !fields.amount) return
    const amtStr = fields.amount
    const label = selected.type === 'weight' ? `${amtStr}g` : `${amtStr} ${selected.unitLabel}`
    onAdd({
      name: selected.name,
      serving: label,
      calories: Number(fields.calories) || 0,
      protein:  Number(fields.protein)  || 0,
      carbs:    Number(fields.carbs)    || 0,
      fat:      Number(fields.fat)      || 0,
    })
    reset()
  }

  function submitOneOff() {
    if (!oneOff.name.trim()) return
    onAdd({
      name: oneOff.name.trim(),
      calories: Number(oneOff.calories) || 0,
      protein:  Number(oneOff.protein)  || 0,
      carbs:    Number(oneOff.carbs)    || 0,
      fat:      Number(oneOff.fat)      || 0,
    })
    reset()
  }

  function saveDefine() {
    const food = {
      id: Date.now(),
      name: newFood.name.trim(),
      type: newFood.type,
      refGrams:  newFood.type === 'weight' ? Number(newFood.refGrams) || 100 : null,
      unitLabel: newFood.type === 'unit'   ? (newFood.unitLabel.trim() || 'unit') : null,
      calories: Number(newFood.calories) || 0,
      protein:  Number(newFood.protein)  || 0,
      carbs:    Number(newFood.carbs)    || 0,
      fat:      Number(newFood.fat)      || 0,
    }
    onSaveFood(food)
    setSelected(food)
    setFields(EMPTY_FIELDS)
    setMode('amount')
  }

  const filtered = library.filter(f =>
    !query || f.name.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) {
    return <button className="fab" onClick={() => setOpen(true)}>+</button>
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={reset} />
      <div className="bottom-sheet">
        <div className="sheet-handle" />

        {/* SEARCH */}
        {mode === 'search' && (
          <>
            <h3 className="sheet-title">Add Food</h3>
            <ul className="sheet-results">
              {filtered.map(f => (
                <li key={f.id} onClick={() => selectFood(f)}>
                  <span className="dd-name">{f.name}</span>
                  <span className="dd-meta">
                    {f.type === 'weight' ? `per ${f.refGrams}g` : `per ${f.unitLabel}`}
                  </span>
                </li>
              ))}
              <li className="dd-new" onClick={startOneOff}>
                Log "{query || 'food'}" once (don't save)
              </li>
              <li className="dd-save" onClick={startDefine}>
                + Save "{query || 'food'}" to My Foods
              </li>
            </ul>
            <input
              ref={searchRef}
              className="input input-name search-bottom"
              placeholder="Search your foods…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </>
        )}

        {/* AMOUNT — bidirectional */}
        {mode === 'amount' && selected && (
          <>
            <button className="back-btn" onClick={() => setMode('search')}>← Back</button>
            <div className="selected-badge">
              <span className="selected-name">{selected.name}</span>
              <span className="selected-ref">
                {selected.type === 'weight'
                  ? `macros per ${selected.refGrams}g`
                  : `macros per ${selected.unitLabel}`}
              </span>
            </div>

            {/* Amount row */}
            <div className="bidir-amount-row">
              <label className="field-label">
                {selected.type === 'weight' ? 'Grams' : selected.unitLabel}
              </label>
              <input
                className="amount-big"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={fields.amount}
                autoFocus
                onChange={e => handleField(selected, 'amount', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAmount()}
              />
            </div>

            {/* Macro fields — all editable, all linked */}
            <div className="macro-inputs bidir-macros">
              {MACRO_FIELDS.map(({ key, label, unit }) => (
                <label key={key} className="macro-input-label">
                  <span>{label}</span>
                  <input
                    className="input input-macro"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={fields[key]}
                    onChange={e => handleField(selected, key, e.target.value)}
                  />
                  <span className="unit">{unit}</span>
                </label>
              ))}
            </div>

            <button className="btn-primary btn-full" onClick={submitAmount} disabled={!fields.amount}>
              Add to Log
            </button>
          </>
        )}

        {/* ONE-OFF */}
        {mode === 'oneoff' && (
          <>
            <button className="back-btn" onClick={() => setMode('search')}>← Back</button>
            <h3 className="sheet-title">Log Once</h3>
            <div className="form-row">
              <input className="input input-name" placeholder="Food name"
                value={oneOff.name} autoFocus
                onChange={e => setOff('name', e.target.value)} />
            </div>
            <div className="macro-inputs">
              {MACRO_FIELDS.map(({ key, label, unit }) => (
                <label key={key} className="macro-input-label">
                  <span>{label}</span>
                  <input className="input input-macro" type="text" inputMode="decimal"
                    placeholder="0" value={oneOff[key]}
                    onChange={e => setOff(key, e.target.value)} />
                  <span className="unit">{unit}</span>
                </label>
              ))}
            </div>
            <button className="btn-primary btn-full" onClick={submitOneOff} disabled={!oneOff.name.trim()}>
              Add to Log
            </button>
          </>
        )}

        {/* DEFINE NEW FOOD */}
        {mode === 'define' && (
          <>
            <button className="back-btn" onClick={() => setMode('search')}>← Back</button>
            <h3 className="sheet-title">Save to My Foods</h3>
            <div className="form-row">
              <label className="field-label">Food name</label>
              <input className="input input-name" value={newFood.name} autoFocus
                onChange={e => setNew('name', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="field-label">Track by</label>
              <div className="toggle-row">
                <button className={`toggle-btn ${newFood.type === 'weight' ? 'active' : ''}`}
                  onClick={() => setNew('type', 'weight')}>Weight (g)</button>
                <button className={`toggle-btn ${newFood.type === 'unit' ? 'active' : ''}`}
                  onClick={() => setNew('type', 'unit')}>Units</button>
              </div>
            </div>
            {newFood.type === 'weight' ? (
              <div className="form-row inline-row">
                <label className="field-label">Macros are per</label>
                <input className="input input-macro" type="text" inputMode="decimal" placeholder="100"
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
              {MACRO_FIELDS.map(({ key, label, unit }) => (
                <label key={key} className="macro-input-label">
                  <span>{label}</span>
                  <input className="input input-macro" type="text" inputMode="decimal"
                    placeholder="0" value={newFood[key]}
                    onChange={e => setNew(key, e.target.value)} />
                  <span className="unit">{unit}</span>
                </label>
              ))}
            </div>
            <button className="btn-primary btn-full" onClick={saveDefine} disabled={!newFood.name.trim()}>
              Save & Log
            </button>
          </>
        )}
      </div>
    </>
  )
}
