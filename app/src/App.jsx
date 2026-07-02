import { useEffect, useRef, useState } from 'react'
import TourMap from './TourMap'
import ClassBar from './ClassBar'
import { DAY_COLORS, fmtHours, visibleClassKm } from './theme'
import { DAY_FACTS } from './dayFacts'
import stats from './tourStats.json'

const totalKm = Math.round(stats.reduce((s, d) => s + d.routed_km, 0))
const totalHours = stats.reduce((s, d) => s + d.est_hours, 0)
const passNames = [
  ...new Set(
    stats
      .flatMap((d) => d.markers)
      .filter((m) => m.kind === 'poi' && /(\bla\b|pass)/i.test(m.name))
      .map((m) => m.name),
  ),
]

const SECTIONS = ['intro', ...stats.map((d) => d.day), 'end']

function DayStory({ d }) {
  const color = DAY_COLORS[d.day - 1]
  const classKm = visibleClassKm(d.class_km)
  const pois = d.markers.filter((m) => m.kind === 'poi').map((m) => m.name)
  return (
    <article className="card day-story" style={{ '--day-color': color }}>
      <span className="day-badge" style={{ background: color }}>Day {d.day}</span>
      <h2>
        {d.start} <span className="route-arrow">→</span> {d.end}
      </h2>

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

      {pois.length > 0 && (
        <p className="day-pois">
          <span className="label">Along the way</span> {pois.join(' · ')}
        </p>
      )}
      <p className="day-halt">
        <span className="label">Night halt</span> {d.halt}
      </p>

      {DAY_FACTS[d.day] && (
        <details className="day-facts">
          <summary>Worth knowing</summary>
          <ul>
            {DAY_FACTS[d.day].map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      )}
    </article>
  )
}

function StoryNav({ active, scrollTo }) {
  const idx = SECTIONS.indexOf(active)
  return (
    <div className="story-nav">
      <button
        aria-label="Previous section"
        disabled={idx <= 0}
        onClick={() => scrollTo(SECTIONS[idx - 1])}
      >
        ↑
      </button>
      <button
        aria-label="Next section"
        disabled={idx >= SECTIONS.length - 1}
        onClick={() => scrollTo(SECTIONS[idx + 1])}
      >
        ↓
      </button>
    </div>
  )
}

export default function App() {
  const [routes, setRoutes] = useState(null)
  const [active, setActive] = useState('intro')
  const sectionRefs = useRef({})

  useEffect(() => {
    fetch('/data/tour_routes.geojson')
      .then((r) => r.json())
      .then(setRoutes)
      .catch((e) => console.error('route load failed', e))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const key = e.target.dataset.section
            setActive(key === 'intro' || key === 'end' ? key : Number(key))
          }
        }
      },
      // fire when a section crosses the middle band of the viewport
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (key) =>
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const selected = typeof active === 'number' ? active : null

  return (
    <div className="story">
      <div className="story-map">
        <TourMap routes={routes} selected={selected} onDayClick={scrollTo} />
      </div>

      <StoryNav active={active} scrollTo={scrollTo} />

      <nav className="rail" aria-label="Tour progress">
        {SECTIONS.map((key) => (
          <button
            key={key}
            className={`rail-dot ${active === key ? 'is-active' : ''}`}
            style={
              typeof key === 'number'
                ? { '--dot-color': DAY_COLORS[key - 1] }
                : undefined
            }
            title={
              key === 'intro'
                ? 'Overview'
                : key === 'end'
                  ? 'The end'
                  : `Day ${key}`
            }
            onClick={() => scrollTo(key)}
          />
        ))}
      </nav>

      <main className="story-flow">
        <section
          className="story-section is-center"
          data-section="intro"
          ref={(el) => (sectionRefs.current.intro = el)}
        >
          <div className="card intro-card">
            <p className="kicker">Bhutan · 2026</p>
            <h1>The Eastern Loop</h1>
            <p className="intro-sub">
              Six days around the kingdom by motorcycle — over the high passes to
              the far east, down to the Manas jungle, and home along the southern
              belt.
            </p>
            <div className="kpis">
              <div className="kpi">
                <strong>{totalKm.toLocaleString()}</strong>
                <span>kilometres</span>
              </div>
              <div className="kpi">
                <strong>{stats.length}</strong>
                <span>days</span>
              </div>
              <div className="kpi">
                <strong>≈ {Math.round(totalHours)} h</strong>
                <span>in the saddle</span>
              </div>
              <div className="kpi">
                <strong>{passNames.length}</strong>
                <span>mountain passes</span>
              </div>
            </div>
            <button className="scroll-cue" onClick={() => scrollTo(1)}>
              Begin the ride
              <span className="chevron" aria-hidden>⌄</span>
            </button>
          </div>
        </section>

        {stats.map((d) => (
          <section
            key={d.day}
            className="story-section"
            data-section={d.day}
            ref={(el) => (sectionRefs.current[d.day] = el)}
          >
            <DayStory d={d} />
          </section>
        ))}

        <section
          className="story-section is-center"
          data-section="end"
          ref={(el) => (sectionRefs.current.end = el)}
        >
          <div className="card end-card">
            <p className="kicker">The end of the road</p>
            <h2>Back in Thimphu</h2>
            <p className="intro-sub">
              {totalKm.toLocaleString()} kilometres, {passNames.length} passes,
              one kingdom — full circle.
            </p>
            <ul className="end-summary">
              {stats.map((d) => (
                <li key={d.day}>
                  <i style={{ background: DAY_COLORS[d.day - 1] }} />
                  <span className="end-route">
                    {d.start} → {d.end}
                  </span>
                  <span className="end-km">{Math.round(d.routed_km)} km</span>
                </li>
              ))}
            </ul>
            <button className="scroll-cue" onClick={() => scrollTo('intro')}>
              Ride it again ↺
            </button>
            <p className="end-note">Ride safe. See you on the road.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
