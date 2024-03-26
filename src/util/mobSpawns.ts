import { Mob, MobSpawn, SpawnId } from '../data/types.ts'

export const mobScale = ({ mob, spawn }: MobSpawn) =>
  (mob.scale ?? 1) * (spawn.scale ?? 1) * (mob.isBoss ? 1.7 : 1)

export const joinSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.concat(spawns2.filter((spawn2) => !spawns1.includes(spawn2)))

export const subtractSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.filter((spawn1) => !spawns2.includes(spawn1))

export const mdtEnemiesToMobSpawns = (mobs: Mob[]) =>
  mobs.reduce<Record<SpawnId, MobSpawn>>((acc, mob) => {
    mob.spawns.forEach((spawn) => {
      acc[spawn.id] = { mob, spawn }
    })
    return acc
  }, {})
