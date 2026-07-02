import { DAY_COLORS, CLASS_RAMP, classLabel, fmtHours, visibleClassKm } from './theme'
import { DAY_FACTS } from './dayFacts'

function ClassBar({ classKm }) {
  const entries = Object.entries(classKm)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  return (
    <div className="class-bar" role="img" aria-label="Distance by road class">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className={`class-seg ${k === '(gap in data)' ? 'is-gap' : ''}`}
          style={{ width: `${(v / total) * 100}%`, background: CLASS_RAMP[k] || '#c3c2b7' }}
          title={`${classLabel(k)}: ${v} km`}
        >
          {v / total > 0.22 && <em>{Math.round(v)} km</em>}
        </span>
      ))}
    </div>
  )
}

export default function DayCard({ d, selected, onSelect }) {
  const color = DAY_COLORS[d.day - 1]
  const pois = d.markers.filter((m) => m.kind === 'poi').map((m) => m.name)
  const classKm = visibleClassKm(d.class_km)
  const topClass = Object.entries(classKm)[0]
  const isSel = selected === d.day
  return (
    <article
      className={`day-card ${isSel ? 'is-selected' : ''}`}
      onClick={() => onSelect(isSel ? null : d.day)}
    >
      <header className="day-card-head">
        <span className="day-badge" style={{ background: color }}>Day {d.day}</span>
        <h3>
          {d.start} <span className="route-arrow">→</span> {d.end}
        </h3>
      </header>

      <div className="day-figures">
        <div>
          <strong>{d.routed_km.toLocaleString()} km</strong>
          <span>distance</span>
        </div>
        <div>
          <strong>≈ {fmtHours(d.est_hours)}</strong>
          <span>in the saddle</span>
        </div>
      </div>

      <ClassBar classKm={classKm} />
      <p className="day-class-note">
        Mostly {classLabel(topClass[0]).toLowerCase()} ({Math.round(topClass[1])} km of{' '}
        {Math.round(d.routed_km)} km)
      </p>

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
    </article>
  )
}
