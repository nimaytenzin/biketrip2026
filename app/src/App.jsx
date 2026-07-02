import { useEffect, useRef, useState } from 'react'
import TourMap from './TourMap'
import DayCard from './DayCard'
import ItineraryTable from './ItineraryTable'
import { CLASS_RAMP, classLabel, fmtHours, visibleClassKm } from './theme'
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

const legendClasses = [
  ...new Set(stats.flatMap((d) => Object.keys(visibleClassKm(d.class_km)))),
]

export default function App() {
  const [routes, setRoutes] = useState(null)
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)

  const selectFromCard = (day) => {
    setSelected(day)
    if (day != null) {
      mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    fetch('/data/tour_routes.geojson')
      .then((r) => r.json())
      .then(setRoutes)
      .catch((e) => console.error('route load failed', e))
  }, [])

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-kicker">Bhutan · 2026</p>
        <h1>The Eastern Loop</h1>
        <p className="hero-sub">
          Six days around the kingdom by motorcycle — Thimphu to the far east over
          the high passes, down through Pemagatshel to the Manas valley, back west
          along the southern belt, and home over Dochula.
        </p>
        <div className="kpis">
          <div className="kpi">
            <strong>{totalKm.toLocaleString()} km</strong>
            <span>total distance</span>
          </div>
          <div className="kpi">
            <strong>{stats.length} days</strong>
            <span>
              Thimphu → Bumthang → Takila → Trashiyangtse → Panbang → Tsirang →
              Thimphu
            </span>
          </div>
          <div className="kpi">
            <strong>≈ {fmtHours(totalHours)}</strong>
            <span>time in the saddle</span>
          </div>
          <div className="kpi">
            <strong>{passNames.length} passes</strong>
            <span>{passNames.map((n) => n.replace(' Pass', '')).join(' · ')}</span>
          </div>
        </div>
      </header>

      <section className="map-section" ref={mapRef}>
        <TourMap routes={routes} selected={selected} onSelect={setSelected} />
      </section>

      <section className="days-section">
        <div className="section-head">
          <h2>Day by day</h2>
          <div className="class-legend">
            {legendClasses.map((k) => (
              <span key={k} className="class-legend-item">
                <i style={{ background: CLASS_RAMP[k] || '#c3c2b7' }} />
                {classLabel(k)}
              </span>
            ))}
          </div>
        </div>
        <div className="cards">
          {stats.map((d) => (
            <DayCard key={d.day} d={d} selected={selected} onSelect={selectFromCard} />
          ))}
        </div>
      </section>

      <section className="table-section">
        <h2>Itinerary at a glance</h2>
        <ItineraryTable />
      </section>

      <footer className="site-footer">Ride safe. See you on the road.</footer>
    </div>
  )
}
