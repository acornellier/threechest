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

const mapIds: number[] = [
  2660, // ak
  2669, // cot
  2601, // cot 2
  2662, // db
  670, // gb
  2290, // mot
  2286, // nw
  2222, // nw 2
  1822, // sob
  1643, // sob 2
  2652, // sv
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
