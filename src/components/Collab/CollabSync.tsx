import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { SyncYAwareness, SyncYJson } from './YRedux'
import {
  promoteSelfToHost,
  selectLocalAwareness,
  setAwarenessStates,
  setWsConnected,
  useCollabSelector,
} from '../../store/collab/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRouteForCollab } from '../../store/routes/routesReducer.ts'
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

function CollabSync() {
  const dispatch = useAppDispatch()
  const room = useCollabSelector((state) => state.room)
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

    const onRoomSize = (roomSize: number) => {
      if (roomSize === 1) {
        dispatch(promoteSelfToHost(false))
      }
    }

    if (sc.connected) onWsConnect()
    sc.on('connect', onWsConnect)
    sc.on('disconnect', onWsDisconnect)
    sc.on('roomsize', onRoomSize)

    return () => {
      provider.destroy()
      sc.off('connect', onWsConnect)
      sc.off('disconnect', onWsDisconnect)
      sc.off('roomsize', onWsDisconnect)
    }
  }, [dispatch, room])

  if (!yObjects) return null

  const { map, provider } = yObjects

  return (
    <>
      <SyncYJson yJson={map} setData={setRouteForCollab} selectData={selectData} />
      <SyncYAwareness
        awareness={provider.awareness}
        setAwarenessStates={setAwarenessStates}
        selectLocalAwarenessState={selectLocalAwareness}
      />
      <NoHostChecker />
    </>
  )
}

export function CollabSyncWrapper() {
  const collabActive = useCollabSelector((state) => state.active)
  if (!collabActive) return false

  return <CollabSync />
}
