import { Mob, MobSpawn } from '../data/types.ts'
import { Pull } from './types.ts'

export const mobsEqual = (mob1: { enemyIndex: number }, mob2: { enemyIndex: number }) =>
  mob1.enemyIndex === mob2.enemyIndex

export const spawnsEqual = (spawn1: { spawnIndex: number }, spawn2: { spawnIndex: number }) =>
  spawn1.spawnIndex === spawn2.spawnIndex

export const mobSpawnsEqual = (mobSpawn1: MobSpawn, mobSpawn2: MobSpawn) =>
  mobsEqual(mobSpawn1.mob, mobSpawn2.mob) && spawnsEqual(mobSpawn1.spawn, mobSpawn2.spawn)

export const mobScale = (mob: Mob) => mob.scale * (mob.isBoss ? 1.7 : 1)

export const joinMobSpawns = (mobSpawns1: MobSpawn[], mobSpawns2: MobSpawn[]) =>
  mobSpawns1.concat(
    mobSpawns2.filter(
      (mobSpawn2) => !mobSpawns1.some((mobSpawn1) => mobSpawnsEqual(mobSpawn1, mobSpawn2)),
    ),
  )

export const pullContainsMobSpawn = (pull: Pull, mobSpawn: MobSpawn) =>
  pull.mobSpawns.some((mobSpawn2) => mobSpawnsEqual(mobSpawn, mobSpawn2)) ||
  pull.tempMobSpawns.some((mobSpawn2) => mobSpawnsEqual(mobSpawn, mobSpawn2))
