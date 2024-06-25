import uimapassignment from './uimapassignment.json'
import type { DungeonKey } from '../dungeonKeys.ts'

interface UiMapAssignment {
  MapID: number
  UiMapID: number
  'Region[0]': number
  'Region[1]': number
  'Region[3]': number
  'Region[4]': number
}

interface MapBounds {
  yMin: number
  yMax: number
  xMin: number
  xMax: number
}

export type MapBoundsByUiMapId = Record<number, MapBounds>

const mapIds: Record<DungeonKey, number> = {
  ak: 2660,
  cot: 2669,
  db: 2662,
  gb: 670,
  mot: 2290,
  nw: 2286,
  sob: 1822,
  sv: 2652,
}

const mapBounds = (uimapassignment as UiMapAssignment[]).reduce((acc, assignment) => {
  if (!Object.values(mapIds).includes(assignment.MapID)) return acc

  acc[assignment.UiMapID] = {
    yMin: assignment['Region[0]'],
    yMax: assignment['Region[3]'],
    xMin: -assignment['Region[4]'],
    xMax: -assignment['Region[1]'],
  }

  return acc
}, {} as MapBoundsByUiMapId)

export default async () => ({
  data: mapBounds,
})
