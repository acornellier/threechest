import { DungeonKey, MobSpawn } from '../data/types.ts'

export type Pull = {
  id: number
  color: string
  mobSpawns: MobSpawn[]
}

export type Route = {
  name: string
  dungeonKey: DungeonKey
  selectedPull: number
  hoveredPull?: number | null
  pulls: Pull[]
}

export type PullDetailed = Pull & {
  count: number
}

export type RouteDetailed = Omit<Route, 'pulls'> & {
  pulls: PullDetailed[]
  count: number
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
