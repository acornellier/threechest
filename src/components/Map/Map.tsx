import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS } from 'leaflet'
import '../Leaflet/SmoothWheelZoom.ts'
import '../Leaflet/BoxSelect/BoxSelect'
import { Drawings } from './Drawings.tsx'
import { Notes } from './Notes.tsx'
import { MapContextMenu } from './MapContextMenu.tsx'
import { MousePosition } from '../Leaflet/MousePosition/MousePosition'
import { isDev } from '../../util/dev.ts'
import { Mobs } from './Mobs.tsx'
import { PullOutlines } from './PullOutlines.tsx'
import { MapInitialZoom } from './MapInitialZoom.tsx'
import { mapBounds, mapCenter } from '../../util/map.ts'
import { useEffect } from 'react'
import { setMapObjectsHidden } from '../../store/reducers/mapReducer.ts'
import { Collab } from '../Collab/Collab.tsx'
import { useCollabSelector } from '../../store/collab/collabReducer.ts'

import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/hooks.ts'

export function Map() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const collabActive = useCollabSelector((state) => state.active)

  useEffect(() => {
    dispatch(setMapObjectsHidden(true))
    setTimeout(() => dispatch(setMapObjectsHidden(false)), 50)
  }, [dispatch, dungeon])

  return (
    <div className="w-full z-10">
      <MapContainer
        key={dungeon.key}
        className="bg-inherit w-screen h-screen"
        crs={CRS.Simple}
        center={mapCenter}
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
        <Mobs />
        <PullOutlines />
        <Drawings />
        <Notes />
        <MapContextMenu />
        <MapInitialZoom />
        {collabActive && <Collab />}
        {isDev && <MousePosition />}
      </MapContainer>
    </div>
  )
}
