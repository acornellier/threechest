import { Mob, MobSpawnKey, Spawn } from '../../data/types.ts'
import { MdtRoute, Route } from '../../code/types.ts'
import { Reducer } from 'react'
import { dungeonsByKey } from '../../data/dungeons.ts'
import { mdtRouteToRoute, mobSpawnToKey } from '../../code/stuff.ts'
import { hsvToRgb, rgbToHex } from '../../code/util.ts'

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

export type RouterAction = ImportAction | AddPullAction | SelectPullAction | ToggleSpawnAction

// matches MDT colors
function GetPullColor(pullIndex: number) {
  const h = ((pullIndex - 1) * 360) / 12 + 120
  const [r, g, b] = hsvToRgb(h, 0.7554, 1)
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}

export const emptyRoute: Route = {
  dungeonKey: 'vp',
  name: 'TEST ROUTE',
  pulls: [{ color: GetPullColor(0), mobSpawns: [] }],
  selectedPull: 0,
}

const addPull = (route: Route): Route => {
  const newPullIndex = route.pulls.length
  return {
    ...route,
    pulls: [...route.pulls, { color: GetPullColor(newPullIndex), mobSpawns: [] }],
    selectedPull: newPullIndex,
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
    // if already selected, deselecte
    return {
      ...route,
      pulls: route.pulls.map((pull, pullIdx) =>
        pullIdx !== origSelectedPull
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
    case 'import':
      return mdtRouteToRoute(action.mdtRoute)
    case 'add_pull':
      return addPull(route)
    case 'select_pull':
      return { ...route, selectedPull: action.pullIndex }
    case 'toggle_spawn':
      return toggleSpawn(route, action)
  }
}
