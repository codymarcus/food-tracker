export const WORKOUT_TYPES = [
  { key: 'weightlifting',    label: 'Weightlifting' },
  { key: 'beach_volleyball', label: 'Beach Volleyball' },
  { key: 'hiking',           label: 'Hiking' },
]

// Normalizes any legacy workout shape (no type, singular `type`) into a `types` array
export function workoutTypesOf(workout) {
  if (!workout?.completed) return []
  if (Array.isArray(workout.types)) return workout.types
  return [workout.type ?? 'weightlifting']
}

export function migrateHealth(health) {
  const out = {}
  for (const [date, metrics] of Object.entries(health)) {
    const w = metrics?.workout
    out[date] = (w?.completed && !Array.isArray(w.types))
      ? { ...metrics, workout: { completed: true, types: workoutTypesOf(w) } }
      : metrics
  }
  return out
}
