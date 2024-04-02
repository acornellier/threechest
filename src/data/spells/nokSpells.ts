import spells from './nok_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {}

export default mergeSpells(spells, extraSpells)
