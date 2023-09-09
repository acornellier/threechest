import { Mob, MobSpawnKey, Spawn } from '../../data/types.ts'
import { Route } from '../../code/types.ts'
import { Reducer } from 'react'
import { dungeonsByKey } from '../../data/dungeons.ts'
import { mobSpawnToKey } from '../../code/stuff.ts'

type AddPullAction = {
  type: 'add_pull'
}

type SelectPullAction = {
  type: 'select_pull'
  pullIdx: number
}

type ToggleSpawnAction = {
  type: 'toggle_spawn'
  mob: Mob
  spawn: Spawn
}

export type RouterAction = AddPullAction | SelectPullAction | ToggleSpawnAction

const colors = ['green', 'red', 'blue', 'yellow', 'purple', 'orange']

export const emptyRoute: Route = {
  dungeonKey: 'vp',
  name: 'TEST ROUTE',
  pulls: [{ color: colors[0], mobSpawns: [] }],
  selectedPull: 0,
}

const addPull = (route: Route): Route => {
  const newPullCount = route.pulls.length + 1
  return {
    ...route,
    pulls: [...route.pulls, { color: colors[newPullCount % colors.length], mobSpawns: [] }],
    selectedPull: newPullCount - 1,
  }
}

const findSelectedPull = (route: Route, mobSpawnKey: MobSpawnKey) =>
  route.pulls.findIndex((pull) =>
    pull.mobSpawns.some((_mobSpawnKey) => _mobSpawnKey === mobSpawnKey),
  )

const toggleSpawn = (route: Route, action: ToggleSpawnAction): Route => {
  const data = dungeonsByKey[route.dungeonKey]

  const origMobSpawnKey = mobSpawnToKey(action)
  const origSelectedPull = findSelectedPull(route, origMobSpawnKey)

  const groupSpawns = data.mdt.enemies
    .flatMap((mob) =>
      mob.spawns.map((spawn) => ({ mob, spawn, mobSpawnKey: mobSpawnToKey({ mob, spawn }) })),
    )
    .filter(
      ({ mobSpawnKey, spawn }) =>
        mobSpawnKey === origMobSpawnKey ||
        (action.spawn.group !== null && spawn.group === action.spawn.group),
    )
    .map((mobSpawn) => {
      const selectedPull = findSelectedPull(route, mobSpawnToKey(mobSpawn))
      return { mobSpawnKey: mobSpawn.mobSpawnKey, selectedPull }
    })

  if (origSelectedPull !== -1) {
    // if already selected, deselected
    return {
      ...route,
      pulls: route.pulls.map((pull, pullIdx) =>
        pullIdx !== route.selectedPull
          ? pull
          : {
              ...pull,
              mobSpawns: pull.mobSpawns.filter(
                (mobSpawnKey) =>
                  !groupSpawns.some((groupSpawn) => groupSpawn.mobSpawnKey === mobSpawnKey),
              ),
            },
      ),
    }
  } else {
    // otherwise, select
    return {
      ...route,
      pulls: route.pulls.map((pull, pullIdx) =>
        pullIdx !== route.selectedPull
          ? pull
          : {
              ...pull,
              mobSpawns: [
                ...pull.mobSpawns,
                ...groupSpawns
                  .filter(({ selectedPull }) => selectedPull === -1)
                  .map(({ mobSpawnKey }) => mobSpawnKey),
              ],
            },
      ),
    }
  }
}

export const routeReducer: Reducer<Route, RouterAction> = (route, action) => {
  switch (action.type) {
    case 'add_pull':
      return addPull(route)
    case 'select_pull':
      return { ...route, selectedPull: action.pullIdx }
    case 'toggle_spawn':
      return toggleSpawn(route, action)
  }
}
