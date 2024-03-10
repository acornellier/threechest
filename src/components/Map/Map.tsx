import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS, LatLngBoundsExpression } from 'leaflet'
import '../Leaflet/SmoothWheelZoom/SmoothWheelZoom'
import { Mobs } from './Mobs.tsx'
import { PullOutlines } from './PullOutlines.tsx'
import { useDungeon } from '../../store/hooks.ts'
import { Drawings } from './Drawings.tsx'
import { Notes } from './Notes.tsx'
import { MapContextMenu } from './MapContextMenu.tsx'

const height = 256
const width = 384
const maxCoords = [-height, width] as const

const center = [maxCoords[0] / 2, maxCoords[1] / 2 + 50] as const

const bounds: LatLngBoundsExpression = [
  [0, 0],
  [-height, width],
]

export function Map() {
  const dungeon = useDungeon()

  return (
    <div className="w-full z-10">
      <MapContainer
        key={dungeon.key}
        className="bg-inherit w-screen h-screen"
        crs={CRS.Simple}
        center={[center[0] + dungeon.defaultOffset[0], center[1] + dungeon.defaultOffset[1]]}
        keyboard={false}
        doubleClickZoom={false}
        attributionControl={false}
        minZoom={1}
        maxZoom={4}
        zoom={dungeon.defaultZoom}
        zoomSnap={0}
        zoomControl={false}
        scrollWheelZoom={false}
        /* @ts-ignore */
        smoothWheelZoom={true}
        smoothSensitivity={2}
      >
        <TileLayer bounds={bounds} noWrap url={`/maps/${dungeon.key}/{z}/{x}_{y}.png`} />
        <MapContextMenu />
        <Mobs />
        <PullOutlines />
        <Drawings />
        <Notes />
      </MapContainer>
    </div>
  )
}
