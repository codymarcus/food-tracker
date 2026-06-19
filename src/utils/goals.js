export const DEFAULT_GOALS = {
  calories: 2000, protein: 150, carbs: 200, fat: 65,
  stepsGoal: 10000, weightLow: null, weightHigh: null,
}

const EPOCH = '2000-01-01'

export function migrateGoals(raw) {
  if (Array.isArray(raw) && raw.length) return raw
  if (raw && typeof raw === 'object') return [{ date: EPOCH, ...raw }]
  return [{ date: EPOCH, ...DEFAULT_GOALS }]
}

// Latest history entry whose date is on or before the given date, defaults filled in
// for fields older entries predate (e.g. stepsGoal/weightLow/weightHigh)
export function goalsAt(history, date) {
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  let result = sorted[0]
  for (const entry of sorted) {
    if (entry.date <= date) result = entry
    else break
  }
  return { ...DEFAULT_GOALS, ...result }
}
