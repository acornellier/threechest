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
    console.warn('syncLocalIntoRemote Not syncing: Local data is undefined')
    return
  }

  console.debug('syncLocalIntoRemote Syncing', data)
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

  console.debug('syncRemoteIntoLocal Syncing', states)
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

  // On mount sync remote into local
  useEffect(() => {
    syncRemoteIntoLocal(awareness, store, setAwarenessStates)
  }, [awareness, selectLocalAwarenessState, setAwarenessStates, store])

  // Subscribe to local changes
  useEffect(() => {
    const unsubscribe = cachedSubscribe(store, selectLocalAwarenessState, (data) =>
      syncLocalIntoRemote(awareness, data),
    )

    return () => unsubscribe()
  }, [awareness, store, selectLocalAwarenessState])

  // Subscribe to remote changes
  useEffect(() => {
    let initialAwarenessReceived = false
    const observer = (_changes: unknown, origin: 'local' | unknown): void => {
      console.log('ob', _changes, origin, initialAwarenessReceived, awareness)
      if (origin === 'local' && !initialAwarenessReceived) return

      initialAwarenessReceived = true
      syncRemoteIntoLocal(awareness, store, setAwarenessStates)
    }

    awareness.on('change', observer)

    return () => {
      awareness.off('change', observer)
    }
  }, [awareness, setAwarenessStates, store])

  return null
}
