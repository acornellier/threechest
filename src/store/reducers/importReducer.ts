import type { MdtRoute, Route } from '../../util/types.ts'
import { importRouteApi } from '../../api/importRouteApi.ts'
import type { AppDispatch, RootState } from '../store.ts'
import { loadRouteFromStorage, setRouteFromMdt } from '../routes/routesReducer.ts'
import { createAppSlice } from '../storeUtil.ts'

export interface ImportState {
  importingRoute: MdtRoute | null
  previewRoute: Route | null
}

const initialState: ImportState = {
  importingRoute: null,
  previewRoute: null,
}

export const importSlice = createAppSlice({
  name: 'import',
  initialState,
  reducers: (create) => ({
    setImportingRoute: create.reducer<MdtRoute>((state, { payload }) => {
      state.importingRoute = payload
    }),
    clearImportingRoute: create.reducer((state) => {
      state.importingRoute = null
    }),
    setPreviewRoute: create.reducer<Route | null>((state, { payload: route }) => {
      if (route?.uid !== state.previewRoute?.uid) {
        state.previewRoute = route
      }
    }),
    importRoute: create.asyncThunk(
      async ({ mdtString, mdtRoute }: { mdtString?: string; mdtRoute?: MdtRoute }, thunkApi) => {
        if (!mdtString && !mdtRoute)
          throw new Error('Must specify either string or route to import')

        mdtRoute = mdtRoute ?? (await importRouteApi(mdtString!))
        const state = thunkApi.getState() as RootState
        const savedRoute = state.routes.present.savedRoutes.find(
          (route) => route.uid === mdtRoute.uid,
        )
        if (savedRoute) {
          thunkApi.dispatch(setImportingRoute(mdtRoute))
        } else {
          thunkApi.dispatch(setRouteFromMdt({ mdtRoute }))
        }
      },
    ),
    setPreviewRouteAsync: create.asyncThunk(
      async (options: { routeId: string; route?: Route } | null, thunkApi) => {
        const state = thunkApi.getState() as RootState
        const dispatch = thunkApi.dispatch as AppDispatch

        const curRouteId = state.routes.present.route.uid
        const previewRouteId = state.import.previewRoute?.uid ?? null
        let newPreviewRouteId = options?.routeId ?? null
        if (newPreviewRouteId === curRouteId) newPreviewRouteId = null

        // Cur: X, Preview: null, New: null   -> nothing
        // Cur: X, Preview: X,    New: null   -> set(null)
        // Cur: X, Preview: Y,    New: null   -> set(null)
        // Cur: X, Preview: null, New: X/null -> nothing
        // Cur: X, Preview: null, New: Y      -> set(Y)
        // Cur: X, Preview: X,    New: X/null -> nothing
        // Cur: X, Preview: X,    New: Y      -> set(Y)
        // Cur: X, Preview: Y,    New: X/null -> set(null)
        // Cur: X, Preview: Y,    New: Y      -> nothing

        if (newPreviewRouteId === null && previewRouteId === null) {
          // No change
        } else if (newPreviewRouteId === null) {
          // New route matches current route
          // Clear preview if new input matches cur but not the preview
          dispatch(importSlice.actions.setPreviewRoute(null))
        } else if (newPreviewRouteId !== previewRouteId) {
          // New route differs from current and preview routes and isn't null
          const route = options?.route ?? (await loadRouteFromStorage(newPreviewRouteId, dispatch))
          dispatch(importSlice.actions.setPreviewRoute(route))
        }
      },
    ),
  }),
})

export const importReducer = importSlice.reducer
export const { setImportingRoute, clearImportingRoute, importRoute, setPreviewRouteAsync } =
  importSlice.actions
