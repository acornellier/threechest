import spells from './aa_spells.json'
import { mergeSpells } from './mergeSpells.ts'

const removedSpells = [387523, 386181, 38865, 388984, 388982, 388940, 390915]

export default mergeSpells(spells, {}, removedSpells)
