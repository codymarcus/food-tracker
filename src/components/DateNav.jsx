import { localDateStr, shiftDate } from '../utils/dates.js'

function formatDate(dateStr) {
  const today = localDateStr()
  const yesterday = shiftDate(today, -1)
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

export default function DateNav({ date, onChange }) {
  const today = localDateStr()
  const isToday = date === today

  return (
    <div className="date-nav">
      <button className="date-btn" onClick={() => onChange(shiftDate(date, -1))}>‹</button>
      <span className="date-label">{formatDate(date)}</span>
      <button className="date-btn" onClick={() => onChange(shiftDate(date, 1))} disabled={isToday}>›</button>
    </div>
  )
}
