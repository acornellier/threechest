import { Pull, PullDetailed } from '../../../util/types.ts'
import { Dungeon } from '../../../data/types.ts'

export function augmentPulls(pulls: Pull[], dungeon: Dungeon): PullDetailed[] {
  const pullsDetailed: PullDetailed[] = []

  let countCumulative = 0
  let pullIndex = 0
  for (const pull of pulls) {
    const count = pull.spawns.reduce((acc, spawnId) => {
      const mobSpawn = dungeon.mobSpawns[spawnId]
      if (!mobSpawn) {
        console.error(`Could not find spawnId ${spawnId} in dungeon ${dungeon.key}`)
        return acc
      }

      return acc + mobSpawn.mob.count
    }, 0)

    countCumulative += count

    pullsDetailed.push({
      ...pull,
      index: pullIndex,
      count,
      countCumulative,
    })

    ++pullIndex
  }

  return pullsDetailed
}
