import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { CRS, LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import '../Leaflet/SmoothWheelZoom.ts'
import '../Leaflet/BoxSelect/BoxSelect'
import { useDungeon } from '../../store/hooks.ts'
import { Drawings } from './Drawings.tsx'
import { Notes } from './Notes.tsx'
import { MapContextMenu } from './MapContextMenu.tsx'
import { useEffect } from 'react'
import { mapHeight, mapWidth } from '../../data/dungeons.ts'
import { MousePosition } from '../Leaflet/MousePosition/MousePosition'
import { Dungeon } from '../../data/types.ts'
import { isDev } from '../../util/dev.ts'
import { Mobs } from './Mobs.tsx'
import { PullOutlines } from './PullOutlines.tsx'

const maxCoords: LatLngExpression = [-mapHeight, mapWidth]
const center: LatLngExpression = [maxCoords[0] / 2, maxCoords[1] / 2]
const mapBounds: LatLngBoundsExpression = [[0, 0], maxCoords]

function getAdjustedBounds(dungeon: Dungeon): LatLngBoundsExpression {
  if (!dungeon.defaultBounds) return mapBounds

  const topbarOffset = 10
  const top = Math.min(0, dungeon.defaultBounds[0][0] + topbarOffset)
  const left = dungeon.defaultBounds[0][1]
  const bottom = dungeon.defaultBounds[1][0]
  const sidebarOffset = 50
  const right = dungeon.defaultBounds[1][1] + sidebarOffset

  return [
    [top, left],
    [bottom, right],
  ]
}

function MapInitialZoom() {
  const map = useMap()
  const dungeon = useDungeon()

  useEffect(() => {
    const bounds = getAdjustedBounds(dungeon)
    map.fitBounds(bounds, {
      animate: false,
    })
  }, [map, dungeon])

  return null
}

export function Map() {
  const dungeon = useDungeon()

  return (
    <div className="w-full z-10">
      <MapContainer
        key={dungeon.key}
        className="bg-inherit w-screen h-screen"
        crs={CRS.Simple}
        center={center}
        keyboard={false}
        doubleClickZoom={false}
        attributionControl={false}
        minZoom={1}
        maxZoom={5}
        zoom={2}
        zoomSnap={0}
        zoomControl={false}
        scrollWheelZoom={false}
        smoothWheelZoom={true}
        smoothSensitivity={2}
        boxZoom={false}
        boxSelect={true}
      >
        <TileLayer
          bounds={mapBounds}
          noWrap
          minNativeZoom={1}
          maxNativeZoom={4}
          url={`/maps/${dungeon.key}/{z}/{x}_{y}.png`}
        />
        <MapContextMenu />
        <Mobs />
        <PullOutlines />
        <Drawings />
        <Notes />
        {isDev && <MousePosition />}
        <MapInitialZoom />
      </MapContainer>
    </div>
  )
}
