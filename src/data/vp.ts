import type { Dungeon, MdtMob } from './types.ts'
import mdtData from './vp_mdt.json'

const mdtMobs: MdtMob[] = mdtData.enemies as MdtMob[]

export const vp: Dungeon = {
  mdtMobs,
}
