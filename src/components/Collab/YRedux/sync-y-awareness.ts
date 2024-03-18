import { useEffect } from 'react'
import { useStore } from 'react-redux'
import { Action, Store } from 'redux'
import { Awareness } from 'y-protocols/awareness.js'
import { cachedSubscribe } from './redux-subscriber.ts'
import { isEqual } from 'moderndash'

export type BaseAwarenessState = {
  clientId: number
  isCurrentClient: boolean
}

const syncLocalIntoRemote = <T extends BaseAwarenessState>(
  awareness: Awareness,
  data: T | undefined,
): void => {
  if (data === undefined) {
    // console.debug('[SyncYAwareness:syncLocalIntoRemote] Not syncing: Local data is undefined')
    return
  }

  // console.debug('[SyncYAwareness:syncLocalIntoRemote] Syncing', data)
  awareness.setLocalState(data)
}

const syncRemoteIntoLocal = <T extends BaseAwarenessState>(
  awareness: Awareness,
  store: Store<any, Action>,
  selectAwarenessStates: (state: any) => T[] | undefined,
  setAwarenessStates: (awarenessStates: T[]) => Action,
): void => {
  const states: T[] = [...awareness.getStates().entries()].map(([clientId, state]) => ({
    ...(state as T),
    clientId: Number(clientId),
    isCurrentClient: awareness.clientID === Number(clientId),
  }))

  const latestReduxAwareness = selectAwarenessStates(store.getState())

  // console.debug('[SyncYAwareness:syncRemoteIntoLocal] Syncing')
  if (isEqual(states, latestReduxAwareness)) {
    // console.debug(
    //   '[SyncYAwareness:syncRemoteIntoLocal] Not syncing: Remote already equals local data',
    // )
    return
  }

  store.dispatch(setAwarenessStates(states))
}

export const SyncYAwareness = <T extends BaseAwarenessState>({
  awareness,
  setAwarenessStates,
  selectLocalAwarenessState,
  selectAwarenessStates,
}: {
  awareness: Awareness
  setAwarenessStates: (awarenessStates: T[]) => Action
  selectLocalAwarenessState: (state: any) => T | undefined
  selectAwarenessStates: (state: any) => T[] | undefined
}): null => {
  const store = useStore()

  // On mount sync local into remote
  useEffect(() => {
    syncLocalIntoRemote(awareness, selectLocalAwarenessState(store.getState()))
  }, [awareness, selectLocalAwarenessState, store])

  // Subscribe to local changes
  useEffect(() => {
    const unsubscribe = cachedSubscribe(store, selectLocalAwarenessState, (data) =>
      syncLocalIntoRemote(awareness, data),
    )

    return () => unsubscribe()
  }, [awareness, store, selectLocalAwarenessState])

  // Subscribe to remote changes
  useEffect(() => {
    const observer = (): void => {
      syncRemoteIntoLocal(awareness, store, selectAwarenessStates, setAwarenessStates)
    }

    awareness.on('change', observer)

    return () => {
      awareness.off('change', observer)
    }
  }, [awareness, selectAwarenessStates, setAwarenessStates, store])

  return null
}
