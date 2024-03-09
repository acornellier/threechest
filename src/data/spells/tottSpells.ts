import wclSpells from './tott_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {}

const spellsToRemove = [429089]

export const tottSpells = mergeSpells(wclSpells, extraSpells, spellsToRemove)
