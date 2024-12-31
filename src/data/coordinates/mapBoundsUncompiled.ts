import uimapassignment from './uimapassignment.json'

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

// https://wago.tools/db2/Map
const mapIds: number[] = [
  2293, // top
]

export const mapBoundsUncompiled = (uimapassignment as UiMapAssignment[]).reduce(
  (acc, assignment) => {
    if (!mapIds.includes(assignment.MapID)) return acc

    acc[assignment.UiMapID] = {
      yMin: assignment['Region[0]'],
      yMax: assignment['Region[3]'],
      xMin: -assignment['Region[4]'],
      xMax: -assignment['Region[1]'],
    }

    return acc
  },
  {} as MapBoundsByUiMapId,
)
