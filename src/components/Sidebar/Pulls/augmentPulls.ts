import type { Pull, PullDetailed } from '../../../util/types.ts'
import type { Dungeon } from '../../../data/types.ts'

export function augmentPulls(pulls: Pull[], dungeon: Dungeon): PullDetailed[] {
  const pullsDetailed: PullDetailed[] = []

  let countCumulative = 0
  let healthCumulative = 0
  let pullIndex = 0
  for (const pull of pulls) {
    let count = 0
    let health = 0

    const pullGroupsWithBoss = pull.spawns
      .filter((spawnId) => {
        const mobSpawn = dungeon.mobSpawns[spawnId]
        return mobSpawn?.mob.isBoss
      })
      .map((spawnId) => {
        return dungeon.mobSpawns[spawnId]?.spawn.group
      })
      .filter(Boolean)

    for (const spawnId of pull.spawns) {
      const mobSpawn = dungeon.mobSpawns[spawnId]
      if (!mobSpawn) {
        console.error(`Could not find spawnId ${spawnId} in dungeon ${dungeon.key}`)
        continue
      }

      if (
        mobSpawn.mob.isBoss ||
        (mobSpawn.mob.count === 0 &&
          mobSpawn.spawn.group &&
          pullGroupsWithBoss.includes(mobSpawn.spawn.group))
      ) {
        continue
      }

      count += mobSpawn.mob.count
      health += mobSpawn.mob.health
    }

    countCumulative += count
    healthCumulative += health

    pullsDetailed.push({
      ...pull,
      index: pullIndex,
      count,
      health,
      countCumulative,
      healthCumulative,
    })

    ++pullIndex
  }

  return pullsDetailed
}
