export const WORKOUT_TYPES = [
  { key: 'weightlifting',    label: 'Weightlifting',    emoji: '🏋️' },
  { key: 'running',          label: 'Running',          emoji: '🏃', tracksHours: true },
  { key: 'beach_volleyball', label: 'Beach Volleyball', emoji: '🏐', tracksHours: true },
  { key: 'hiking',           label: 'Hiking',           emoji: '🥾', tracksHours: true },
]

export const CARBS_PER_HOUR = 30
export const WEIGHTLIFTING_CARB_BONUS = 50
const CARB_CALORIES = 4 // kcal per gram of carbs

const EMOJI_BY_KEY = Object.fromEntries(WORKOUT_TYPES.map(w => [w.key, w.emoji]))
const HOURS_TYPES = WORKOUT_TYPES.filter(w => w.tracksHours).map(w => w.key)

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

// Extra carbs earned that day from hour-tracked activities (running, hiking, beach volleyball)
// plus a flat bonus on weightlifting days
export function workoutCarbBonus(workout) {
  if (!workout?.completed) return 0
  const hours = workout.hours || {}
  const hoursBonus = HOURS_TYPES.reduce((sum, type) => sum + (Number(hours[type]) || 0) * CARBS_PER_HOUR, 0)
  const weightliftingBonus = workoutTypesOf(workout).includes('weightlifting') ? WEIGHTLIFTING_CARB_BONUS : 0
  return hoursBonus + weightliftingBonus
}

// Calories carried by the carb bonus, so the calorie goal moves with it
export function workoutCalorieBonus(workout) {
  return workoutCarbBonus(workout) * CARB_CALORIES
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
