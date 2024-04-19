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
  aa: 2526,
  av: 2515,
  bh: 2520,
  hoi: 2527,
  nelth: 2519,
  nok: 2516,
  rlp: 2521,
  uld: 2451,

  ad: 0,
  brh: 0,
  dht: 0,
  eb: 1279,
  fall: 0,
  rise: 0,
  tott: 0,
  wcm: 0,
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
