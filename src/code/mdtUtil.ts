import { MdtRoute, Route } from './types.ts'
import { dungeonsByKey } from '../data/dungeonsByKey.ts'
import { DungeonKey } from '../data/types.ts'

export const mdtDungeonIndexToDungeonKey: Record<number, DungeonKey> = {
  101: 'dotiu',
  104: 'eb',
}

export const mdtRouteToRoute = (mdtRoute: MdtRoute): Route => {
  const dungeonKey = mdtDungeonIndexToDungeonKey[mdtRoute.value.currentDungeonIdx]
  const dungeon = dungeonsByKey[dungeonKey]

  return {
    dungeonKey,
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    pulls: mdtRoute.value.pulls.map((mdtPull, index) => ({
      id: index,
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
