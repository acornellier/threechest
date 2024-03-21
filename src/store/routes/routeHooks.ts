import { RouteState } from './routesReducer.ts'
import { RootState } from '../store.ts'
import { DungeonKey } from '../../data/types.ts'
import { dungeonsByKey } from '../../data/dungeons.ts'
import { createSelector } from '@reduxjs/toolkit'
import { useRootSelector } from '../storeUtil.ts'

export const useRoutesSelector = <T>(selector: (state: RouteState) => T): T =>
  useRootSelector((state) => selector(state.routes.present))

const selectRoute = (state: RootState) => state.import.previewRoute ?? state.routes.present.route
export const useRoute = () => useRootSelector(selectRoute)

export const useSelectedPull = () => useRoutesSelector((state) => state.selectedPull)
export const useActualRoute = () => useRoutesSelector((state) => state.route)
export const usePreviewRoute = () => useRootSelector((state) => state.import.previewRoute)

const selectAllRoutes = (state: RouteState) => state.savedRoutes
const selectDungeonRoutes = createSelector(
  [selectAllRoutes, (_, dungeonKey: DungeonKey) => dungeonKey],
  (allRoutes, dungeonKey) => allRoutes.filter((route) => route.dungeonKey === dungeonKey),
)

export const useDungeonRoutes = (dungeonKey: DungeonKey) =>
  useRoutesSelector((state) => selectDungeonRoutes(state, dungeonKey))

const selectDungeonKey = createSelector([selectRoute], (route) => route.dungeonKey)

export function useDungeon() {
  const dungeonKey = useRootSelector(selectDungeonKey)
  return dungeonsByKey[dungeonKey]
}
