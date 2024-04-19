import spells from './av_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const jsonSpells = spells as SpellIdMap

const addedSpells: SpellIdMap = {
  186740: [387067, 387122], // Arcane Construct
  196116: jsonSpells[187160]!, // Other Crystal Fury
  196117: jsonSpells[187139]!, // Other Crystal Thrasher
}

const removedSpells = [
  181089, // Umbrelskull Encounter Event
]

export default async () => ({
  data: mergeSpells(jsonSpells, addedSpells, removedSpells),
})
