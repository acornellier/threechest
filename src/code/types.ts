import { DungeonKey } from '../data/types.ts'

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

export type Route = {
  name: string
  dungeonKey: DungeonKey
  selectedPull: number
  pulls: MdtPull[]
}
