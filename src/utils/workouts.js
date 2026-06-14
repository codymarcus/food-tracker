export const WORKOUT_TYPES = [
  { key: 'weightlifting',    label: 'Weightlifting' },
  { key: 'beach_volleyball', label: 'Beach Volleyball' },
  { key: 'hiking',           label: 'Hiking' },
]

// Workouts logged before types existed had no `type` — backfill them as weightlifting
export function migrateHealth(health) {
  const out = {}
  for (const [date, metrics] of Object.entries(health)) {
    const w = metrics?.workout
    out[date] = (w?.completed && !w.type)
      ? { ...metrics, workout: { ...w, type: 'weightlifting' } }
      : metrics
  }
  return out
}
