import { useEffect } from 'react'
import { Action } from 'redux'
import { Awareness } from 'y-protocols/awareness.js'
import { cachedSubscribe } from './redux-subscriber.ts'
import { useAppStore } from '../../../store/hooks.ts'
import { AppStore, RootState } from '../../../store/store.ts'

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
  store: AppStore,
  setAwarenessStates: (awarenessStates: T[]) => Action,
): void => {
  const states: T[] = [...awareness.getStates().entries()].map(([clientId, state]) => ({
    ...(state as T),
    clientId: Number(clientId),
    isCurrentClient: awareness.clientID === Number(clientId),
  }))

  // console.debug('[SyncYAwareness:syncRemoteIntoLocal] Syncing')
  store.dispatch(setAwarenessStates(states))
}

export const SyncYAwareness = <T extends BaseAwarenessState>({
  awareness,
  setAwarenessStates,
  selectLocalAwarenessState,
}: {
  awareness: Awareness
  setAwarenessStates: (awarenessStates: T[]) => Action
  selectLocalAwarenessState: (state: RootState) => T | undefined
}): null => {
  const store = useAppStore()

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
    const observer = (_changes: unknown, origin: 'local' | unknown): void => {
      if (origin === 'local') return
      syncRemoteIntoLocal(awareness, store, setAwarenessStates)
    }

    awareness.on('change', observer)

    return () => {
      awareness.off('change', observer)
    }
  }, [awareness, setAwarenessStates, store])

  return null
}
