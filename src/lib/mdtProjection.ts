import { mapBounds as uiMapBounds } from '../data/coordinates/mapBounds.ts'
import { dungeonsByMdtIdx } from '../data/dungeons.ts'
import { decodeMdtString } from '../util/mdt/mdt2.ts'
import { mapHeight, mapWidth } from '../util/map.ts'
import { wclPointToLeafletPoint } from '../util/wclCalc.ts'

const mdtMapWidth = 3840
const mdtMapHeight = 2560

/** Projects in-game world coordinates onto MDT's map, in MDT pixels. */
export function projectToMdt(x: number, y: number, mapId: number): [number, number] | null {
  if (!uiMapBounds[mapId]) return null

  const [lat, lng] = wclPointToLeafletPoint(
    { x: x * 100, y: y * 100, mapID: mapId, timestamp: 0 },
    [],
  )
  return [(lng / mapWidth) * mdtMapWidth, (-lat / mapHeight) * mdtMapHeight]
}

export async function mdtDungeonKey(mdtString: string): Promise<string | null> {
  const mdtRoute = await decodeMdtString(mdtString)
  return dungeonsByMdtIdx[mdtRoute.value.currentDungeonIdx]?.key ?? null
}
