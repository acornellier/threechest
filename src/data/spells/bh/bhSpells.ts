import spells from './bh_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  191926: [384854, 384847], // Fish guy
  186121: [373939, 387264], // Final boss
}

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells),
})
