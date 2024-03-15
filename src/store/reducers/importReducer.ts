import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MdtRoute, Route } from '../../util/types.ts'
import { importRouteApi } from '../../api/importRouteApi.ts'
import { RootState } from '../store.ts'
import { loadRouteFromStorage, setRouteFromMdt } from '../routes/routesReducer.ts'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'

export interface ImportState {
  importingRoute: MdtRoute | null
  previewRoute: Route | null
}

const initialState: ImportState = {
  importingRoute: null,
  previewRoute: null,
}

export const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    setImportingRoute(state, { payload }: PayloadAction<MdtRoute>) {
      state.importingRoute = payload
    },
    clearImportingRoute(state) {
      state.importingRoute = null
    },
    setPreviewRoute(state, { payload: route }: PayloadAction<Route | null>) {
      if (route?.uid !== state.previewRoute?.uid) {
        console.log('setPreviewRoute', route?.uid ?? null)
        state.previewRoute = route
      }
    },
  },
})

export const importRoute = createAsyncThunk(
  'import/decodeRoute',
  async ({ mdtString, mdtRoute }: { mdtString?: string; mdtRoute?: MdtRoute }, thunkAPI) => {
    if (!mdtString && !mdtRoute) throw new Error('Must specify either string or route to import')

    mdtRoute = mdtRoute ?? (await importRouteApi(mdtString!))
    const state = thunkAPI.getState() as RootState
    const savedRoute = state.routes.present.savedRoutes.find((route) => route.uid === mdtRoute.uid)
    if (savedRoute) {
      thunkAPI.dispatch(setImportingRoute(mdtRoute))
    } else {
      thunkAPI.dispatch(setRouteFromMdt({ mdtRoute }))
    }
  },
)

export const setPreviewRouteAsync = createAsyncThunk(
  'import/previewRoute',
  async (options: { routeId: string; mdtRoute?: MdtRoute } | null, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    const curRoute = state.routes.present.route
    const previewRouteId = state.import.previewRoute?.uid ?? null

    if (options?.routeId === curRoute.uid) {
      thunkAPI.dispatch(importSlice.actions.setPreviewRoute(null))
    } else if (previewRouteId !== options?.routeId) {
      const route =
        options === null
          ? null
          : options.mdtRoute
          ? mdtRouteToRoute(options.mdtRoute)
          : await loadRouteFromStorage(options.routeId)
      thunkAPI.dispatch(importSlice.actions.setPreviewRoute(route))
    }
  },
)

export const importReducer = importSlice.reducer
export const { setImportingRoute, clearImportingRoute } = importSlice.actions
