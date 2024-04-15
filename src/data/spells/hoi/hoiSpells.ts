import spells from './hoi_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  190366: [374389], // Froglets poison
  190359: [374615], // Zealot cheap shot
}

const removedSpells: number[] = []

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
