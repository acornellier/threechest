import spells from './nelth_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  181861: [375890], // Elephant boss - Magma Eruption
  189340: [373756, 373767], // Forgemaster
  189478: [], // Forgemaster
  189901: [376783, 391762], // Final boss intermission damage, curse
}

const removedSpells: number[] = []

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
