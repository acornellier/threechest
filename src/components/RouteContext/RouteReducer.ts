import { Mob, MobSpawn, Spawn } from '../../data/types.ts'
import { MdtRoute, Pull, Route } from '../../code/types.ts'
import { Reducer } from 'react'
import { mobSpawnsEqual } from '../../code/util.ts'
import { getPullColor } from '../../code/colors.ts'
import { mdtRouteToRoute } from '../../code/mdtUtil.ts'
import { dungeonsByKey } from '../../data/dungeons.ts'

type SetRoute = {
  type: 'set_route'
  route: Route
}

type ImportAction = {
  type: 'import'
  mdtRoute: MdtRoute
}

type AddPullAction = {
  type: 'add_pull'
}

type SelectPullAction = {
  type: 'select_pull'
  pullIndex: number
}

type ToggleSpawnAction = {
  type: 'toggle_spawn'
  mob: Mob
  spawn: Spawn
}

type SetPullsAction = {
  type: 'set_pulls'
  pulls: Pull[]
}

export type RouterAction =
  | SetRoute
  | ImportAction
  | AddPullAction
  | SelectPullAction
  | ToggleSpawnAction
  | SetPullsAction

const addPull = (route: Route): Route => {
  const newPullIndex = route.pulls.length
  const maxIdx = route.pulls.reduce<number>((acc, pull) => (pull.id > acc ? pull.id : acc), 0)
  const id = maxIdx + 1
  return {
    ...route,
    pulls: [
      ...route.pulls,
      {
        id,
        color: getPullColor(newPullIndex),
        mobSpawns: [],
      },
    ],
    selectedPull: newPullIndex,
  }
}

const findSelectedPull = (route: Route, mobSpawn: MobSpawn) =>
  route.pulls.findIndex((pull) =>
    pull.mobSpawns.some((mobSpawn2) => mobSpawnsEqual(mobSpawn, mobSpawn2)),
  )

const toggleSpawn = (route: Route, action: ToggleSpawnAction): Route => {
  const data = dungeonsByKey[route.dungeonKey]

  const origSelectedPull = findSelectedPull(route, action)

  const groupSpawns = data.mdt.enemies
    .flatMap((mob) => mob.spawns.map((spawn) => ({ mob, spawn })))
    .filter(
      (mobSpawn) =>
        mobSpawnsEqual(mobSpawn, action) ||
        (action.spawn.group !== null && mobSpawn.spawn.group === action.spawn.group),
    )
    .map((mobSpawn) => {
      const selectedPull = findSelectedPull(route, mobSpawn)
      return { mobSpawn, selectedPull }
    })

  if (origSelectedPull !== -1) {
    // if already selected, deselect
    return {
      ...route,
      pulls: route.pulls.map((pull, pullIdx) =>
        pullIdx !== origSelectedPull
          ? pull
          : {
              ...pull,
              mobSpawns: pull.mobSpawns.filter(
                (mobSpawn2) =>
                  !groupSpawns.some(({ mobSpawn }) => mobSpawnsEqual(mobSpawn, mobSpawn2)),
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
                  .map(({ mobSpawn }) => mobSpawn),
              ],
            },
      ),
    }
  }
}

function setPulls(route: Route, action: SetPullsAction) {
  return {
    ...route,
    pulls: action.pulls.map((pull, newPullIndex) => ({
      ...pull,
      color: getPullColor(newPullIndex),
    })),
  }
}

export const routeReducer: Reducer<Route, RouterAction> = (route, action) => {
  switch (action.type) {
    case 'set_route':
      return action.route
    case 'import':
      return mdtRouteToRoute(action.mdtRoute)
    case 'add_pull':
      return addPull(route)
    case 'select_pull':
      return { ...route, selectedPull: action.pullIndex }
    case 'toggle_spawn':
      return toggleSpawn(route, action)
    case 'set_pulls':
      return setPulls(route, action)
  }
}
