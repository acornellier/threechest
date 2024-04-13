import spells from './nok_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  186338: [392198], // Maruuk: Ancestral Bond
  186339: [392198], // Teera: Ancestral Bond
}

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells),
})
