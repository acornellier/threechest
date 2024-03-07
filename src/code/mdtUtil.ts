import { MdtRoute, Route } from './types.ts'
import { DungeonKey, MobSpawn } from '../data/types.ts'
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
      mobSpawns: Object.entries(mdtPull)
        .flatMap(([enemyIndexOrCount, spawnIndexes]) => {
          if (!Array.isArray(spawnIndexes)) return null

          const enemyIndex = Number(enemyIndexOrCount)
          return spawnIndexes.map((spawnIndex) => {
            const mob = dungeon.mdt.enemies.find((enemy) => enemy.enemyIndex == enemyIndex)
            if (!mob) {
              console.error(`Could not find enemy index ${enemyIndex} in pull ${index + 1}`)
              return null
            }

            const spawn = mob.spawns.find((spawn) => spawn.spawnIndex === spawnIndex)!
            return { mob, spawn }
          })
        })
        .filter(Boolean) as MobSpawn[],
    })),
  }
}

function mobSpawnsToMdtEnemies(mobSpawns: MobSpawn[]) {
  return mobSpawns.reduce<Record<number, number[]>>((acc, mobSpawn) => {
    acc[mobSpawn.mob.enemyIndex] ??= []
    acc[mobSpawn.mob.enemyIndex].push(mobSpawn.spawn.spawnIndex)
    return acc
  }, {})
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
        ...mobSpawnsToMdtEnemies(pull.mobSpawns),
      })),
    },
    objects: [],
  }
}
