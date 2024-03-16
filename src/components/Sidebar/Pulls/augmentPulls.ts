import { Pull, PullDetailed } from '../../../util/types.ts'
import { findMobSpawn } from '../../../util/mobSpawns.ts'
import { Dungeon } from '../../../data/types.ts'

export function augmentPulls(pulls: Pull[], dungeon: Dungeon): PullDetailed[] {
  const pullsDetailed: PullDetailed[] = []

  let countCumulative = 0
  for (const pull of pulls) {
    const count = pull.spawns.reduce(
      (acc, spawnId) => acc + findMobSpawn(spawnId, dungeon).mob.count,
      0,
    )

    countCumulative += count

    pullsDetailed.push({
      ...pull,
      count,
      countCumulative,
    })
  }

  return pullsDetailed
}
