import { CLASS_RAMP, classLabel } from './theme'

export default function ClassBar({ classKm }) {
  const entries = Object.entries(classKm)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  return (
    <div className="class-bar" role="img" aria-label="Distance by road class">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="class-seg"
          style={{ width: `${(v / total) * 100}%`, background: CLASS_RAMP[k] || '#c3c2b7' }}
          title={`${classLabel(k)}: ${v} km`}
        >
          {v / total > 0.24 && <em>{Math.round(v)} km</em>}
        </span>
      ))}
    </div>
  )
}
