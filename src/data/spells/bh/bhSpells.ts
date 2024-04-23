import spells from './bh_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const jsonSpells = spells as SpellIdMap

const extraSpells: SpellIdMap = {
  191926: [384854, 384847], // Fish guy
  186121: [373939, 387264], // Final boss
  187033: [385185], // Stinkbreath Disoriented
  187238: [367481], // Witherling Bite
  194241: jsonSpells[187224]!, // Gauntlet Rothexer 1
  194487: jsonSpells[187224]!, // Gauntlet Rothexer 2
}

const removedSpells = [
  384150, // Fighter Clawmangle
]

export default async () => ({
  data: mergeSpells(jsonSpells, extraSpells, removedSpells),
})
