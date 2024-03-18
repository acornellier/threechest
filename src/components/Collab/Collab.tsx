import { useEffect, useState } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { SyncYAwareness, SyncYJson } from './YRedux'
import { selectAwarenessStates, selectLocalAwareness, useRootSelector } from '../../store/hooks.ts'
import { setAwarenessStates } from '../../store/reducers/collabReducer.ts'
import { RootState } from '../../store/store.ts'
import { Route } from '../../util/types.ts'
import { setRoute } from '../../store/routes/routesReducer.ts'

const selectData = (state: RootState) => state.routes.present.route

export function Collab() {
  const room = useRootSelector((state) => state.collab.room)
  const [yObjects, setYObjects] = useState<{
    map: Y.Map<Route>
    provider: WebrtcProvider
  }>()

  useEffect(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(room, doc, { signaling: ['ws://localhost:1234'] })
    const map = doc.getMap<Route>('data')
    setYObjects({ map, provider })
    provider.awareness.setLocalState({ cursorPosition: { x: Math.random(), y: Math.random() } })

    return () => {
      provider.destroy()
    }
  }, [room])

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
    </>
  )
}
