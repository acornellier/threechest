import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { SyncYAwareness, SyncYJson } from './YRedux'
import {
  selectAwarenessStates,
  selectLocalAwareness,
  useAppDispatch,
  useRootSelector,
} from '../../store/hooks.ts'
import { setAwarenessStates, setMousePosition } from '../../store/reducers/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { AwarenessVisuals } from './AwarenessVisuals.tsx'
import { useMap } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

const selectData = (state: RootState) => state.routes.present.route

export function Collab() {
  const dispatch = useAppDispatch()
  const room = useRootSelector((state) => state.collab.room)
  const [yObjects, setYObjects] = useState<{
    map: Y.Map<Route>
    provider: WebrtcProvider
  }>()
  const leafletMap = useMap()

  useEffect(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(room, doc)
    const map = doc.getMap<Route>('data')
    setYObjects({ map, provider })

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
  }, [leafletMap, room])

  if (!yObjects) return null

  const { map, provider } = yObjects

  return (
    <>
      <SyncYJson yJson={map} setData={setRoute} selectData={selectData} />
      <SyncYAwareness
        awareness={provider.awareness}
        setAwarenessStates={setAwarenessStates}
        selectLocalAwarenessState={selectLocalAwareness}
        selectAwarenessStates={selectAwarenessStates}
      />
      <AwarenessVisuals />
    </>
  )
}
