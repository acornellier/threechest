import { mergeSpells } from './grimoire.ts'
import { type DungeonKey, dungeonKeys } from '../dungeonKeys.ts'
import type { Spells } from '../types.ts'

export type DungeonSpells = Record<DungeonKey, Spells>

const dungeonSpells = dungeonKeys.reduce((acc, key) => {
  acc[key] = mergeSpells(key)
  return acc
}, {} as DungeonSpells)

export default async () => ({
  data: dungeonSpells,
})
