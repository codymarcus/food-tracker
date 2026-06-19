import { localDateStr, shiftDate } from './dates.js'

export function buildDateRange(days) {
  const today = localDateStr()
  const dates = []
  for (let i = days - 1; i >= 0; i--) dates.push(shiftDate(today, -i))
  return dates
}

// null when no entries were logged that day; a real number (including 0) otherwise
export function dailyCalories(log, date) {
  const entries = log[date]
  if (!entries?.length) return null
  return Math.round(entries.reduce((sum, e) => sum + (e.calories || 0), 0))
}

export function dailyProtein(log, date) {
  const entries = log[date]
  if (!entries?.length) return null
  return Math.round(entries.reduce((sum, e) => sum + (e.protein || 0), 0))
}

export function average(values) {
  const nonNull = values.filter(v => v !== null && v !== undefined)
  if (!nonNull.length) return null
  return nonNull.reduce((a, b) => a + b, 0) / nonNull.length
}

// Trailing window average, gap-tolerant (skips nulls within the window rather
// than treating them as zero); null where the window has no real values yet
export function movingAverage(values, window) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1)
    return average(slice)
  })
}

// Least-squares slope of weight vs. day-index, scaled to lbs/week.
// Ignores null entries rather than treating them as zero.
export function rateOfLossPerWeek(values) {
  const points = values
    .map((v, i) => ({ x: i, y: v }))
    .filter(p => p.y !== null && p.y !== undefined)
  if (points.length < 2) return null

  const n = points.length
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)

  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denom
  return slope * 7
}
