import type { Spells } from '../types.ts'

export function mergeSpellsOld(spells1: Spells, spells2: Spells, spellsToRemove?: number[]) {
  let res: Spells = {}

  Object.entries(spells1).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells)
  })

  Object.entries(spells2).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells)
  })

  if (spellsToRemove) {
    res = Object.entries(res).reduce<Spells>((acc, [enemyId, spells]) => {
      acc[Number(enemyId)] = spells.filter((spell) => !spellsToRemove.includes(spell.id))
      return acc
    }, {})
  }

  return res
}

export function getIconLink(icon: string) {
  if (!icon.endsWith('.jpg')) icon += '.jpg'
  return `https://wow.zamimg.com/images/wow/icons/large/${icon}`
}
