import { MdtRoute, Route } from './types.ts'
import { MobSpawn, MobSpawnKey } from '../data/types.ts'
import { dungeonsByKey } from '../data/dungeons.ts'

export function roundTo(number: number, to: number) {
  return Math.round(number * 10 ** to) / 10 ** to
}

export const mobSpawnIndexToKey = (enemyIndex: number, spawnIndex: number): MobSpawnKey =>
  `${enemyIndex}-${spawnIndex}`

export const mobSpawnToKey = ({ mob, spawn }: MobSpawn) =>
  mobSpawnIndexToKey(mob.enemyIndex, spawn.spawnIndex)

export const mobsEqual = (mob1: { enemyIndex: number }, mob2: { enemyIndex: number }) =>
  mob1.enemyIndex === mob2.enemyIndex

export const spawnsEqual = (spawn1: { spawnIndex: number }, spawn2: { spawnIndex: number }) =>
  spawn1.spawnIndex === spawn2.spawnIndex

export const mobSpawnsEqual = (mobSpawn1: MobSpawn, mobSpawn2: MobSpawn) =>
  mobsEqual(mobSpawn1.mob, mobSpawn2.mob) && spawnsEqual(mobSpawn1.spawn, mobSpawn2.spawn)

export const mdtRouteToRoute = (mdtRoute: MdtRoute): Route => {
  const dungeonKey = 'vp'
  const dungeon = dungeonsByKey[dungeonKey]

  return {
    dungeonKey,
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    pulls: mdtRoute.value.pulls.map((mdtPull) => ({
      color: mdtPull.color.startsWith('#') ? mdtPull.color : `#${mdtPull.color}`,
      mobSpawns: mdtPull.enemies.flatMap((mdtEnemy) =>
        mdtEnemy.spawnIndexes.map((spawnIndex) => {
          const mob = dungeon.mdt.enemies.find((enemy) => enemy.enemyIndex == mdtEnemy.enemyIndex)!
          const spawn = mob.spawns.find((spawn) => spawn.spawnIndex === spawnIndex)!
          return { mob, spawn }
        }),
      ),
    })),
  }
}
