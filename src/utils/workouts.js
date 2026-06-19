export const WORKOUT_TYPES = [
  { key: 'weightlifting',    label: 'Weightlifting',    emoji: '🏋️' },
  { key: 'beach_volleyball', label: 'Beach Volleyball', emoji: '🏐' },
  { key: 'hiking',           label: 'Hiking',           emoji: '🥾' },
]

const EMOJI_BY_KEY = Object.fromEntries(WORKOUT_TYPES.map(w => [w.key, w.emoji]))

// Compact emoji string for whatever workout types were logged that day, e.g. "🏋️🥾"
export function workoutEmoji(workout) {
  return workoutTypesOf(workout).map(t => EMOJI_BY_KEY[t] ?? '💪').join('')
}

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
