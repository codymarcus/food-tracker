import { useState } from 'react'

const EMPTY = { name: '', calories: '', protein: '', carbs: '', fat: '' }

export default function AddFoodForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [open, setOpen] = useState(false)

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onAdd({
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    })
    setForm(EMPTY)
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="add-food-trigger" onClick={() => setOpen(true)}>
        + Add Food
      </button>
    )
  }

  return (
    <form className="add-food-form" onSubmit={submit}>
      <h3>Add Food</h3>
      <div className="form-row">
        <input
          className="input input-name"
          type="text"
          placeholder="Food name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="form-row macro-inputs">
        {[
          { key: 'calories', label: 'Calories', unit: 'kcal' },
          { key: 'protein',  label: 'Protein',  unit: 'g' },
          { key: 'carbs',    label: 'Carbs',    unit: 'g' },
          { key: 'fat',      label: 'Fat',      unit: 'g' },
        ].map(({ key, label, unit }) => (
          <label key={key} className="macro-input-label">
            <span>{label}</span>
            <input
              className="input input-macro"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={form[key]}
              onChange={e => set(key, e.target.value)}
            />
            <span className="unit">{unit}</span>
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Add</button>
        <button type="button" className="btn-ghost" onClick={() => { setForm(EMPTY); setOpen(false) }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
