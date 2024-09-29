import type { SpellIdMap } from '../../types.ts'
import { mergeSpells } from '../grimoire.ts'

const extraSpells: SpellIdMap = {
  220423: [443500, 443507],
}

const removedSpells: number[] = []

export default async () => ({
  data: mergeSpells('City of Threads', extraSpells, removedSpells),
})
