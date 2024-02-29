import { Route, RouteDetailed } from '../../code/types.ts'
import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react'
import { RouterAction, routeReducer } from './RouteReducer.ts'
import { augmentRoute } from './augmentRoute.ts'
import { dungeonsByKey } from '../../data/dungeonsByKey.ts'
import { Dungeon, DungeonKey } from '../../data/types.ts'
import { sampleRoutes } from '../../data/sampleRoutes.ts'
import { getPullColor } from '../../code/colors.ts'

type Props = {
  children: ReactNode
}

export type RouteContextValue = {
  route: Route
  routeDetailed: RouteDetailed
  dungeon: Dungeon
  dispatch: Dispatch<RouterAction>
}

export const RouteContext = createContext<RouteContextValue | null>(null)

const defaultDungeonKey: DungeonKey = 'dotiu'

export const emptyRoute: Route = {
  dungeonKey: defaultDungeonKey,
  name: 'TEST ROUTE',
  pulls: [{ id: 0, color: getPullColor(0), mobSpawns: [] }],
  selectedPull: 0,
}

export function RouteProvider({ children }: Props) {
  const [route, dispatch] = useReducer(routeReducer, sampleRoutes[defaultDungeonKey])
  const routeDetailed = useMemo(() => augmentRoute(route), [route])

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      routeDetailed,
      dungeon: dungeonsByKey[route.dungeonKey],
      dispatch,
    }),
    [route, routeDetailed],
  )

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}
