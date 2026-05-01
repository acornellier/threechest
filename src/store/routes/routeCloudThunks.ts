import { createAsyncThunk } from '@reduxjs/toolkit'
import * as localforage from 'localforage'
import type { RootState } from '../store.ts'
import type { Route } from '../../util/types.ts'
import { getSavedRouteKey, saveRoute } from './routeStorage.ts'
import { saveRouteToCloud } from '../../api/saveUserRouteApi.ts'
import { getUserManifest, getRouteFromCloud } from '../../api/getUserRoutesApi.ts'
import { setSyncState } from '../reducers/cloudReducer.ts'

export const pushChangedRoutes = createAsyncThunk(
  'routes/pushAllRoutes',
  async (uid: string, thunkAPI) => {
    thunkAPI.dispatch(setSyncState('syncing'))
    const state = thunkAPI.getState() as RootState
    const savedRoutes = state.routes.present.savedRoutes

    const pushed = await Promise.all(
      savedRoutes.map(async (savedRoute) => {
        const route = await localforage.getItem<Route>(getSavedRouteKey(savedRoute.uid))
        if (!route) return null
        const syncedAt = await saveRouteToCloud(uid, route)
        return { routeId: savedRoute.uid, syncedAt }
      }),
    )

    thunkAPI.dispatch(setSyncState('idle'))
    return pushed.filter(
      (r): r is { routeId: string; syncedAt: string } => r !== null && r.syncedAt !== null,
    )
  },
)

export const pullChangedRoutes = createAsyncThunk(
  'routes/pullChanges',
  async (uid: string, thunkAPI) => {
    thunkAPI.dispatch(setSyncState('syncing'))

    const state = thunkAPI.getState() as RootState
    const savedRoutes = state.routes.present.savedRoutes
    const savedRouteMap = new Map(savedRoutes.map((route) => [route.uid, route]))

    const manifest = await getUserManifest(uid)

    const toFetch = Object.entries(manifest.routes).filter(([routeId, updatedAt]) => {
      const local = savedRouteMap.get(routeId)
      if (!local) return true
      if (!local.cloudSyncedAt) return true
      return updatedAt > local.cloudSyncedAt
    })

    const pulled = await Promise.all(
      toFetch.map(async ([routeId, syncedAt]) => {
        const route = await getRouteFromCloud(uid, routeId)
        return route ? { route, syncedAt } : null
      }),
    )

    const results = pulled.filter((r): r is { route: Route; syncedAt: string } => r !== null)

    console.log(`${results.length} routes pulled`, results)

    await Promise.all(results.map(({ route }) => saveRoute(route)))

    thunkAPI.dispatch(setSyncState('idle'))

    return results
  },
)
