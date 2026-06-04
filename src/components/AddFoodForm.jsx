import { useState, useRef, useEffect } from 'react'

const EMPTY_NEW    = { name: '', type: 'weight', refGrams: '', unitLabel: '', calories: '', protein: '', carbs: '', fat: '' }
const EMPTY_ONEOFF = { name: '', calories: '', protein: '', carbs: '', fat: '' }

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein',  label: 'Protein',  unit: 'g' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g' },
  { key: 'fat',      label: 'Fat',      unit: 'g' },
]

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
  const [open, setOpen]         = useState(false)
  const [mode, setMode]         = useState('search') // search | amount | oneoff | define
  const [query, setQuery]       = useState('')
  const [selected, setSelected] = useState(null)
  const [amount, setAmount]     = useState('')
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
    setAmount('')
    setNewFood(EMPTY_NEW)
    setOneOff(EMPTY_ONEOFF)
  }

  function selectFood(food) {
    setSelected(food)
    setAmount('')
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

  function submitAmount() {
    if (!selected || !amount) return
    const macros = calcMacros(selected, amount)
    const label = selected.type === 'weight' ? `${amount}g` : `${amount} ${selected.unitLabel}`
    onAdd({ name: selected.name, serving: label, ...macros })
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
    setAmount('')
    setMode('amount')
  }

  const filtered = library.filter(f =>
    !query || f.name.toLowerCase().includes(query.toLowerCase())
  )

  const preview = selected && amount && Number(amount) > 0 ? calcMacros(selected, amount) : null

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
            <input
              ref={searchRef}
              className="input input-name"
              placeholder="Search your foods…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
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
          </>
        )}

        {/* AMOUNT */}
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
            <div className="amount-center">
              <input
                className="amount-big"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                autoFocus
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitAmount()}
              />
              <span className="amount-unit-label">
                {selected.type === 'weight' ? 'grams' : selected.unitLabel}
              </span>
            </div>
            {preview && (
              <div className="macro-preview">
                <span className="prev-item cal">{preview.calories} kcal</span>
                <span className="prev-item pro">P {preview.protein}g</span>
                <span className="prev-item carb">C {preview.carbs}g</span>
                <span className="prev-item fat">F {preview.fat}g</span>
              </div>
            )}
            <button className="btn-primary btn-full" onClick={submitAmount} disabled={!amount}>
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
