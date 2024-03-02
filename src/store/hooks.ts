import { AppDispatch, RootState } from './store.ts'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { dungeonsByKey } from '../data/dungeons.ts'
import { augmentRoute } from './augmentRoute.ts'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useRoute = () => useAppSelector((state) => state.route)

export function useRouteDetailed() {
  const route = useRoute()
  return augmentRoute(route)
}

export function useDungeon() {
  const dungeonKey = useAppSelector((state) => state.route.dungeonKey)
  return dungeonsByKey[dungeonKey]
}

export const useSelectedPull = () => useAppSelector((state) => state.route.selectedPull)

export const useHoveredPull = () => useAppSelector((state) => state.hoveredPull)
