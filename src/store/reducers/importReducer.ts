import { MdtRoute, Route } from '../../util/types.ts'
import { importRouteApi } from '../../api/importRouteApi.ts'
import { AppDispatch, RootState } from '../store.ts'
import {
  loadRouteFromStorage,
  nextRouteName,
  setRouteFromMdt,
  setRouteFromWcl,
} from '../routes/routesReducer.ts'
import { createAppSlice } from '../storeUtil.ts'
import { urlToWclInfo, wclRouteToRoute } from '../../util/wclUtil.ts'
import { addToast } from './toastReducer.ts'
import { wclRouteApi } from '../../api/wclRouteApi.ts'

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
      async ({ text, mdtRoute }: { text?: string; mdtRoute?: MdtRoute }, thunkApi) => {
        if (!text && !mdtRoute) throw new Error('Must specify either string or route to import')

        if (text?.includes('warcraftlogs.com')) {
          const { code, fightId } = urlToWclInfo(text)
          const wclResult = await wclRouteApi(code, fightId)
          if (!wclResult || !wclResult.events) throw new Error('Failed to parse WCL report.')

          const { route, errors } = wclRouteToRoute(wclResult)
          const savedRoutes = (thunkApi.getState() as RootState).routes.present.savedRoutes
          route.name = nextRouteName(route.name, route.dungeonKey, savedRoutes)
          thunkApi.dispatch(setRouteFromWcl(route))

          if (errors.length) {
            console.error(errors.join('\n'))
            thunkApi.dispatch(
              addToast({
                message:
                  'WCL route imported with errors. Some enemies were unable to be matched with MDT data. There will be enemies missing in the pulls.',
                type: 'error',
                duration: 10_000,
              }),
            )
          } else {
            thunkApi.dispatch(addToast({ message: `WCL route imported as ${route.name}` }))
          }

          return
        }

        mdtRoute = mdtRoute ?? (await importRouteApi(text!))
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
