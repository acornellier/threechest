import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MdtRoute } from '../util/types.ts'
import { importRouteApi } from '../api/importRouteApi.ts'
import { RootState } from './store.ts'
import { setRouteFromMdt } from './routesReducer.ts'

export interface ImportState {
  importingRoute: MdtRoute | null
}

const initialState: ImportState = {
  importingRoute: null,
}

export const importRoute = createAsyncThunk(
  'routes/decodeRoute',
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
  },
})

export const importReducer = importSlice.reducer
export const { setImportingRoute, clearImportingRoute } = importSlice.actions
