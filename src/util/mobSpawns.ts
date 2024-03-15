import { Dungeon, Mob, MobSpawn, SpawnId } from '../data/types.ts'
import { Pull } from './types.ts'

export function findMobSpawn(spawnId: SpawnId, dungeon: Dungeon): MobSpawn {
  const mobSpawn = dungeon.mobSpawns[spawnId]

  if (!mobSpawn) throw new Error(`Could not find spawn with id ${spawnId}`)

  return mobSpawn
}

export const mobScale = ({ mob, spawn }: MobSpawn) =>
  (mob.scale ?? 1) * (spawn.scale ?? 1) * (mob.isBoss ? 1.7 : 1)

export const joinMobSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.concat(spawns2.filter((spawn2) => !spawns1.includes(spawn2)))

export const pullContainsMobSpawn = (pull: Pull, spawn: SpawnId) =>
  pull.spawns.includes(spawn) || pull.tempSpawns.includes(spawn)

export const mdtEnemiesToMobSpawns = (mobs: Mob[]) =>
  mobs.reduce<Record<SpawnId, MobSpawn>>((acc, mob) => {
    mob.spawns.forEach((spawn) => {
      acc[spawn.id] = { mob, spawn }
    })
    return acc
  }, {})
