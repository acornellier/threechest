import { MdtRoute, Route } from './types.ts'
import { MobSpawn, MobSpawnKey } from '../data/types.ts'

export const mobSpawnIndexToKey = (enemyIndex: number, spawnIndex: number): MobSpawnKey =>
  `${enemyIndex}-${spawnIndex}`

export const mobSpawnToKey = ({ mob, spawn }: MobSpawn) =>
  mobSpawnIndexToKey(mob.enemyIndex, spawn.spawnIndex)

export const mdtRouteToRoute = (mdtRoute: MdtRoute): Route => {
  return {
    dungeonKey: 'vp',
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    pulls: mdtRoute.value.pulls.map((mdtPull) => ({
      color: mdtPull.color.startsWith('#') ? mdtPull.color : `#${mdtPull.color}`,
      mobSpawns: mdtPull.enemies.flatMap((mdtEnemy) =>
        mdtEnemy.spawnIndexes.map((spawnIndex) =>
          mobSpawnIndexToKey(mdtEnemy.enemyIndex, spawnIndex),
        ),
      ),
    })),
  }
}
