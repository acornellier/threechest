import { Route, RouteDetailed } from '../../code/types.ts'
import {
  createContext,
  Dispatch,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { RouterAction, routeReducer } from './RouteReducer.ts'
import { augmentRoute } from './augmentRoute.ts'
import { Dungeon, DungeonKey } from '../../data/types.ts'
import { sampleRoutes } from '../../data/sampleRoutes.ts'
import { getPullColor } from '../../code/colors.ts'
import { dungeonsByKey } from '../../data/dungeons.ts'
import { useLocalStorage } from '../../hooks/useLocalStorage.ts'

type Props = {
  children: ReactNode
}

export type RouteContextValue = {
  route: Route
  routeDetailed: RouteDetailed
  hoveredPull: number
  setHoveredPull: (hoveredPull: number) => void
  dungeon: Dungeon
  setDungeon: (dungeonKey: DungeonKey) => void
  dispatch: Dispatch<RouterAction>
}

export const RouteContext = createContext<RouteContextValue | null>(null)

const defaultDungeonKey: DungeonKey = 'eb'

export const emptyRoute: Route = {
  dungeonKey: defaultDungeonKey,
  name: 'TEST ROUTE',
  uid: '0',
  pulls: [{ id: 0, color: getPullColor(0), mobSpawns: [] }],
  selectedPull: 0,
}

export function RouteProvider({ children }: Props) {
  const [savedRoute, setSavedRoute] = useLocalStorage('savedRoute', sampleRoutes[defaultDungeonKey])

  const [route, dispatch] = useReducer(routeReducer, savedRoute)
  const [hoveredPull, setHoveredPull] = useState(0)

  useEffect(() => {
    setSavedRoute(route)
  }, [route, setSavedRoute])

  const setDungeon = useCallback((dungeonKey: DungeonKey) => {
    dispatch({ type: 'set_route', route: sampleRoutes[dungeonKey] })
  }, [])

  const routeDetailed = useMemo(() => augmentRoute(route), [route])

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      routeDetailed,
      hoveredPull,
      setHoveredPull,
      dungeon: dungeonsByKey[route.dungeonKey],
      setDungeon,
      dispatch,
    }),
    [route, routeDetailed, setDungeon, hoveredPull, setHoveredPull],
  )

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}
