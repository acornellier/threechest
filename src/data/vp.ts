import type { Dungeon, DungeonKey, Mob } from './types.ts'
import mdtData from './vp_mdt.json'
import route from './vp_route.json'
import { MdtRoute } from '../code/types.ts'

const mdtMobs: Mob[] = mdtData.enemies as Mob[]

export const vp: Dungeon = {
  zoneId: 5035,
  key: 'vp',
  mdtMobs,
}

export const dungeonsByKey: Record<DungeonKey, Dungeon> = {
  vp,
}

export const sampleRoute: MdtRoute = route
