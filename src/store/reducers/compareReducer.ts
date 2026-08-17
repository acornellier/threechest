import type { Route } from '../../util/types.ts'
import type { AppDispatch, RootState } from '../store.ts'
import { createAppSlice } from '../storeUtil.ts'
import { loadRoute, loadRouteFromStorage } from '../routes/routesReducer.ts'

export type CompareMode = 'overlay' | 'diff'

export interface CompareState {
  route: Route | null
  previewRoute: Route | null
  /** The preview last asked for. Recorded synchronously, so a stale load can tell it lost. */
  previewRouteId: string | null
  mode: CompareMode
  peeking: boolean
}

const initialState: CompareState = {
  route: null,
  previewRoute: null,
  previewRouteId: null,
  mode: 'overlay',
  peeking: false,
}

export type CompareRouteOptions = { routeId: string; route?: Route } | null

export const compareSlice = createAppSlice({
  name: 'compare',
  initialState,
  reducers: (create) => ({
    setCompareRoute: create.reducer<Route | null>((state, { payload: route }) => {
      state.route = route
      state.previewRoute = null
      state.previewRouteId = null
      state.peeking = false
    }),
    requestComparePreview: create.reducer<string | null>((state, { payload: routeId }) => {
      state.previewRouteId = routeId
      if (routeId !== state.previewRoute?.uid) state.previewRoute = null
    }),
    comparePreviewLoaded: create.reducer<Route>((state, { payload: route }) => {
      if (route.uid === state.previewRouteId) state.previewRoute = route
    }),
    setCompareMode: create.reducer<CompareMode>((state, { payload: mode }) => {
      state.mode = mode
    }),
    setComparePeeking: create.reducer<boolean>((state, { payload: peeking }) => {
      state.peeking = peeking
    }),
    exitCompare: create.reducer((state) => {
      state.route = null
      state.previewRoute = null
      state.previewRouteId = null
      state.peeking = false
    }),
    setCompareRouteAsync: create.asyncThunk(async (options: CompareRouteOptions, thunkApi) => {
      const state = thunkApi.getState() as RootState
      const dispatch = thunkApi.dispatch as AppDispatch

      const routeId = options?.routeId ?? null
      if (routeId === null || routeId === state.routes.present.route.uid) {
        dispatch(compareSlice.actions.setCompareRoute(null))
        return
      }

      const route = options?.route ?? (await loadRouteFromStorage(routeId, dispatch))
      dispatch(compareSlice.actions.setCompareRoute(route))
    }),
    previewCompareRouteAsync: create.asyncThunk(async (options: CompareRouteOptions, thunkApi) => {
      const state = thunkApi.getState() as RootState
      const dispatch = thunkApi.dispatch as AppDispatch

      const routeId = options?.routeId ?? null
      const targetId = routeId === state.routes.present.route.uid ? null : routeId

      // Claims the compare slot even when nothing needs loading, so that the hovered option
      // doesn't also preview as the base route. Dispatched before the await, so same-tick hovers
      // resolve by order and the last one wins.
      dispatch(compareSlice.actions.requestComparePreview(targetId))

      // Already the committed comparison, so selectCompareRoute already resolves to it.
      if (targetId === null || targetId === state.compare.route?.uid) return

      const route = options?.route ?? (await loadRouteFromStorage(targetId, dispatch))
      dispatch(compareSlice.actions.comparePreviewLoaded(route))
    }),
    swapCompareRoute: create.asyncThunk(async (_: void, thunkApi) => {
      const state = thunkApi.getState() as RootState
      const dispatch = thunkApi.dispatch as AppDispatch

      const compareRoute = state.compare.route
      if (!compareRoute) return

      const isSaved = state.routes.present.savedRoutes.some(
        (saved) => saved.uid === compareRoute.uid,
      )
      if (!isSaved) return

      const previousRoute = state.routes.present.route
      await dispatch(loadRoute(compareRoute.uid))
      dispatch(compareSlice.actions.setCompareRoute(previousRoute))
    }),
  }),
})

export const compareReducer = compareSlice.reducer

export const {
  setCompareMode,
  setComparePeeking,
  exitCompare,
  setCompareRouteAsync,
  previewCompareRouteAsync,
  swapCompareRoute,
} = compareSlice.actions
