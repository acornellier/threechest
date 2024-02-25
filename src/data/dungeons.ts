import { Dungeon, DungeonKey } from './types.ts'
import { vp } from './vp.ts'
import { mdtRouteToRoute } from '../code/util.ts'
import vpMdtRoute from './vp_mdt_route.json'

export const dungeonsByKey: Record<DungeonKey, Dungeon> = {
  vp,
}

export const sampleVpRoute = mdtRouteToRoute(vpMdtRoute)
