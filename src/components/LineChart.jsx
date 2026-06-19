import { fmtShort } from '../utils/dates.js'

const PAD = { l: 32, r: 8, t: 10, b: 22 }
const W = 360

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

export default function LineChart({
  title, data, unit, color, refLine, markers, band, secondaryLine,
  partialFromIndex, compact, markerPlacement = 'fixed',
}) {
  const H = compact ? 76 : 130
  const CW = W - PAD.l - PAD.r
  const CH = H - PAD.t - PAD.b

  const scaleSource = partialFromIndex != null ? data.slice(0, partialFromIndex) : data
  const nonNull = scaleSource.filter(d => d.value !== null)
  const refNonNull = refLine ? refLine.data.filter(d => d.value !== null) : []
  const secondaryNonNull = secondaryLine ? secondaryLine.data.filter(d => d.value !== null) : []
  const n = data.length

  const xOf = (i) => PAD.l + (n <= 1 ? CW / 2 : (i / (n - 1)) * CW)

  const allValues = [
    ...nonNull.map(d => d.value),
    ...refNonNull.map(d => d.value),
    ...secondaryNonNull.map(d => d.value),
    ...(band ? [band.low, band.high].filter(v => v != null) : []),
  ]
  const hasData = data.some(d => d.value !== null)
  const min = allValues.length ? Math.min(...allValues) : 0
  const max = allValues.length ? Math.max(...allValues) : 1
  const range = max - min || 1
  const yOf = (v) => PAD.t + Math.min(1, Math.max(0, (1 - (v - min) / range))) * CH

  const stableSegments = partialFromIndex != null
    ? segments(data.map((d, i) => (i < partialFromIndex ? d : { ...d, value: null })))
    : segments(data)
  const partialSegments = partialFromIndex != null
    ? segments(data.map((d, i) => (i >= partialFromIndex - 1 ? d : { ...d, value: null })))
    : []

  return (
    <div className={`line-chart ${compact ? 'line-chart-compact' : ''}`}>
      <div className="chart-title-row">
        <p className="chart-title">{title}</p>
        {(refLine || secondaryLine) && (
          <div className="chart-legend">
            {secondaryLine && (
              <span className="legend-item">
                <i className="legend-swatch" style={{ background: secondaryLine.color }} />{secondaryLine.label}
              </span>
            )}
            {refLine && (
              <span className="legend-item">
                <i className="legend-swatch dashed" style={{ borderColor: refLine.color }} />{refLine.label}
              </span>
            )}
          </div>
        )}
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`}>
        {/* Target band */}
        {band && band.low != null && band.high != null && (
          <rect
            x={PAD.l} width={CW}
            y={yOf(band.high)} height={Math.max(0, yOf(band.low) - yOf(band.high))}
            fill={band.color || color} opacity="0.12"
          />
        )}

        {/* Grid lines */}
        {[0, 0.5, 1].map(t => {
          const v = min + t * range
          const y = PAD.t + (1 - t) * CH
          return (
            <g key={t}>
              <line x1={PAD.l} x2={PAD.l + CW} y1={y} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={PAD.l - 4} y={y + 3} textAnchor="end" fontSize="9" fill="#9ca3af">
                {hasData ? fmtLabel(v, unit) : ''}
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

        {/* Main line: stable portion */}
        {stableSegments.map((seg, si) => (
          <polyline
            key={`main-${si}`}
            fill="none"
            stroke={color}
            strokeWidth={secondaryLine ? 1.5 : 2}
            strokeOpacity={secondaryLine ? 0.4 : 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seg.map(d => `${xOf(d.i)},${yOf(d.value)}`).join(' ')}
          />
        ))}

        {/* Main line: partial/in-progress trailing portion, dotted + greyed */}
        {partialSegments.map((seg, si) => (
          <polyline
            key={`partial-${si}`}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seg.map(d => `${xOf(d.i)},${yOf(d.value)}`).join(' ')}
          />
        ))}

        {/* Secondary line (e.g. moving average), drawn bold on top */}
        {secondaryLine && segments(secondaryLine.data).map((seg, si) => (
          <polyline
            key={`sec-${si}`}
            fill="none"
            stroke={secondaryLine.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seg.map(d => `${xOf(d.i)},${yOf(d.value)}`).join(' ')}
          />
        ))}

        {/* Dots (skip the partial/in-progress point) */}
        {!secondaryLine && nonNull.map((d) => {
          const i = data.indexOf(d)
          return <circle key={d.date} cx={xOf(i)} cy={yOf(d.value)} r="3" fill={color} />
        })}

        {/* Workout markers */}
        {markers && markers.map((m, i) => {
          if (!m.emoji) return null
          const d = data[i]
          const y = markerPlacement === 'value' && d && d.value !== null
            ? yOf(d.value) - 10
            : H - PAD.b + 9
          return (
            <text key={`mk-${i}`} x={xOf(i)} y={y} textAnchor="middle" fontSize="11">
              {m.emoji}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
