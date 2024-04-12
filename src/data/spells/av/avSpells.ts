import spells from './av_spells.json'
import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const removedSpells = [388804, 436652, 374582, 374731]

export default async () => ({
  data: mergeSpells(spells as SpellIdMap, [], removedSpells),
})
