import uimapassignment from './uimapassignment.json'

interface UiMapAssignment {
  MapID: number
  UiMapID: number
  // dbc github style
  // 'Region[0]': number
  // 'Region[1]': number
  // 'Region[3]': number
  // 'Region[4]': number
  // wago.tools style
  Region_0: number
  Region_1: number
  Region_3: number
  Region_4: number
}

interface MapBounds {
  yMin: number
  yMax: number
  xMin: number
  xMax: number
}

export type MapBoundsByUiMapId = Record<number, MapBounds>

// 1. Copy the new uimapassignment.json from Grimoire
// 2. Go to https://wago.tools/db2/Map, search for dungeon names and add the ID to the list
// 3. Run yarn tsx ./scripts/buildMapBounds.ts
const mapIds: number[] = [
  2526, // aa
  2874, // cavns
  2811, // magi
  658, // pit
  1753, // seat
  1209, // skyreach
  2805, // wind
  2915, // xenas
]

export const mapBoundsUncompiled = (uimapassignment as UiMapAssignment[]).reduce(
  (acc, assignment) => {
    if (!mapIds.includes(assignment.MapID)) return acc

    if (assignment.MapID == 2830) console.warn(assignment.UiMapID)

    acc[assignment.UiMapID] = {
      yMin: assignment['Region_0'],
      yMax: assignment['Region_3'],
      xMin: -assignment['Region_4'],
      xMax: -assignment['Region_1'],
    }

    return acc
  },
  {} as MapBoundsByUiMapId,
)
