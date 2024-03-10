import { DungeonKey, MobSpawn, Point } from '../data/types.ts'

export type Pull = {
  id: number
  mobSpawns: MobSpawn[]
}

export type SavedRoute = {
  name: string
  uid: string
  dungeonKey: DungeonKey
}

export type Note = {
  text: string
  position: Point
}

export type Drawing = {
  weight: number
  color: string
  positions: Point[][]
}

export type Route = {
  name: string
  uid: string
  dungeonKey: DungeonKey
  selectedPull: number
  pulls: Pull[]
  notes: Note[]
  drawings: Drawing[]
}

export type PullDetailed = Pull & {
  count: number
  countCumulative: number
}

export type MdtPull = {
  color: string
  [enemyIndex: number]: number[]
}

export type MdtNote = {
  // [0: x, 1: y, 2: floor, 3: true, 4: text]
  d: [number, number, number, true, string]
  n: true
}

export type MdtPolygon = {
  // [0: weight, 1: 1, 2: floor, 3: true, 4: color, 5: -8, 6: true]
  d: [number, 1, number, true, string, -8, true]

  // [prevX, prevY, x, y]
  l: number[]
}

export type MdtObject = MdtNote | MdtPolygon

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
