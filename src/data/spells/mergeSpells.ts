import { Spells } from '../types.ts'

export function mergeSpells(spells1: Spells, spells2: Spells) {
  const res: Spells = {}
  Object.entries(spells1).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells)
  })
  Object.entries(spells2).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells)
  })
  return res
}
