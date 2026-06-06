function triggerDownload(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportCSV(log, health) {
  const allDates = [...new Set([...Object.keys(log), ...Object.keys(health)])].sort()

  const header = 'date,calories,protein,carbs,fat,weight_lbs,steps,workout'
  const rows = allDates.map(date => {
    const entries = log[date] || []
    const t = entries.reduce(
      (a, e) => ({
        calories: a.calories + (e.calories || 0),
        protein:  a.protein  + (e.protein  || 0),
        carbs:    a.carbs    + (e.carbs    || 0),
        fat:      a.fat      + (e.fat      || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
    const h = health[date] || {}
    const workout = h.workout != null ? (h.workout.completed ? 'yes' : 'no') : ''
    return [
      date,
      entries.length ? Math.round(t.calories)             : '',
      entries.length ? Math.round(t.protein  * 10) / 10   : '',
      entries.length ? Math.round(t.carbs    * 10) / 10   : '',
      entries.length ? Math.round(t.fat      * 10) / 10   : '',
      h.weight ?? '',
      h.steps  ?? '',
      workout,
    ].join(',')
  })

  triggerDownload([header, ...rows].join('\n'), 'food-tracker.csv', 'text/csv')
}

export function exportJSON(log, health, goals, library) {
  const payload = {
    exportedAt: new Date().toISOString(),
    goals,
    library,
    log,
    health,
  }
  triggerDownload(JSON.stringify(payload, null, 2), 'food-tracker.json', 'application/json')
}
