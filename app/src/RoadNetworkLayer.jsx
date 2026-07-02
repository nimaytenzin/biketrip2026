import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.vectorgrid'

const ROAD_COLOR = '#c9c8c1'

export default function RoadNetworkLayer() {
  const map = useMap()

  useEffect(() => {
    const layer = L.vectorGrid.protobuf('/tiles/{z}/{x}/{y}.pbf', {
      rendererFactory: L.canvas.tile,
      interactive: false,
      minZoom: 6,
      maxNativeZoom: 13,
      vectorTileLayerStyles: {
        roads: {
          color: ROAD_COLOR,
          weight: 0.8,
          opacity: 0.8,
        },
      },
    })
    layer.addTo(map)
    return () => map.removeLayer(layer)
  }, [map])

  return null
}
