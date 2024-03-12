import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store.ts'
import { addToast } from './toastReducer.ts'
import { importRoute } from './importReducer.ts'
import { REHYDRATE } from 'redux-persist/es/constants'
import { ActionCreators } from 'redux-undo'
import {
  deleteRoute,
  duplicateRoute,
  loadRoute,
  newRoute,
  setDungeon,
  setRouteFromMdt,
} from './routesReducer.ts'

export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  actionCreator: setRouteFromMdt,
  effect: async ({ payload: { mdtRoute, copy } }, listenerApi) => {
    if (copy) {
      const state = listenerApi.getState() as RootState
      addToast(
        listenerApi.dispatch as AppDispatch,
        `Imported route ${mdtRoute.text} as ${state.routes.present.route.name}`,
      )
    } else {
      addToast(listenerApi.dispatch as AppDispatch, `Route imported: ${mdtRoute.text}`)
    }
  },
})

listenerMiddleware.startListening({
  matcher: isAnyOf(setDungeon.rejected, loadRoute.rejected, deleteRoute.rejected),
  effect: async ({ error, type }, listenerApi) => {
    console.error((error as Error).stack)
    addToast(
      listenerApi.dispatch as AppDispatch,
      `Error during action ${type}: ${(error as Error).message}`,
      'error',
    )
  },
})

listenerMiddleware.startListening({
  matcher: isAnyOf(importRoute.rejected),
  effect: async ({ error }, listenerApi) => {
    console.error((error as Error).stack)
    addToast(
      listenerApi.dispatch as AppDispatch,
      `Failed to import route: ${(error as Error).message}`,
      'error',
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
    loadRoute.fulfilled,
    deleteRoute.fulfilled,
    duplicateRoute,
    setRouteFromMdt,
    newRoute,
  ),
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(ActionCreators.clearHistory())
  },
})
