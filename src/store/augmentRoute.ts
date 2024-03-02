import { PullDetailed, Route, RouteDetailed } from '../code/types.ts'

export function augmentRoute(route: Route): RouteDetailed {
  const pullsDetailed: PullDetailed[] = []

  let count = 0
  for (const pull of route.pulls) {
    for (const mobSpawn of pull.mobSpawns) {
      count += mobSpawn.mob.count
    }

    pullsDetailed.push({
      ...pull,
      count,
    })
  }

  return {
    ...route,
    pulls: pullsDetailed,
    count,
  }
}
