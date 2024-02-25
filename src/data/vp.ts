import type { Dungeon, MdtDungeon } from './types.ts'
import mdtData from './vp_mdt.json'

const mdtDungeon: MdtDungeon = mdtData

export const vp: Dungeon = {
  zoneId: 5035,
  key: 'vp',
  mdt: mdtDungeon,
}
