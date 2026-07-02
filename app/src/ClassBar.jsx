import { surfaceMix } from './theme'

export default function ClassBar({ classKm }) {
  const mix = surfaceMix(classKm)
  const total = mix.reduce((s, g) => s + g.km, 0)
  const pct = (v) => Math.max(1, Math.round((v / total) * 100))
  return (
    <div className="class-mix">
      <div className="class-bar" role="img" aria-label="Paved vs unpaved distance">
        {mix.map((g) => (
          <span
            key={g.label}
            className="class-seg"
            style={{ width: `${(g.km / total) * 100}%`, background: g.color }}
            title={`${g.label}: ${Math.round(g.km)} km (${pct(g.km)}%)`}
          />
        ))}
      </div>
      <ul className="class-legend">
        {mix.map((g) => (
          <li key={g.label}>
            <i style={{ background: g.color }} />
            {g.label} <b>{pct(g.km)}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
