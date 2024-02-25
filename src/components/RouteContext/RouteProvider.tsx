import { Route, RouteDetailed } from '../../code/types.ts'
import { createContext, Dispatch, ReactNode, useMemo, useReducer } from 'react'
import { RouterAction, routeReducer } from './RouteReducer.ts'
import { augmentRoute } from './augmentRoute.ts'
import { dungeonsByKey, sampleVpRoute } from '../../data/dungeons.ts'
import { Dungeon } from '../../data/types.ts'

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

export function RouteProvider({ children }: Props) {
  const [route, dispatch] = useReducer(routeReducer, sampleVpRoute)
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
