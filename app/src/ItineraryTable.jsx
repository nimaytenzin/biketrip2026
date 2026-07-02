import { DAY_COLORS, fmtHours } from './theme'
import stats from './tourStats.json'

export default function ItineraryTable() {
  return (
    <div className="table-scroll">
      <table className="itinerary">
        <thead>
          <tr>
            <th>Day</th>
            <th>Route</th>
            <th>Legs (routed)</th>
            <th>Night halt</th>
            <th className="num">Distance</th>
            <th className="num">Est. time</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((d) => (
            <tr key={d.day}>
              <td>
                <span className="day-dot" style={{ background: DAY_COLORS[d.day - 1] }} />
                {d.day}
              </td>
              <td>
                {d.start} → {d.end}
              </td>
              <td className="legs">
                {d.legs
                  .filter((l) => !l.gap)
                  .map((l) => `${l.frm} → ${l.to} (${l.km} km)`)
                  .join('; ')}
              </td>
              <td>{d.halt}</td>
              <td className="num">{d.routed_km} km</td>
              <td className="num">≈ {fmtHours(d.est_hours)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
