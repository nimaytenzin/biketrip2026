import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import RoadNetworkLayer from './RoadNetworkLayer'
import { DAY_COLORS } from './theme'
import stats from './tourStats.json'

const HIDDEN_MARKERS = ['Kuri Zampa'] // routing constraint, not a real stop

function dayPositions(feature) {
  return feature.geometry.coordinates.map(([lng, lat]) => [lat, lng])
}

// Markers get their own canvas in a pane above the route overlay pane, so
// they always draw on top of the route lines (with preferCanvas, everything
// in the default pane shares one canvas in insertion order).
function MarkerPane({ children }) {
  const map = useMap()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!map.getPane('tour-markers')) {
      map.createPane('tour-markers').style.zIndex = 620
    }
    setReady(true)
  }, [map])
  return ready ? children : null
}

// Fly to the active day's route, keeping it clear of the story card:
// desktop cards sit on the right, mobile cards rise from the bottom.
function FitToSelection({ routes, selected }) {
  const map = useMap()
  useEffect(() => {
    if (!routes) return
    const feats =
      selected == null
        ? routes.features
        : routes.features.filter((f) => f.properties.day === selected)
    if (!feats.length) return
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
    for (const f of feats) {
      for (const [lng, lat] of f.geometry.coordinates) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      }
    }
    const mobile = window.innerWidth < 720
    map.flyToBounds(
      [[minLat, minLng], [maxLat, maxLng]],
      {
        paddingTopLeft: mobile ? [24, 90] : [60, 60],
        paddingBottomRight: mobile
          ? [24, Math.round(window.innerHeight * 0.46)]
          : [Math.min(window.innerWidth * 0.42, 540), 60],
        duration: 1.1,
        easeLinearity: 0.2,
      },
    )
  }, [map, routes, selected])
  return null
}

export default function TourMap({ routes, selected, onDayClick }) {
  const days = useMemo(
    () => (routes ? [...routes.features].sort((a, b) => a.properties.day - b.properties.day) : []),
    [routes],
  )
  const markerRenderer = useMemo(() => L.canvas({ pane: 'tour-markers' }), [])

  return (
    <MapContainer
      center={[27.3, 90.5]}
      zoom={8}
      className="map"
      preferCanvas
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
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
            pathOptions={{ color: '#ffffff', weight: 7, opacity: active ? 0.9 : 0 }}
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
            eventHandlers={{ click: () => onDayClick?.(d) }}
            pathOptions={{
              color: DAY_COLORS[d - 1],
              weight: selected === d ? 5 : 3.5,
              opacity: active ? 0.95 : 0.12,
            }}
          >
            <Tooltip sticky>
              Day {d} — {f.properties.start} → {f.properties.end} ·{' '}
              {f.properties.distance_km} km
            </Tooltip>
          </Polyline>
        )
      })}

      <MarkerPane>
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
                  pane="tour-markers"
                  renderer={markerRenderer}
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
                    </Tooltip>
                  )}
                </CircleMarker>
              )
            })
        })}
      </MarkerPane>
    </MapContainer>
  )
}
