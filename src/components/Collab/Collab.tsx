import { useEffect, useMemo } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { RootState } from '../../store/store.ts'
import { SyncYJson } from './YRedux'

export function Collab() {
  const { map, provider } = useMemo(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider('your-room-name', doc, {
      signaling: ['ws://localhost:1234'],
    })
    const map = doc.getMap('data')
    return { doc, map, provider }
  }, [])

  useEffect(
    () => () => {
      provider.destroy()
    },
    [provider],
  )

  return (
    <SyncYJson
      yJson={map}
      setData={setRoute}
      selectData={(state: RootState) => state.routes.present.route}
    />
  )
}
