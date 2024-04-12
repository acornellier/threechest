import wclSpells from './tott_spells.json'
import type { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {}

const spellsToRemove = [429089]

export default mergeSpellsOld(wclSpells, extraSpells, spellsToRemove)
