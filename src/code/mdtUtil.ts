import { MdtPullEnemy, MdtRoute, Route } from './types.ts'
import { DungeonKey, MobSpawn, Spawn } from '../data/types.ts'
import { dungeonsByKey } from '../data/dungeons.ts'
import { getPullColor } from './colors.ts'

export const mdtDungeonIndexToDungeonKey: Record<number, DungeonKey> = {
  101: 'dotiu',
  104: 'eb',
}

export function mdtRouteToRoute(mdtRoute: MdtRoute): Route {
  const dungeonKey = mdtDungeonIndexToDungeonKey[mdtRoute.value.currentDungeonIdx]
  const dungeon = dungeonsByKey[dungeonKey]

  return {
    dungeonKey,
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    uid: mdtRoute.uid,
    pulls: mdtRoute.value.pulls.map((mdtPull, index) => ({
      id: index,
      color: mdtPull.color.startsWith('#') ? mdtPull.color : `#${mdtPull.color}`,
      mobSpawns: mdtPull.enemies
        .flatMap((mdtEnemy) =>
          mdtEnemy.spawnIndexes.map((spawnIndex) => {
            const mob = dungeon.mdt.enemies.find((enemy) => enemy.enemyIndex == mdtEnemy.enemyIndex)
            if (!mob) {
              console.error(
                `Could not find enemy index ${mdtEnemy.enemyIndex} in pull ${index + 1}`,
              )
              return null
            }

            const spawn = mob.spawns.find((spawn) => spawn.spawnIndex === spawnIndex)!
            return { mob, spawn }
          }),
        )
        .filter(Boolean) as MobSpawn[],
    })),
  }
}

function mobSpawnsToMdtEnemies(mobSpawns: MobSpawn[]): MdtPullEnemy[] {
  const groupedMobSpawns = mobSpawns.reduce<Record<number, Spawn[]>>((acc, mobSpawn) => {
    acc[mobSpawn.mob.enemyIndex] ??= []
    acc[mobSpawn.mob.enemyIndex].push(mobSpawn.spawn)
    return acc
  }, {})

  return Object.entries(groupedMobSpawns).flatMap(([enemyIndex, spawns]) => ({
    enemyIndex: Number(enemyIndex),
    spawnIndexes: spawns.map((spawn) => spawn.spawnIndex),
  }))
}

export function routeToMdtRoute(route: Route): MdtRoute {
  return {
    text: route.name,
    week: 1,
    difficulty: 2,
    uid: route.uid,
    value: {
      currentPull: route.selectedPull,
      currentSublevel: 1,
      currentDungeonIdx: Number(
        Object.keys(mdtDungeonIndexToDungeonKey).find(
          (key: string) => mdtDungeonIndexToDungeonKey[Number(key)] === route.dungeonKey,
        ),
      ),
      selection: [],
      pulls: route.pulls.map((pull, index) => ({
        color: getPullColor(index),
        enemies: mobSpawnsToMdtEnemies(pull.mobSpawns),
      })),
    },
  }
}
