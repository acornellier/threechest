import { DungeonKey, MobSpawn } from '../data/types.ts'

export type Pull = {
  id: number
  mobSpawns: MobSpawn[]
}

export type SavedRoute = {
  name: string
  uid: string
  dungeonKey: DungeonKey
}

export type Route = {
  name: string
  uid: string
  dungeonKey: DungeonKey
  selectedPull: number
  pulls: Pull[]
}

export type PullDetailed = Pull & {
  count: number
  countCumulative: number
}

export type MdtPullEnemy = {
  enemyIndex: number
  spawnIndexes: number[]
}

// In the original, keys are enemyIndex and value is spawnIndex[]
export type MdtPull = {
  color: string
  enemies: MdtPullEnemy[]
}

export type MdtRoute = {
  text: string
  week: number
  difficulty: number
  uid: string
  value: {
    currentPull: number
    currentSublevel: number
    currentDungeonIdx: number
    selection: number[]
    pulls: MdtPull[]
  }
}
