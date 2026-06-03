export default function FoodLibrary({ library, onDelete, onClose }) {
  return (
    <div className="goal-editor">
      <div className="panel-header">
        <h3>My Foods</h3>
        <button className="btn-ghost small" onClick={onClose}>✕</button>
      </div>
      {library.length === 0 ? (
        <p className="empty-log" style={{ padding: '12px 0' }}>
          No foods saved yet. Add one via the log.
        </p>
      ) : (
        <ul className="library-list">
          {library.map(f => (
            <li key={f.id} className="library-item">
              <div className="lib-info">
                <span className="lib-name">{f.name}</span>
                <span className="lib-ref">
                  {f.type === 'weight' ? `per ${f.refGrams}g` : `per ${f.unitLabel}`}
                  {' · '}{f.calories} kcal · P {f.protein}g · C {f.carbs}g · F {f.fat}g
                </span>
              </div>
              <button className="remove-btn" onClick={() => onDelete(f.id)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
