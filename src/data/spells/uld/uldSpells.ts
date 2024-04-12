import spells from './uld_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  184422: [369006, 369052], // Boss 4
}

const removedSpells = [373662, 375339, 369792, 369423, 369022, 369026]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells, removedSpells),
})
