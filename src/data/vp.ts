import type { Dungeon, DungeonKey, MdtMob, MdtRoute } from './types.ts'
import mdtData from './vp_mdt.json'
import route from './vp_route.json'

const mdtMobs: MdtMob[] = mdtData.enemies as MdtMob[]

export const vp: Dungeon = {
  zoneId: 5035,
  key: 'vp',
  mdtMobs,
}

export const dungeonsByKey: Record<DungeonKey, Dungeon> = {
  vp,
}

export const sampleRoute: MdtRoute = route
