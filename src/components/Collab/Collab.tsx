import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { SignalingConn, WebrtcProvider } from 'y-webrtc'
import { SyncYAwareness, SyncYJson } from './YRedux'
import { selectLocalAwareness, useAppDispatch, useCollabSelector } from '../../store/hooks.ts'
import {
  setAwarenessStates,
  setMousePosition,
  setWsConnected,
} from '../../store/reducers/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { AwarenessCursors } from './AwarenessCursors.tsx'
import { useMap } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { NoHostChecker } from './NoHostChecker.tsx'

const selectData = (state: RootState) => state.routes.present.route

const signaling = [
  'wss://y-webrtc-signaler-ypze.onrender.com',
  // 'ws://localhost:4444',
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

    const ws = provider.signalingConns[0] as SignalingConn

    const onWsConnect = () => dispatch(setWsConnected(true))
    const onWsDisconnect = () => {
      dispatch(addToast({ message: 'Lost connection to the Collab server.', type: 'error' }))
      dispatch(setWsConnected(false))
    }

    const onMouseMove = (e: LeafletMouseEvent) => dispatch(setMousePosition(e.latlng))
    const onMouseOut = () => dispatch(setMousePosition(null))

    if (ws.connected) onWsConnect()
    ws.on('connect', onWsConnect)
    ws.on('disconnect', onWsDisconnect)

    leafletMap.addEventListener('mousemove', onMouseMove)
    leafletMap.addEventListener('mouseout', onMouseOut)

    return () => {
      provider.destroy()
      ws.off('connect', onWsConnect)
      ws.off('disconnect', onWsDisconnect)
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
