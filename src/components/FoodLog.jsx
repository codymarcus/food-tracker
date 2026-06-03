export default function FoodLog({ entries, onRemove }) {
  if (entries.length === 0) {
    return <p className="empty-log">No food logged yet. Add something above!</p>
  }

  return (
    <ul className="food-log">
      {entries.map(entry => (
        <li key={entry.id} className="food-item">
          <div className="food-item-top">
            <div>
              <span className="food-name">{entry.name}</span>
              {entry.serving && <span className="food-serving">{entry.serving}</span>}
            </div>
            <div className="food-item-right">
              <span className="food-calories">{entry.calories} kcal</span>
              <button className="remove-btn" onClick={() => onRemove(entry.id)}
                aria-label={`Remove ${entry.name}`}>✕</button>
            </div>
          </div>
          <div className="food-macros">
            <span className="macro-pill protein">P: {entry.protein}g</span>
            <span className="macro-pill carbs">C: {entry.carbs}g</span>
            <span className="macro-pill fat">F: {entry.fat}g</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
