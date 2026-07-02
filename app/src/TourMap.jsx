import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import RoadNetworkLayer from './RoadNetworkLayer'
import DayPanel from './DayPanel'
import { DAY_COLORS } from './theme'
import stats from './tourStats.json'

const HIDDEN_MARKERS = ['Kuri Zampa'] // routing constraint, not a real stop

function dayPositions(feature) {
  return feature.geometry.coordinates.map(([lng, lat]) => [lat, lng])
}

function FitToSelection({ routes, selected }) {
  const map = useMap()
  useEffect(() => {
    if (!routes) return
    const feats = selected == null
      ? routes.features
      : routes.features.filter((f) => f.properties.day === selected)
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
    for (const f of feats) {
      for (const [lng, lat] of f.geometry.coordinates) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      }
    }
    map.flyToBounds(
      [[minLat, minLng], [maxLat, maxLng]],
      { padding: [40, 40], duration: 0.8 },
    )
  }, [map, routes, selected])
  return null
}

export default function TourMap({ routes, selected, onSelect }) {
  const days = useMemo(
    () => (routes ? [...routes.features].sort((a, b) => a.properties.day - b.properties.day) : []),
    [routes],
  )

  return (
    <div className="map-wrap">
      <MapContainer
        center={[27.3, 90.5]}
        zoom={8}
        className="map"
        preferCanvas
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={18}
        />
        <RoadNetworkLayer />
        <FitToSelection routes={routes} selected={selected} />

        {/* white casings first so every colored line sits on a surface ring */}
        {days.map((f) => {
          const d = f.properties.day
          const active = selected == null || selected === d
          return (
            <Polyline
              key={`case-${d}`}
              positions={dayPositions(f)}
              pathOptions={{ color: '#ffffff', weight: 6, opacity: active ? 0.9 : 0 }}
            />
          )
        })}
        {days.map((f) => {
          const d = f.properties.day
          const active = selected == null || selected === d
          return (
            <Polyline
              key={`route-${d}`}
              positions={dayPositions(f)}
              eventHandlers={{ click: () => onSelect(selected === d ? null : d) }}
              pathOptions={{
                color: DAY_COLORS[d - 1],
                weight: selected === d ? 4.5 : 3,
                opacity: active ? 0.95 : 0.15,
              }}
            >
              <Tooltip sticky>
                Day {d} — {f.properties.start} → {f.properties.end} ·{' '}
                {f.properties.distance_km} km
              </Tooltip>
            </Polyline>
          )
        })}

        {stats.map((d) => {
          const active = selected == null || selected === d.day
          if (!active) return null
          const color = DAY_COLORS[d.day - 1]
          return d.markers
            .filter((m) => !HIDDEN_MARKERS.some((h) => m.name.includes(h)))
            .map((m) => {
              const isEndpoint = m.kind === 'start' || m.kind === 'end'
              const labelled = isEndpoint && selected === d.day
              return (
                <CircleMarker
                  // key includes `labelled` so the permanent tooltip remounts on toggle
                  key={`${d.day}-${m.name}-${m.kind}-${labelled}`}
                  center={[m.lat, m.lon]}
                  radius={isEndpoint ? 7 : m.kind === 'via' ? 5 : 4.5}
                  pathOptions={
                    m.kind === 'poi'
                      ? { color, weight: 2, fillColor: '#ffffff', fillOpacity: 1 }
                      : { color: '#ffffff', weight: 2, fillColor: color, fillOpacity: 1 }
                  }
                >
                  {labelled ? (
                    <Tooltip
                      permanent
                      direction={m.kind === 'start' ? 'top' : 'bottom'}
                      className="endpoint-label"
                      offset={[0, m.kind === 'start' ? -8 : 8]}
                    >
                      <b>{m.kind === 'start' ? 'Start' : 'Finish'}</b> · {m.name}
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <strong>{m.name}</strong>
                      <br />
                      Day {d.day} · {m.kind === 'poi' ? 'highlight' : m.kind}
                      {m.off_km > 1 ? ' · position approximate' : ''}
                    </Tooltip>
                  )}
                </CircleMarker>
              )
            })
        })}
      </MapContainer>

      {selected != null && (
        <DayPanel selected={selected} onClose={() => onSelect(null)} />
      )}

      <div className="map-legend" role="tablist" aria-label="Highlight a day">
        <button
          className={`day-chip ${selected == null ? 'is-active' : ''}`}
          onClick={() => onSelect(null)}
        >
          All days
        </button>
        {stats.map((d) => (
          <button
            key={d.day}
            className={`day-chip ${selected === d.day ? 'is-active' : ''}`}
            style={{ '--chip-color': DAY_COLORS[d.day - 1] }}
            onClick={() => onSelect(selected === d.day ? null : d.day)}
          >
            <span className="chip-swatch" style={{ background: DAY_COLORS[d.day - 1] }} />
            Day {d.day}
          </button>
        ))}
      </div>
    </div>
  )
}
