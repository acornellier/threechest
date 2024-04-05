import { Action, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { RootState } from './store.ts'
import { addToast } from './reducers/toastReducer.ts'
import { importRoute } from './reducers/importReducer.ts'
import { REHYDRATE } from 'redux-persist/es/constants'
import { ActionCreators } from 'redux-undo'
import {
  backupCollabRoute,
  duplicateRoute,
  loadRoute,
  newRoute,
  removeInvalidSpawns,
  restoreLiveBackup,
  setDungeon,
  setRouteForCollab,
  setRouteFromMdt,
  setRouteFromSample,
  updateSavedRoutes,
} from './routes/routesReducer.ts'
import {
  endCollab,
  promoteSelfToHost,
  selectLocalAwareness,
  selectLocalAwarenessIsGuest,
  setAwarenessStates,
  startCollab,
} from './collab/collabReducer.ts'
import { dungeonsByKey } from '../data/dungeons.ts'
import { setDrawColor } from './reducers/mapReducer.ts'
import { UnknownAction } from 'redux'
import { selectActualRoute } from './routes/routeHooks.ts'

export const listenerMiddleware = createListenerMiddleware()

// on import route, send a toast
listenerMiddleware.startListening({
  actionCreator: setRouteFromMdt,
  effect: async ({ payload: { mdtRoute, copy } }, listenerApi) => {
    if (copy) {
      const state = listenerApi.getState() as RootState
      listenerApi.dispatch(
        addToast({
          message: `Imported route ${mdtRoute.text} as ${state.routes.present.route.name}`,
        }),
      )
    } else {
      listenerApi.dispatch(addToast({ message: `Route imported: ${mdtRoute.text}` }))
    }
  },
})

// on import route fail, send an error toast
listenerMiddleware.startListening({
  matcher: isAnyOf(importRoute.rejected),
  effect: async ({ error }, listenerApi) => {
    console.error((error as Error).stack)
    listenerApi.dispatch(
      addToast({ message: `Failed to import route: ${(error as Error).message}`, type: 'error' }),
    )
  },
})

// on rehydrate, clear history
listenerMiddleware.startListening({
  type: REHYDRATE,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(restoreLiveBackup())
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})

// on new route, clear history, but save saved routes first
listenerMiddleware.startListening({
  matcher: isAnyOf(
    setDungeon.fulfilled,
    loadRoute.fulfilled,
    duplicateRoute,
    setRouteFromMdt,
    setRouteFromSample,
    newRoute,
  ),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const isGuest = selectLocalAwarenessIsGuest(state)
    if (!isGuest) listenerApi.dispatch(updateSavedRoutes())
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})

// on load route, verify mob spawns
listenerMiddleware.startListening({
  matcher: isAnyOf(
    (action): action is Action => action.type === REHYDRATE,
    loadRoute.fulfilled,
    setRouteFromMdt,
    setRouteFromSample,
  ),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const route = state.routes.present.route
    if (!route) return

    const dungeon = dungeonsByKey[route.dungeonKey]
    if (!dungeon) return

    const missingIds = []
    for (const pull of route.pulls) {
      for (const spawnId of pull.spawns) {
        const mobSpawn = dungeon.mobSpawns[spawnId]
        if (mobSpawn) continue

        missingIds.push(spawnId)
      }
    }

    if (missingIds.length === 0) return

    console.error(`Found invalid spawnIds in current route: ${missingIds.join(',')}`)
    listenerApi.dispatch(removeInvalidSpawns(missingIds))
    listenerApi.dispatch(
      addToast({ message: 'Invalid enemies found in route have been removed.', type: 'error' }),
    )
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})

// if collab color changes, change draw color
listenerMiddleware.startListening({
  predicate: (action: Action, currentState, originalState) => {
    if (!action.type.startsWith('collab/')) return false
    const oldColor = selectLocalAwareness(originalState as RootState)?.color
    const newColor = selectLocalAwareness(currentState as RootState)?.color
    return !!newColor && oldColor !== newColor
  },
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    const localAwareness = selectLocalAwareness(state)
    if (localAwareness?.color) listenerApi.dispatch(setDrawColor(localAwareness.color))
  },
})

// on host promotion, send a toast
listenerMiddleware.startListening({
  predicate: (action: UnknownAction, currentState, originalState) => {
    if (action.type === promoteSelfToHost.type) return action.payload === true
    if (action.type !== setAwarenessStates.type) return false

    const oldClientType = selectLocalAwareness(originalState as RootState)?.clientType
    const newClientType = selectLocalAwareness(currentState as RootState)?.clientType
    return oldClientType === 'guest' && newClientType === 'host'
  },
  effect: async (_, listenerApi) => {
    listenerApi.dispatch(
      addToast({ message: 'You have been promoted to the host of this collab.', type: 'info' }),
    )
  },
})

// Whenever route UID changes or collab starts, update backup
listenerMiddleware.startListening({
  predicate: (action: Action, currentState, originalState) => {
    if (action.type === startCollab.type) return true

    if (!action.type.startsWith('routes/')) return false
    return (
      (originalState as RootState).routes.present.route.uid !==
      (currentState as RootState).routes.present.route.uid
    )
  },
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(backupCollabRoute())
  },
})

// Check that guests aren't modifying things they shouldn't be
listenerMiddleware.startListening({
  predicate: (action: Action, currentState, originalState) => {
    const isGuestCollab = selectLocalAwarenessIsGuest(currentState as RootState)
    if (!isGuestCollab) return false

    // This means the change was done by another client
    if (action.type === setRouteForCollab.type) return false

    const prevRoute = selectActualRoute(originalState as RootState)
    const curRoute = selectActualRoute(currentState as RootState)
    return (
      prevRoute.uid !== curRoute.uid ||
      prevRoute.name !== curRoute.name ||
      prevRoute.dungeonKey !== curRoute.dungeonKey
    )
  },
  effect: (action, listenerApi) => {
    console.error(`Guest somehow made illegal changes with action ${JSON.stringify(action)}`)
    listenerApi.dispatch(endCollab())
    listenerApi.dispatch(
      addToast({
        message:
          'An error occured and you were removed from the collab room. To rejoin use the "Rejoin last collab" button to the right of "Start Collab". This is a bug and should not happen, so please report it to the discord!',
        type: 'error',
        duration: 10_000,
      }),
    )
  },
})
