import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CRS, svg } from 'leaflet'
import '../Leaflet/SmoothWheelZoom.ts'
import '../Leaflet/BoxSelect.ts'
import { Drawings } from './Drawings/Drawings.tsx'
import { Notes } from './Notes/Notes.tsx'
import { MapContextMenu } from './MapContextMenu.tsx'
import { MousePosition } from '../Leaflet/MousePosition.tsx'
import { mapBounds, mapCenter } from '../../util/map.ts'
import { useEffect } from 'react'
import { setMapObjectsHidden } from '../../store/reducers/mapReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { PatherComponent } from './Draw/PatherComponent.tsx'
import { AwarenessCursors } from '../Collab/AwarenessCursors.tsx'
import { MapInitialZoom } from './MapInitialZoom.tsx'
import { LiveControllerWrapper } from '../Live/LiveControllerWrapper.tsx'
import { Mobs } from './Mobs/Mobs.tsx'
import { PullOutlines } from './PullOutlines/PullOutlines.tsx'
import { isDev } from '../../util/isDev.ts'
import { PointsOfInterest } from './PointsOfInterest/PointsOfInterest.tsx'

const renderer = svg({ padding: 100 })

export function Map() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

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
        renderer={renderer}
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
        smoothWheelZoom
        smoothSensitivity={2}
        boxZoom={false}
        boxSelect
      >
        <TileLayer
          bounds={mapBounds}
          noWrap
          minNativeZoom={2}
          maxNativeZoom={2}
          url={`/maps/${dungeon.key}/{z}/{x}_{y}.jpg`}
        />
        {/*<WclCoordinateTest />*/}
        <Mobs />
        <PullOutlines />
        <Drawings />
        <Notes />
        <PointsOfInterest />
        <MapContextMenu />
        <PatherComponent />
        <MapInitialZoom />
        <AwarenessCursors />
        <LiveControllerWrapper />
        {isDev && <MousePosition />}
      </MapContainer>
    </div>
  )
}
