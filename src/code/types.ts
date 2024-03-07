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

export type MdtPull = {
  color: string
  [enemyIndex: number]: number[]
}

export type MdtObject = {
  d: [number, number, number, boolean, string]
  n: boolean
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
  objects: MdtObject[]
}
