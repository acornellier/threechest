import { AppDispatch, RootState } from './store.ts'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { dungeonsByKey } from '../data/dungeons.ts'
import { RouteState } from './routesReducer.ts'
import { DungeonKey } from '../data/types.ts'
import { createSelector } from '@reduxjs/toolkit'
import { HoverState } from './hoverReducer.ts'

export const useAppDispatch: () => AppDispatch = useDispatch

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector

export const useRoutesSelector = <T>(selector: (state: RouteState) => T): T =>
  useRootSelector((state) => selector(state.routes.present))

export const useHoverSelector = <T>(selector: (state: HoverState) => T): T =>
  useRootSelector((state) => selector(state.hover))

// Routes
export const useRoute = () => useRoutesSelector((state) => state.route)
export const useSavedRoutes = () => useRoutesSelector((state) => state.savedRoutes)

const selectAllRoutes = (state: RouteState) => state.savedRoutes
const selectDungeonRoutes = createSelector(
  [selectAllRoutes, (_, dungeonKey: DungeonKey) => dungeonKey],
  (allRoutes, dungeonKey) => allRoutes.filter((route) => route.dungeonKey === dungeonKey),
)
export const useDungeonRoutes = (dungeonKey: DungeonKey) =>
  useRoutesSelector((state) => selectDungeonRoutes(state, dungeonKey))

export function useDungeon() {
  const dungeonKey = useRoutesSelector((state) => state.route.dungeonKey)
  return dungeonsByKey[dungeonKey]
}

// Hover
export const useSelectedPull = () => useRoutesSelector((state) => state.route.selectedPull)

export const useHoveredPull = () => useHoverSelector((state) => state.hoveredPull)
