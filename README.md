# biketrip2026

**The Eastern Loop** — a 6-day motorcycle tour of Bhutan, visualised as an
interactive React site: Thimphu → Bumthang → Takila → Trashiyangtse → Panbang →
Tsirang → Thimphu.

Day routes are computed (shortest road path through each day's stops) over the
Department of Roads national road network dataset, with per-day distance,
estimated saddle time and road-class breakdowns derived from the actual road
geometry.

## Run it

```bash
cd app
npm install
npm run dev
```

## Stack

- Vite + React, Leaflet (CARTO Positron basemap)
- Full national road network rendered from Mapbox Vector Tiles
  (`app/public/tiles`, generated with GDAL's MVT driver)
- Tour routes in `app/public/data/tour_routes.geojson`, day stats in
  `app/src/tourStats.json` — both produced by a Dijkstra routing pass over the
  road network graph

## Data notes

The raw shapefile (`Road Network of Bhutan`, ~110 MB) is not committed (GitHub
file-size limit). To regenerate the derived data: simplify/reproject with
mapshaper to `app/public/data/roads.geojson`, then `ogr2ogr -f MVT` for the
tiles. Waypoint locations are approximate — the site is for planning
inspiration, not navigation.

Road network © Department of Roads, Bhutan. Basemap © OpenStreetMap
contributors, © CARTO.
