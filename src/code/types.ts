import { DungeonKey, MobSpawnKey } from '../data/types.ts'

export type Pull = {
  color: string
  mobSpawns: MobSpawnKey[]
}

export type Route = {
  name: string
  dungeonKey: DungeonKey
  selectedPull: number
  pulls: Pull[]
}

export type MdtPullEnemy = {
  enemyIndex: number
  spawnIndexes: number[]
}

export type MdtPull = {
  color: string
  enemies: MdtPullEnemy[]
}

export type MdtRoute = {
  text: string
  week: number
  difficulty: number
  uid: string
  addonVersion: number
  value: {
    currentPull: number
    currentSublevel: number
    currentDungeonIdx: number
    selection: number[]
    pulls: MdtPull[]
  }
}
