import spells from './uld_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  184422: [369052], // Boss 4
}

const removedSpells = [
  377395, // Time Sink
  369022, // Purging Flames
]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
