import { Dungeon, Mob, MobSpawn, SpawnId } from '../data/types.ts'
import { Pull } from './types.ts'

export function findMobSpawn(spawnId: SpawnId, dungeon: Dungeon): MobSpawn {
  for (const mob of dungeon.mdt.enemies) {
    for (const spawn of mob.spawns) {
      if (spawn.id === spawnId) return { mob, spawn }
    }
  }

  throw new Error(`Could not find spawn with id ${spawnId}`)
}

export const mobScale = (mob: Mob) => mob.scale * (mob.isBoss ? 1.7 : 1)

export const joinMobSpawns = (spawns1: SpawnId[], spawns2: SpawnId[]) =>
  spawns1.concat(spawns2.filter((spawn2) => !spawns1.includes(spawn2)))

export const pullContainsMobSpawn = (pull: Pull, spawn: SpawnId) =>
  pull.spawns.includes(spawn) || pull.tempSpawns.includes(spawn)
