import spells from './av_spells.json'
import { mergeSpells } from '../mergeSpells.ts'

const spellsToRemove = [388804, 436652, 374582, 374731]

export default mergeSpells(spells, {}, spellsToRemove)
