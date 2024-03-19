import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { SyncYAwareness, SyncYJson } from './YRedux'
import {
  selectLocalAwareness,
  useAppDispatch,
  useRootSelector,
  useSavedCollabColor,
  useSavedCollabName,
} from '../../store/hooks.ts'
import {
  setAwarenessStates,
  setInitialAwareness,
  setMousePosition,
} from '../../store/reducers/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { AwarenessCursors } from './AwarenessCursors.tsx'
import { useMap } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { generateSlug } from 'random-word-slugs'

const selectData = (state: RootState) => state.routes.present.route

export function Collab() {
  const dispatch = useAppDispatch()
  const room = useRootSelector((state) => state.collab.room)
  const startedCollab = useRootSelector((state) => state.collab.startedCollab)
  const [savedName] = useSavedCollabName()
  const [savedColor] = useSavedCollabColor()
  const leafletMap = useMap()

  const [yObjects, setYObjects] = useState<{ map: Y.Map<Route>; provider: WebrtcProvider }>()

  useEffect(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(room, doc)
    const map = doc.getMap<Route>('data')
    setYObjects({ map, provider })

    dispatch(
      setInitialAwareness({
        clientId: doc.clientID,
        isCurrentClient: true,
        name: savedName || generateSlug(2, { format: 'title' }),
        clientType: startedCollab ? 'host' : 'guest',
        joinTime: new Date().getTime(),
        color: savedColor || null,
      }),
    )

    const onMouseMove = (e: LeafletMouseEvent) => {
      dispatch(setMousePosition(e.latlng))
    }

    const onMouseOut = () => {
      dispatch(setMousePosition(null))
    }

    leafletMap.addEventListener('mousemove', onMouseMove)
    leafletMap.addEventListener('mouseout', onMouseOut)

    return () => {
      provider.destroy()
      leafletMap.removeEventListener('mousemove', onMouseMove)
      leafletMap.removeEventListener('mousemove', onMouseOut)
    }
  }, [dispatch, leafletMap, room, startedCollab])

  if (!yObjects) return null

  const { map, provider } = yObjects

  return (
    <>
      <SyncYJson yJson={map} setData={setRoute} selectData={selectData} />
      <SyncYAwareness
        awareness={provider.awareness}
        setAwarenessStates={setAwarenessStates}
        selectLocalAwarenessState={selectLocalAwareness}
      />
      <AwarenessCursors />
    </>
  )
}
