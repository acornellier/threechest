import spells from './nok_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {}

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, extraSpells),
})
