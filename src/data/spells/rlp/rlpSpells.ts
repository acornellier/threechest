import spells from './rlp_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  188011: [371956], // Early mob Stone Missile
  195119: [385310, 385311, 385313], // Lightning guy nobody pulls
  189232: [384823, 373017, 373087], // Boss 2 spawned ad
}

const removedSpells: number[] = []

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
