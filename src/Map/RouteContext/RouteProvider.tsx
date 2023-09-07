import { Route } from '../types.ts'
import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'
import { Mob, Spawn } from '../../data/types.ts'

type Props = {
  // route: Route
  // setRoute: (value: ((prevState: Route) => Route) | Route) => void
  children: ReactNode
}

export type RouteContextValue = {
  route: Route
  addToRoute: (mob: Mob, spawn: Spawn) => void
}

const emptyRoute: Route = {
  dungeonKey: 'vp',
  name: 'TEST ROUTE',
  pulls: [{ color: '#3eff3e', enemies: [] }],
  selectedPull: 0,
}

export const RouteContext = createContext<RouteContextValue | null>(null)

export function RouteProvider({ children }: Props) {
  const [route, setRoute] = useState<Route>(emptyRoute)

  const addToRoute = useCallback(
    (mob: Mob, spawn: Spawn) => {
      route.pulls[route.selectedPull].enemies.push({
        enemyIndex: mob.enemyIndex,
        spawnIndexes: [spawn.spawnIndex],
      })
      setRoute({ ...route })
    },
    [route, setRoute],
  )

  const value = useMemo<RouteContextValue>(
    () => ({
      addToRoute,
      route,
    }),
    [addToRoute, route],
  )

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}
