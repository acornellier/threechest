import { Pull, Route } from '../util/types.ts'
import { MobSpawn } from '../data/types.ts'
import { dungeonsByKey } from '../data/dungeons.ts'
import { mobSpawnsEqual } from '../util/mobSpawns.ts'
import { RouteState } from './routesReducer.ts'

const findSelectedPull = (route: Route, mobSpawn: MobSpawn) =>
  route.pulls.findIndex((pull) =>
    pull.mobSpawns.some((mobSpawn2) => mobSpawnsEqual(mobSpawn, mobSpawn2)),
  )

export function toggleSpawnAction(
  route: Route,
  payload: { mobSpawn: MobSpawn; individual: boolean },
): Pull[] {
  const data = dungeonsByKey[route.dungeonKey]

  const origSelectedPull = findSelectedPull(route, payload.mobSpawn)

  const groupSpawns = payload.individual
    ? [{ mobSpawn: payload.mobSpawn, selectedPull: origSelectedPull }]
    : data.mdt.enemies
        .flatMap((mob) => mob.spawns.map((spawn) => ({ mob, spawn })))
        .filter(
          (mobSpawn) =>
            mobSpawnsEqual(mobSpawn, payload.mobSpawn) ||
            (payload.mobSpawn.spawn.group !== null &&
              mobSpawn.spawn.group === payload.mobSpawn.spawn.group),
        )
        .map((mobSpawn) => {
          const selectedPull = findSelectedPull(route, mobSpawn)
          return { mobSpawn, selectedPull }
        })

  if (origSelectedPull !== -1) {
    // if already selected, deselect
    return route.pulls.map((pull, pullIdx) =>
      pullIdx !== origSelectedPull
        ? pull
        : {
            ...pull,
            mobSpawns: pull.mobSpawns.filter(
              (mobSpawn2) =>
                !groupSpawns.some(({ mobSpawn }) => mobSpawnsEqual(mobSpawn, mobSpawn2)),
            ),
          },
    )
  } else {
    // otherwise, select
    return route.pulls.map((pull, pullIdx) =>
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
    )
  }
}

export function boxSelectSpawnsAction(route: Route, mobSpawnsToAdd: MobSpawn[]) {
  const pull = route.pulls[route.selectedPull]
  if (!pull) return route

  const missingSpawns = mobSpawnsToAdd.filter(
    (mobSpawnToAdd) =>
      !route.pulls.some((pull) =>
        pull.mobSpawns.some((mobSpawn) => mobSpawnsEqual(mobSpawnToAdd, mobSpawn)),
      ),
  )

  if (missingSpawns.length) {
    pull.mobSpawns.push(...missingSpawns)
  } else {
    pull.mobSpawns = pull.mobSpawns.filter(
      (mobSpawn) =>
        !mobSpawnsToAdd.some((mobSpawnToAdd) => mobSpawnsEqual(mobSpawn, mobSpawnToAdd)),
    )
  }

  return route
}

export function addPullFunc(state: RouteState, newPullIndex: number = state.route.pulls.length) {
  const maxId = state.route.pulls.reduce<number>((acc, pull) => (pull.id > acc ? pull.id : acc), 0)
  const newPull = { id: maxId + 1, mobSpawns: [] }
  state.route.pulls.splice(newPullIndex, 0, newPull)
  state.route.selectedPull = Math.max(0, Math.min(newPullIndex, state.route.pulls.length - 1))
}
