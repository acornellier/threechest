import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS, LatLngBoundsExpression, LatLngExpression, Point } from 'leaflet'
import { MousePosition } from '../Leaflet/MousePosition/MousePosition'
import '../Leaflet/SmoothWheelZoom/SmoothWheelZoom'
import { Mobs } from './Mobs.tsx'

import { dungeonsByKey } from '../../data/dungeonsByKey.ts'
import { PullOutlines } from './PullOutlines.tsx'
import { useRoute } from '../RouteContext/UseRoute.ts'

const height = 256
const width = 384
const maxCoords = [-height, width]

const center: LatLngExpression = [maxCoords[0] / 2, maxCoords[1] / 2]

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [-height, width],
]

export function Map() {
  const { dungeon } = useRoute()

  return (
    <MapContainer
      className="bg-inherit w-screen h-screen"
      crs={CRS.Simple}
      center={center}
      minZoom={1}
      maxZoom={4}
      zoom={2}
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
        url={`/maps/${dungeon.key}/{z}/{x}_{y}.png`}
      />
      <Mobs dungeon={dungeon} />
      <PullOutlines />
    </MapContainer>
  )
}
