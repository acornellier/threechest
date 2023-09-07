import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS, LatLngBoundsExpression, LatLngExpression, Point } from 'leaflet'
import { MousePosition } from './tools/MousePosition/MousePosition'
import './tools/SmoothWheelZoom/SmoothWheelZoom.js'
import { Mobs } from './Mobs.tsx'

const height = 256
const width = 384
const maxCoords = [-height, width]

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [-height, width],
]

export function Map() {
  const center: LatLngExpression = [maxCoords[0] / 2, maxCoords[1] / 2]

  return (
    <MapContainer
      crs={CRS.Simple}
      center={center}
      maxBounds={bounds}
      minZoom={1}
      maxZoom={5}
      zoom={1}
      zoomControl={false}
      scrollWheelZoom={false}
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      /* @ts-ignore */
      smoothWheelZoom={true}
      smoothSensitivity={2}
    >
      <MousePosition />
      <TileLayer
        attribution="Map data © Blizzard Entertainment"
        bounds={bounds}
        noWrap
        tileSize={new Point(width, height)}
        url="/vp/map/{z}/{x}_{y}.png"
      />
      <Mobs />
    </MapContainer>
  )
}
