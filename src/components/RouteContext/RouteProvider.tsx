import { Route } from '../../code/types.ts'
import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'
import { MobSpawn } from '../../data/types.ts'
import { dungeonsByKey } from '../../data/vp.ts'

type Props = {
  // route: Route
  // setRoute: (value: ((prevState: Route) => Route) | Route) => void
  children: ReactNode
}

export type RouteContextValue = {
  route: Route
  addPull: () => void
  toggleSpawn: (mobSpawn: MobSpawn) => void
}

const colors = ['green', 'red', 'blue', 'yellow', 'purple', 'orange']

const emptyRoute: Route = {
  dungeonKey: 'vp',
  name: 'TEST ROUTE',
  pulls: [{ color: '#3eff3e', enemies: [] }],
  selectedPull: 0,
}

export const RouteContext = createContext<RouteContextValue | null>(null)

export function RouteProvider({ children }: Props) {
  const [route, setRoute] = useState<Route>(emptyRoute)

  const data = dungeonsByKey['vp']

  const addPull = useCallback(() => {
    route.pulls.push({ color: colors[route.pulls.length % colors.length], enemies: [] })
    route.selectedPull = route.pulls.length - 1
    setRoute({ ...route })
  }, [route, setRoute])

  const findMatchingPull = useCallback(
    ({ mob, spawn }: MobSpawn) => {
      return route.pulls.find((pull) =>
        pull.enemies.some(
          (enemy) =>
            enemy.enemyIndex == mob.enemyIndex &&
            enemy.spawnIndexes.some((spawnIndex) => spawnIndex == spawn.spawnIndex),
        ),
      )
    },
    [route],
  )

  const toggleSpawn = useCallback(
    (mobSpawn: MobSpawn) => {
      const matchingPull = findMatchingPull(mobSpawn)

      if (matchingPull) {
        // TODO: stuff
      } else {
        data.mdtMobs
          .flatMap((mob) => mob.spawns.map((spawn) => ({ mob, spawn })))
          .filter(
            ({ spawn }) =>
              spawn === mobSpawn.spawn ||
              (spawn.group !== null && spawn.group === mobSpawn.spawn.group),
          )
          .forEach(({ mob, spawn }) => {
            route.pulls[route.selectedPull].enemies.push({
              enemyIndex: mob.enemyIndex,
              spawnIndexes: [spawn.spawnIndex],
            })
          })
      }

      setRoute({ ...route })
    },
    [findMatchingPull, route, data.mdtMobs],
  )

  const value = useMemo<RouteContextValue>(
    () => ({
      route,
      addPull,
      toggleSpawn,
    }),
    [route, addPull, toggleSpawn],
  )

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>
}
