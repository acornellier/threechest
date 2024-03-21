import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { SyncYAwareness, SyncYJson } from './YRedux'
import {
  promoteToHost,
  selectLocalAwareness,
  setAwarenessStates,
  setMousePosition,
  setWsConnected,
  useCollabSelector,
} from '../../store/collab/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { AwarenessCursors } from './AwarenessCursors.tsx'
import { useMap } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { WebrtcProvider } from './y-webrtc/y-webrtc.js'
import { NoHostChecker } from './NoHostChecker.tsx'
import { useAppDispatch } from '../../store/storeUtil.ts'

const selectData = (state: RootState) => state.routes.present.route

const signaling = [
  'wss://threechest-rtc-server-fccc158b4d6c.herokuapp.com',
  // 'ws://localhost:8787',
]

if (signaling.length !== 1) {
  console.error('Signaling length should be exactly 1')
}

export function Collab() {
  const dispatch = useAppDispatch()
  const room = useCollabSelector((state) => state.room)
  const leafletMap = useMap()
  const [yObjects, setYObjects] = useState<{ map: Y.Map<Route>; provider: WebrtcProvider }>()

  useEffect(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(room, doc, { signaling })
    const map = doc.getMap<Route>('data')
    setYObjects({ map, provider })

    const sc = provider.signalingConns[0]!

    const onWsConnect = () => dispatch(setWsConnected(true))
    const onWsDisconnect = () => {
      dispatch(addToast({ message: 'Lost connection to the Collab server.', type: 'error' }))
      dispatch(setWsConnected(false))
    }

    const onMouseMove = (e: LeafletMouseEvent) => dispatch(setMousePosition(e.latlng))
    const onMouseOut = () => dispatch(setMousePosition(null))
    const onRoomSize = (roomSize: number) => {
      if (roomSize === 1) {
        dispatch(promoteToHost())
      }
    }

    if (sc.connected) onWsConnect()
    sc.on('connect', onWsConnect)
    sc.on('disconnect', onWsDisconnect)
    sc.on('roomsize', onRoomSize)

    leafletMap.addEventListener('mousemove', onMouseMove)
    leafletMap.addEventListener('mouseout', onMouseOut)

    return () => {
      provider.destroy()
      sc.off('connect', onWsConnect)
      sc.off('disconnect', onWsDisconnect)
      sc.off('roomsize', onWsDisconnect)
      leafletMap.removeEventListener('mousemove', onMouseMove)
      leafletMap.removeEventListener('mousemove', onMouseOut)
    }
  }, [dispatch, leafletMap, room])

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
      <NoHostChecker />
    </>
  )
}
