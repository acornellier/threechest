import spells from './aa_spells.json'
import { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  191736: [397210], // Crawth - Sonic Vulnerability
  190609: [389011], // Echo of Doragosa - Overwhelming Power
}

const removedSpells = [
  387523, // Return to Book
  181089, // Crawth - Encounter Event
]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
