import { CLASS_RAMP, classLabel } from './theme'

export default function ClassBar({ classKm }) {
  const entries = Object.entries(classKm)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  const pct = (v) => Math.max(1, Math.round((v / total) * 100))
  return (
    <div className="class-mix">
      <div className="class-bar" role="img" aria-label="Distance by road type">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="class-seg"
            style={{ width: `${(v / total) * 100}%`, background: CLASS_RAMP[k] || '#c3c2b7' }}
            title={`${classLabel(k)}: ${v} km (${pct(v)}%)`}
          />
        ))}
      </div>
      <ul className="class-legend">
        {entries.map(([k, v]) => (
          <li key={k}>
            <i style={{ background: CLASS_RAMP[k] || '#c3c2b7' }} />
            {classLabel(k)} <b>{pct(v)}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
