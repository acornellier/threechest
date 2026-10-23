import 'leaflet/dist/leaflet.css'
import './routeMap.scss'
import '../components/Leaflet/SmoothWheelZoom.ts'
import type { CSSProperties } from 'react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { Middleware } from '@reduxjs/toolkit'
import { configureStore, isAction } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { CircleMarker, MapContainer, Pane, TileLayer } from 'react-leaflet'
import { CRS, svg } from 'leaflet'
import { routesReducer, selectPull, setRouteFromMdt, toggleSpawn } from '../store/routes/routesReducer.ts'
import { hoverReducer } from '../store/reducers/hoverReducer.ts'
import { importReducer } from '../store/reducers/importReducer.ts'
import { compareReducer } from '../store/reducers/compareReducer.ts'
import { mapReducer, setMapObjectsHidden } from '../store/reducers/mapReducer.ts'
import { toastReducer } from '../store/reducers/toastReducer.ts'
import { collabReducer } from '../store/collab/collabReducer.ts'
import { cloudReducer } from '../store/reducers/cloudReducer.ts'
import { mobSearchReducer } from '../store/reducers/mobSearchReducer.ts'
import { decodeMdtString } from '../util/mdt/mdt2.ts'
import { assetUrl, setAssetBaseUrl } from '../util/assetUrl.ts'
import { mapBounds, mapCenter, mapHeight, mapWidth } from '../util/map.ts'
import { useDungeon } from '../store/routes/routeHooks.ts'
import { useAppDispatch } from '../store/storeUtil.ts'
import { IconScaling } from '../components/Map/IconScaling.tsx'
import { Mobs } from '../components/Map/Mobs/Mobs.tsx'
import { PullOutlines } from '../components/Map/PullOutlines/PullOutlines.tsx'
import { Notes } from '../components/Map/Notes/Notes.tsx'
import { PointsOfInterest } from '../components/Map/PointsOfInterest/PointsOfInterest.tsx'
import { MapInitialZoom } from '../components/Map/MapInitialZoom.tsx'
import { mapBounds as uiMapBounds } from '../data/coordinates/mapBounds.ts'
import { wclPointToLeafletPoint } from '../util/wclCalc.ts'
import { mdtMapHeight, mdtMapWidth } from './mdtProjection.ts'

export interface RouteMapActor {
  id: string
  /** In-game world coordinates. */
  x: number
  y: number
  mapId: number
  /** Position in MDT pixels, used instead of x/y/mapId when set. */
  mdtPosition?: [number, number]
  color: string
  radius?: number
}

export interface RouteMapProps {
  mdtString: string
  selectedPull?: number
  onPullSelect?: (pullIndex: number) => void
  actors?: RouteMapActor[]
  /** Where map tiles and icons are served from. */
  assetBaseUrl?: string
  className?: string
  style?: CSSProperties
}

type PullSelectRef = { current: ((pullIndex: number) => void) | undefined }
type RouteMapState = { routes: ReturnType<typeof routesReducer> }

const allowedRouteActions = new Set<string>([setRouteFromMdt.type, selectPull.type])

// The map components are threechest's editor, so clicking a mob would edit the route. Here a click
// selects the mob's pull instead, and every other edit is dropped.
const readOnlyMiddleware =
  (onPullSelect: PullSelectRef): Middleware<object, RouteMapState> =>
  (api) =>
  (next) =>
  (action) => {
    if (!isAction(action)) return next(action)

    if (toggleSpawn.match(action)) {
      const { pulls } = api.getState().routes.present.route
      const pullIndex = pulls.findIndex((pull) => pull.spawns.includes(action.payload.spawn))
      if (pullIndex !== -1) api.dispatch(selectPull(pullIndex))
      return
    }

    if (action.type.startsWith('routes/') && !allowedRouteActions.has(action.type)) return

    const result = next(action)
    if (selectPull.match(action) && !(action as { meta?: { fromProps?: boolean } }).meta?.fromProps)
      onPullSelect.current?.(action.payload)
    return result
  }

const reducer = {
  routes: routesReducer,
  hover: hoverReducer,
  import: importReducer,
  compare: compareReducer,
  map: mapReducer,
  toast: toastReducer,
  collab: collabReducer,
  cloud: cloudReducer,
  mobSearch: mobSearchReducer,
}

function createRouteMapStore(onPullSelect: PullSelectRef) {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).prepend(
        readOnlyMiddleware(onPullSelect),
      ),
  })
}

const renderer = svg({ padding: 100 })

const StaticLayers = memo(function StaticLayers() {
  const dungeon = useDungeon()

  return (
    <>
      <TileLayer
        bounds={mapBounds}
        noWrap
        minNativeZoom={2}
        maxNativeZoom={2}
        url={assetUrl(`/maps/${dungeon.key}/{x}_{y}.jpg`)}
      />
      <IconScaling />
      <Mobs />
      <PullOutlines />
      <Notes />
      <PointsOfInterest />
      <MapInitialZoom />
    </>
  )
})

function Actors({ actors }: { actors: RouteMapActor[] }) {
  return (
    <Pane name="actors" style={{ zIndex: 650 }}>
      {actors.map((actor) => {
        let center: [number, number]
        if (actor.mdtPosition) {
          const [mdtX, mdtY] = actor.mdtPosition
          center = [(-mdtY / mdtMapHeight) * mapHeight, (mdtX / mdtMapWidth) * mapWidth]
        } else if (uiMapBounds[actor.mapId]) {
          center = wclPointToLeafletPoint(
            { x: actor.x * 100, y: actor.y * 100, mapID: actor.mapId, timestamp: 0 },
            [],
          )
        } else {
          return null
        }

        return (
          <CircleMarker
            key={actor.id}
            center={center}
            radius={actor.radius ?? 6}
            interactive={false}
            pathOptions={{ color: 'black', weight: 1, fillColor: actor.color, fillOpacity: 1 }}
          />
        )
      })}
    </Pane>
  )
}

function RouteMapContents({ actors }: { actors: RouteMapActor[] | undefined }) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

  useEffect(() => {
    dispatch(setMapObjectsHidden(false))
  }, [dispatch, dungeon])

  return (
    <MapContainer
      key={dungeon.key}
      className="bg-inherit w-full h-full"
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
    >
      <StaticLayers />
      {actors && <Actors actors={actors} />}
    </MapContainer>
  )
}

export function RouteMap({
  mdtString,
  selectedPull,
  onPullSelect,
  actors,
  assetBaseUrl = 'https://threechest.io',
  className,
  style,
}: RouteMapProps) {
  setAssetBaseUrl(assetBaseUrl)

  const onPullSelectRef = useRef(onPullSelect)
  onPullSelectRef.current = onPullSelect

  const store = useMemo(() => createRouteMapStore(onPullSelectRef), [])
  const [loadedMdtString, setLoadedMdtString] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setLoadedMdtString(null)
    if (!mdtString) return

    decodeMdtString(mdtString)
      .then((mdtRoute) => {
        if (cancelled) return
        store.dispatch(setRouteFromMdt({ mdtRoute }))
        setLoadedMdtString(mdtString)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [store, mdtString])

  useEffect(() => {
    if (selectedPull === undefined || loadedMdtString === null) return
    store.dispatch({ ...selectPull(selectedPull), meta: { fromProps: true } })
  }, [store, selectedPull, loadedMdtString])

  return (
    <div className={`threechest-route-map ${className ?? ''}`} style={style}>
      {error ? (
        <div className="p-4">Failed to load route: {error}</div>
      ) : loadedMdtString !== null ? (
        <Provider store={store}>
          <RouteMapContents actors={actors} />
        </Provider>
      ) : null}
    </div>
  )
}
