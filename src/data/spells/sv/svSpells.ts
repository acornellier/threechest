import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {}

const removedSpells: number[] = []

export default async () => ({
  data: mergeSpells('The Stonevault', extraSpells, removedSpells),
})
