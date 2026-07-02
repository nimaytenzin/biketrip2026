import { DAY_COLORS, CLASS_RAMP, classLabel, fmtHours, visibleClassKm } from './theme'
import { DAY_FACTS } from './dayFacts'
import stats from './tourStats.json'

export default function DayPanel({ selected, onClose }) {
  const d = stats.find((s) => s.day === selected)
  if (!d) return null
  const color = DAY_COLORS[d.day - 1]
  const classKm = visibleClassKm(d.class_km)
  const total = Object.values(classKm).reduce((s, v) => s + v, 0)
  const pois = d.markers.filter((m) => m.kind === 'poi').map((m) => m.name)

  return (
    <aside className="day-panel" style={{ '--day-color': color }}>
      <header>
        <span className="day-badge" style={{ background: color }}>Day {d.day}</span>
        <button className="panel-close" onClick={onClose} aria-label="Close day details">
          ×
        </button>
      </header>
      <h3>
        {d.start} <span className="route-arrow">→</span> {d.end}
      </h3>

      <div className="panel-figures">
        <div>
          <strong>{d.routed_km.toLocaleString()}</strong>
          <span>km</span>
        </div>
        <div>
          <strong>≈ {fmtHours(d.est_hours)}</strong>
          <span>in the saddle</span>
        </div>
        <div>
          <strong>{pois.length || '—'}</strong>
          <span>highlights</span>
        </div>
      </div>

      <div className="panel-classes">
        <div className="class-bar">
          {Object.entries(classKm).map(([k, v]) => (
            <span
              key={k}
              className="class-seg"
              style={{ width: `${(v / total) * 100}%`, background: CLASS_RAMP[k] || '#c3c2b7' }}
              title={`${classLabel(k)}: ${v} km`}
            />
          ))}
        </div>
        <ul className="panel-class-list">
          {Object.entries(classKm).slice(0, 3).map(([k, v]) => (
            <li key={k}>
              <i style={{ background: CLASS_RAMP[k] || '#c3c2b7' }} />
              {classLabel(k)} · {Math.round(v)} km
            </li>
          ))}
        </ul>
      </div>

      {pois.length > 0 && (
        <p className="day-pois">
          <span className="label">Along the way</span> {pois.join(' · ')}
        </p>
      )}
      <p className="day-halt">
        <span className="label">Night halt</span> {d.halt}
      </p>

      {DAY_FACTS[d.day] && (
        <div className="day-facts">
          <span className="label">Worth knowing</span>
          <ul>
            {DAY_FACTS[d.day].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
