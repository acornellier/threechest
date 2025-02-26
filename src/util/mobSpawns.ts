import type { Dungeon, Mob, MobSpawn, SpawnId } from '../data/types.ts'
import type { PullDetailed } from './types.ts'
import { roundTo } from './numbers.ts'
import { rgbToHex } from './colors.ts'

export const mobScale = ({ mob, spawn }: MobSpawn) =>
  (mob.scale ?? 1) * (spawn.scale ?? 1) * (mob.isBoss ? 1.7 : 1)

export const joinSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.concat(spawns2.filter((spawn2) => !spawns1.includes(spawn2)))

export const subtractSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.filter((spawn1) => !spawns2.includes(spawn1))

const seasonalMobIds = [
  // encrypted
  185685, 185683, 185680,
  // tormented
  179891, 179892, 179890, 179446,
]

export const mdtEnemiesToMobSpawns = (mobs: Mob[]) =>
  mobs
    .filter(({ id }) => !seasonalMobIds.includes(id))
    .reduce<Record<SpawnId, MobSpawn>>((acc, mob) => {
      mob.spawns.forEach((spawn) => {
        acc[spawn.id] = { mob, spawn }
      })
      return acc
    }, {})

export function mobCcTypes(mob: Mob): string[] {
  if (mob.isBoss) return ['Boss']

  const { characteristics } = mob
  if (characteristics.length <= 2) return ['Immune to all CC']

  const immunities: string[] = []
  if (!characteristics.includes('Fear')) immunities.push('Fear')

  if (immunities.length) return immunities.map((cc) => `Immune to ${cc}`)

  return ['Susceptible to standard CC']
}

type MobCount = Record<number, { mob: Mob; count: number }>

export const countMobs = (pull: PullDetailed, dungeon: Dungeon) => {
  const mobCounts = pull.spawns.reduce<MobCount>((acc, spawnId) => {
    const mobSpawn = dungeon.mobSpawns[spawnId]
    if (!mobSpawn) {
      console.error(`Could not find spawnId ${spawnId} in dungeon ${dungeon.key}`)
      return acc
    }

    const { mob } = mobSpawn
    acc[mob.id] ??= { mob, count: 0 }
    acc[mob.id]!.count += 1
    return acc
  }, {})

  return Object.values(mobCounts).sort((a, b) => b.mob.count - a.mob.count)
}

export function mobEfficiency(
  { count, health }: { count: number; health: number },
  dungeon: Dungeon,
) {
  const efficiencyScore = roundTo(
    (2.5 * (count / dungeon.mdt.totalCount) * 12_000) / (health / 500_000),
    1,
  )
  const efficiencyColor = rgbToHex(
    Math.max(0, Math.min(1, 2 * (1 - efficiencyScore / 10))),
    Math.min(1, (2 * efficiencyScore) / 10),
    0,
  )

  return { efficiencyScore, efficiencyColor }
}
