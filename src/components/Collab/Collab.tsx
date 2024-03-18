import { useEffect, useMemo } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { setRoute } from '../../store/routes/routesReducer.ts'
import { RootState } from '../../store/store.ts'
import { SyncYJson } from './YRedux'
import { useRootSelector } from '../../store/hooks.ts'

export function Collab() {
  const room = useRootSelector((state) => state.collab.room)

  const { map, provider } = useMemo(() => {
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(room, doc, { signaling: ['ws://localhost:1234'] })
    const map = doc.getMap('data')
    return { doc, map, provider }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
