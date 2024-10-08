import type { MdtRoute, Route } from '../../util/types.ts'
import { importRouteApi } from '../../api/importRouteApi.ts'
import type { AppDispatch, RootState } from '../store.ts'
import { loadRouteFromStorage, setRouteFromMdt, setRouteFromWcl } from '../routes/routesReducer.ts'
import { createAppSlice } from '../storeUtil.ts'
import { urlToWclInfo, wclResultToRoute } from '../../util/wclCalc.ts'
import { addToast } from './toastReducer.ts'
import { wclRouteApi } from '../../api/wclRouteApi.ts'
import { isAnyOf } from '@reduxjs/toolkit'
import localForage from 'localforage'
import { isDev } from '../../util/isDev.ts'
import { getFirestoreRouteApi } from '../../api/getFirestoreRouteApi.ts'

export interface ImportState {
  isImporting: boolean
  importingRoute: MdtRoute | null
  previewRoute: Route | null
}

interface WclRateStatus {
  usesSinceReset: number
  resetsAtEpochSec: number
}

const initialState: ImportState = {
  isImporting: false,
  importingRoute: null,
  previewRoute: null,
}

const wclErrorMessage =
  'WCL route imported with errors. Some enemies were unable to be matched with MDT data. There will be enemies missing in the pulls.'

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
    importMdtRoute: create.asyncThunk(
      async ({ text, mdtRoute }: { text?: string; mdtRoute?: MdtRoute }, thunkApi) => {
        if (!text && !mdtRoute) throw new Error('Must specify either string or route to import')

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
    importFirestoreRoute: create.asyncThunk(async ({ routeId }: { routeId: string }, thunkApi) => {
      const firestoreRoute = await getFirestoreRouteApi(routeId)
      thunkApi.dispatch(importMdtRoute({ text: firestoreRoute.mdtString }))
    }),
    importWclRoute: create.asyncThunk(async ({ url }: { url: string }, thunkApi) => {
      const wclRateStatus: WclRateStatus = (await localForage.getItem<WclRateStatus>(
        'wclRateStatus',
      )) ?? { usesSinceReset: 0, resetsAtEpochSec: 0 }

      if (Date.now() / 1000 > wclRateStatus.resetsAtEpochSec) {
        wclRateStatus.usesSinceReset = 0
        wclRateStatus.resetsAtEpochSec = Date.now() / 1000 + 3600
      }

      const maxUsesPerHour = 5
      if (wclRateStatus.usesSinceReset >= maxUsesPerHour && !isDev) {
        const comeBackAt = new Date(wclRateStatus.resetsAtEpochSec * 1000).toLocaleTimeString()
        thunkApi.dispatch(
          addToast({
            message: `WCL rate limit reached. Please try again at ${comeBackAt}`,
            type: 'error',
          }),
        )
      } else {
        const { result, cached } = await wclRouteApi(urlToWclInfo(url))
        if (!result || !result.events) throw new Error('Failed to parse WCL report.')

        const { route, errors } = wclResultToRoute(result)
        thunkApi.dispatch(setRouteFromWcl(route))

        if (!cached) wclRateStatus.usesSinceReset++

        if (errors.length) {
          console.error(errors.join('\n'))
          thunkApi.dispatch(addToast({ message: wclErrorMessage, type: 'error', duration: 10_000 }))
        } else {
          thunkApi.dispatch(
            addToast({
              message: `WCL route imported as ${route.name}. WCL conversions remaining this hour: ${maxUsesPerHour - wclRateStatus.usesSinceReset}/${maxUsesPerHour}`,
            }),
          )
        }
      }

      await localForage.setItem('wclRateStatus', wclRateStatus)
      return
    }),
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
  extraReducers: (builder) => {
    builder.addMatcher(isAnyOf(importWclRoute.pending, importMdtRoute.pending), (state) => {
      state.isImporting = true
    })

    builder.addMatcher(isAnyOf(importWclRoute.settled, importMdtRoute.settled), (state) => {
      state.isImporting = false
    })
  },
})

export const importReducer = importSlice.reducer
export const {
  setImportingRoute,
  clearImportingRoute,
  importMdtRoute,
  importFirestoreRoute,
  importWclRoute,
  setPreviewRouteAsync,
} = importSlice.actions
