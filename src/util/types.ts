import type { Point, SpawnId } from '../data/types.ts'
import type { ForwardRefExoticComponent, PropsWithoutRef, SVGProps } from 'react'
import type { DungeonKey } from '../data/dungeonKeys.ts'
import type { WclRanking } from './wclRankings.ts'

export type Pull = {
  id: number
  spawns: SpawnId[]
  spawnsBackup?: SpawnId[]
}

export type SavedRoute = {
  name: string
  uid: string
  dungeonKey: DungeonKey
}

export type Note = {
  text: string
  position: Point
  justAdded?: boolean
}

export type Drawing = {
  id: number
  weight: number
  color: string
  positions: Point[][]
  arrowRotation?: number
}

export type Route = {
  name: string
  uid: string
  dungeonKey: DungeonKey
  pulls: Pull[]
  notes: Note[]
  drawings: Drawing[]
}

export type PullDetailed = Pull & {
  index: number
  count: number
  health: number
  countCumulative: number
  healthCumulative: number
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
  // [0: weight, 1: 1, 2: floor, 3: true, 4: color, 5: -8]
  d: [number, 1, number, true, string, -8, true]

  // [prevX, prevY, x, y]
  l: string[]
}

export type MdtArrow = {
  // [0: weight, 1: 1, 2: floor, 3: true, 4: color, 5: -8, 6: true]
  d: [number, 1, number, true, string, -8]

  // [prevX, prevY, x, y]
  l: string[]

  // rotation in radians, left is 0
  t: [number]
}

export type MdtObject = MdtNote | MdtPolygon | MdtArrow

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
  objects: MdtObject[] | Record<number, MdtObject>
}

export type SampleRoute = {
  route: Route
  difficulty?: 'beginner' | 'intermediate' | 'expert'
  wclRanking?: WclRanking
}

export type IconComponent = ForwardRefExoticComponent<PropsWithoutRef<SVGProps<SVGSVGElement>>>
