import type { Spells } from '../types.ts'
import type { DungeonKey } from '../dungeonKeys.ts'

const top = import.meta.compileTime<Spells>('./topSpells.ts')

export const dungeonSpells: Record<DungeonKey, Spells> = {
  top,
}

export function getIconLink(icon: string) {
  if (!icon.endsWith('.jpg')) icon += '.jpg'
  return `https://wow.zamimg.com/images/wow/icons/large/${icon}`
}
