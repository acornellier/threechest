import spells from './nok_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  196263: [386012], // Neophyte
  186338: [392198], // Maruuk: Ancestral Bond
  195579: [386319], // Primal gust
  186339: [392198], // Teera: Ancestral Bond
}

const removedSpells = [
  384185, // Lightning Strike
  392151, // Gale Arrow
  376894, // Crackling Upheaval
  376634, // Iron Spear
  393421, // Quake
  376864, // Static Spear
]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
