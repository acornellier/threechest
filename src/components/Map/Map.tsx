import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS, LatLngBoundsExpression, LatLngExpression, Point } from 'leaflet'
import { MousePosition } from '../Leaflet/MousePosition/MousePosition'
import '../Leaflet/SmoothWheelZoom/SmoothWheelZoom'
import { Mobs } from './Mobs.tsx'

import { dungeonsByKey } from '../../data/dungeons.ts'
import { PullOutlines } from './PullOutlines.tsx'

const height = 256
const width = 384
const maxCoords = [-height, width]

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [-height, width],
]

export function Map() {
  const center: LatLngExpression = [maxCoords[0] / 2, maxCoords[1] / 2]
  const dungeon = dungeonsByKey['vp']

  return (
    <MapContainer
      className="bg-inherit w-screen h-screen"
      crs={CRS.Simple}
      center={center}
      minZoom={1}
      maxZoom={5}
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
        tileSize={new Point(width, height)}
        url={`/${dungeon.key}/map/{z}/{x}_{y}.png`}
      />
      <Mobs dungeon={dungeon} />
      <PullOutlines />
    </MapContainer>
  )
}
