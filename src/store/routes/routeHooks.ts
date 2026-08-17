import type { RouteState } from './routesReducer.ts'
import type { RootState } from '../store.ts'
import { dungeonsByKey } from '../../data/dungeons.ts'
import { createSelector } from '@reduxjs/toolkit'
import { useRootSelector } from '../storeUtil.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'
import { compareRoutes } from '../../util/compareRoutes.ts'

export const useRoutesSelector = <T>(selector: (state: RouteState) => T): T =>
  useRootSelector((state) => selector(state.routes.present))

/**
 * The route being compared against, or null when not comparing. Guards against a persisted
 * comparison outliving the route it was set up for.
 */
export const selectCompareRoute = (state: RootState) => {
  const compareRoute = state.compare.previewRoute ?? state.compare.route
  if (!compareRoute) return null

  const route = state.routes.present.route
  if (compareRoute.uid === route.uid || compareRoute.dungeonKey !== route.dungeonKey) return null

  return compareRoute
}

export const useCompareRoute = () => useRootSelector(selectCompareRoute)
export const useActualCompareRoute = () => useRootSelector((state) => state.compare.route)
export const useCompareMode = () => useRootSelector((state) => state.compare.mode)

export const selectIsPeeking = (state: RootState) =>
  state.compare.peeking && selectCompareRoute(state) !== null

export const useIsPeeking = () => useRootSelector(selectIsPeeking)

export const selectRoute = (state: RootState) => {
  if (state.compare.peeking) {
    const compareRoute = selectCompareRoute(state)
    if (compareRoute) return compareRoute
  }

  const route = state.routes.present.route
  const previewRoute = state.import.previewRoute
  if (!previewRoute) return route

  // A hovered option feeds both preview slots, and the compare slot wins: previewing the route
  // being compared against would collapse the two onto each other and cancel the comparison.
  const compareTargetId = state.compare.previewRouteId ?? state.compare.route?.uid ?? null
  if (previewRoute.uid === compareTargetId) return route

  return previewRoute
}

export const useRoute = () => useRootSelector(selectRoute)

const selectRouteComparison = createSelector(
  [selectRoute, selectCompareRoute, selectIsPeeking],
  (route, compareRoute, isPeeking) =>
    compareRoute && !isPeeking ? compareRoutes(route.pulls, compareRoute.pulls) : null,
)

export const useRouteComparison = () => useRootSelector(selectRouteComparison)

export const useSelectedPull = () => useRoutesSelector((state) => state.selectedPull)

export const selectActualRoute = (state: RootState) => state.routes.present.route
export const useActualRoute = () => useRootSelector(selectActualRoute)
export const usePreviewRoute = () => useRootSelector((state) => state.import.previewRoute)

const selectSavedRoutes = (state: RouteState) => state.savedRoutes
export const useSavedRoutes = () => useRoutesSelector(selectSavedRoutes)

const selectDungeonRoutes = createSelector(
  [selectSavedRoutes, (_, dungeonKey: DungeonKey) => dungeonKey],
  (allRoutes, dungeonKey) => allRoutes.filter((route) => route.dungeonKey === dungeonKey),
)

export const useDungeonRoutes = (dungeonKey: DungeonKey) =>
  useRoutesSelector((state) => selectDungeonRoutes(state, dungeonKey))

const selectDungeonKey = createSelector([selectRoute], (route) => route.dungeonKey)

export function useDungeon() {
  const dungeonKey = useRootSelector(selectDungeonKey)
  return dungeonsByKey[dungeonKey]
}
