import type { DungeonSpells } from './dungeonSpells.ts'

export const dungeonSpells = import.meta.compileTime<DungeonSpells>('./dungeonSpells.ts')

export function getIconLink(icon: string) {
  if (!icon.endsWith('.jpg')) icon += '.jpg'
  return `https://wow.zamimg.com/images/wow/icons/large/${icon}`
}
