import { fmtShort } from '../utils/dates.js'

const PAD = { l: 32, r: 8, t: 10, b: 22 }
const W = 360, H = 130
const CW = W - PAD.l - PAD.r   // 320
const CH = H - PAD.t - PAD.b   // 98

function segments(data) {
  const segs = []
  let cur = []
  data.forEach((d, i) => {
    if (d.value !== null) {
      cur.push({ ...d, i })
    } else {
      if (cur.length) { segs.push(cur); cur = [] }
    }
  })
  if (cur.length) segs.push(cur)
  return segs
}

function fmtLabel(v, unit) {
  if (unit === 'lbs') return v.toFixed(1)
  return Math.round(v).toLocaleString()
}

export default function LineChart({ title, data, unit, color, refLine, markers }) {
  const nonNull = data.filter(d => d.value !== null)
  const refNonNull = refLine ? refLine.data.filter(d => d.value !== null) : []
  const n = data.length

  const xOf = (i) => PAD.l + (n <= 1 ? CW / 2 : (i / (n - 1)) * CW)

  const allValues = [...nonNull.map(d => d.value), ...refNonNull.map(d => d.value)]
  const hasData = nonNull.length > 0
  const min = allValues.length ? Math.min(...allValues) : 0
  const max = allValues.length ? Math.max(...allValues) : 1
  const range = max - min || 1
  const yOf = (v) => PAD.t + (1 - (v - min) / range) * CH

  return (
    <div className="line-chart">
      <div className="chart-title-row">
        <p className="chart-title">{title}</p>
        {refLine && (
          <div className="chart-legend">
            <span className="legend-item">
              <i className="legend-swatch" style={{ background: color }} />{title}
            </span>
            <span className="legend-item">
              <i className="legend-swatch dashed" style={{ borderColor: refLine.color }} />{refLine.label}
            </span>
          </div>
        )}
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(t => {
          const v = min + t * range
          const y = PAD.t + (1 - t) * CH
          return (
            <g key={t}>
              <line x1={PAD.l} x2={PAD.l + CW} y1={y} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={PAD.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
                {(hasData || refNonNull.length) ? fmtLabel(v, unit) : ''}
              </text>
            </g>
          )
        })}

        {/* X-axis date labels */}
        {n > 0 && (
          <>
            <text x={PAD.l} y={H - 4} fontSize="9" fill="#9ca3af" textAnchor="start">
              {fmtShort(data[0].date)}
            </text>
            <text x={PAD.l + CW} y={H - 4} fontSize="9" fill="#9ca3af" textAnchor="end">
              {fmtShort(data[n - 1].date)}
            </text>
          </>
        )}

        {!hasData && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="12" fill="#d1d5db">
            No data yet
          </text>
        )}

        {/* Reference line (e.g. goal) */}
        {refLine && segments(refLine.data).map((seg, si) => (
          <polyline
            key={`ref-${si}`}
            fill="none"
            stroke={refLine.color}
            strokeWidth="1.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seg.map(d => `${xOf(d.i)},${yOf(d.value)}`).join(' ')}
          />
        ))}

        {/* Polyline segments */}
        {segments(data).map((seg, si) => (
          <polyline
            key={si}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seg.map(d => `${xOf(d.i)},${yOf(d.value)}`).join(' ')}
          />
        ))}

        {/* Dots */}
        {nonNull.map((d) => {
          const i = data.indexOf(d)
          return <circle key={d.date} cx={xOf(i)} cy={yOf(d.value)} r="3" fill={color} />
        })}

        {/* Workout markers */}
        {markers && markers.map((m, i) => m.emoji ? (
          <text key={`mk-${i}`} x={xOf(i)} y={H - PAD.b + 9} textAnchor="middle" fontSize="11">
            {m.emoji}
          </text>
        ) : null)}
      </svg>
    </div>
  )
}
