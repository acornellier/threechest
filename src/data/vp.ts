import type { Dungeon, MdtDungeon } from './types.ts'
import mdtData from './vp_mdt.json'
import mdtRoute from './vp_mdt_route.json'
import { mdtRouteToRoute } from '../code/stuff.ts'

const mdtDungeon: MdtDungeon = mdtData

export const vp: Dungeon = {
  zoneId: 5035,
  key: 'vp',
  mdt: mdtDungeon,
}

export const sampleRoute = mdtRouteToRoute(mdtRoute)
