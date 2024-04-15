import spells from './nok_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  196263: [386012], // Neophyte
  186338: [392198], // Maruuk: Ancestral Bond
  195579: [386319], // Primal gust
  186339: [392198], // Teera: Ancestral Bond
}

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells),
})
