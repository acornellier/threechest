import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { RootState } from './store.ts'
import { addToast } from './reducers/toastReducer.ts'
import { importRoute } from './reducers/importReducer.ts'
import { REHYDRATE } from 'redux-persist/es/constants'
import { ActionCreators } from 'redux-undo'
import {
  deleteRoute,
  duplicateRoute,
  loadRoute,
  newRoute,
  setDungeon,
  setRoute,
  setRouteFromMdt,
  updateSavedRoutes,
} from './routes/routesReducer.ts'

export const listenerMiddleware = createListenerMiddleware()

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

listenerMiddleware.startListening({
  matcher: isAnyOf(setDungeon.rejected, loadRoute.rejected, deleteRoute.rejected),
  effect: async ({ error, type }, listenerApi) => {
    console.error((error as Error).stack)
    listenerApi.dispatch(
      addToast({
        message: `Error during action ${type}: ${(error as Error).message}`,
        type: 'error',
      }),
    )
  },
})

listenerMiddleware.startListening({
  matcher: isAnyOf(importRoute.rejected),
  effect: async ({ error }, listenerApi) => {
    console.error((error as Error).stack)
    listenerApi.dispatch(
      addToast({ message: `Failed to import route: ${(error as Error).message}`, type: 'error' }),
    )
  },
})

listenerMiddleware.startListening({
  type: REHYDRATE,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})

listenerMiddleware.startListening({
  matcher: isAnyOf(
    setDungeon.fulfilled,
    loadRoute.fulfilled,
    duplicateRoute,
    setRoute,
    setRouteFromMdt,
    newRoute,
  ),
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(updateSavedRoutes())
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})
