import type { Dungeon, MdtDungeon } from './types.ts'
import dotiuMdtData from './mdtDungeons/dotiu_mdt.json'
import ebMdtData from './mdtDungeons/eb_mdt.json'

export const eb: Dungeon = {
  key: 'eb',
  mdt: ebMdtData as MdtDungeon,
}

export const dotiu: Dungeon = {
  key: 'dotiu',
  mdt: dotiuMdtData as MdtDungeon,
}
