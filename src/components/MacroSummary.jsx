export default function MacroSummary({ totals, goals }) {
  const macros = [
    { key: 'calories', label: 'Calories', unit: 'cal', color: '#22c55e' },
    { key: 'protein',  label: 'Protein',  unit: 'g',   color: '#3b82f6' },
    { key: 'carbs',    label: 'Carbs',    unit: 'g',   color: '#f97316' },
    { key: 'fat',      label: 'Fat',      unit: 'g',   color: '#a855f7' },
  ]

  return (
    <div className="macro-summary">
      {macros.map(({ key, label, unit, color }) => {
        const current = Math.round(totals[key])
        const goal = goals[key]
        const pct = Math.min(100, goal > 0 ? (current / goal) * 100 : 0)
        const over = current > goal
        const diff = Math.round(Math.abs(goal - current))

        return (
          <div key={key} className="macro-card">
            <div className="macro-top">
              <span className="macro-label" style={{ color }}>{label}</span>
              <span className="macro-remain" style={{ color: over ? '#ef4444' : color }}>
                {over ? `+${diff}` : diff}
                <span className="macro-remain-tag">{over ? ' over' : ' left'}</span>
              </span>
            </div>
            <div className="macro-consumed">{current} / {goal} {unit}</div>
            <div className="macro-bar-bg">
              <div
                className="macro-bar-fill"
                style={{ width: `${pct}%`, background: over ? '#ef4444' : color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
