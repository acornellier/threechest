import { getGrimoireSpell } from 'grimoire-wow'
import type { DispelType, Spell, SpellIdMap, Spells } from '../types.ts'
import spellBankJson from './spellBank.json'
import { mapBy } from '../../util/nodash.ts'

const extraSpellsData = spellBankJson.result.data.allContentfulPatternItem.nodes
const extraSpellDataById = mapBy(extraSpellsData, 'spellId')

function spellIdToSpell(spellId: number): Spell {
  const spell = getGrimoireSpell(spellId)
  const extraSpellData = extraSpellDataById[spellId]
  return {
    name: spell.name,
    id: spell.id,
    icon: spell.icon,
    damage: spell.damage,
    aoe: spell.aoe,
    physical: spell.physical,
    interrupt: !!extraSpellData?.interruptible,
    stop: !!extraSpellData?.ccable,
    dispel: (extraSpellData?.dispell as DispelType[]) ?? [],
  }
}

export function mergeSpells(spells1: SpellIdMap, spells2: SpellIdMap, spellsToRemove?: number[]) {
  let res: Spells = {}

  Object.entries(spells1).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells.map(spellIdToSpell))
  })

  Object.entries(spells2).forEach(([enemyId, spells]) => {
    res[Number(enemyId)] ??= []
    res[Number(enemyId)]!.push(...spells.map(spellIdToSpell))
  })

  if (spellsToRemove) {
    res = Object.entries(res).reduce<Spells>((acc, [enemyId, spells]) => {
      acc[Number(enemyId)] = spells.filter((spell) => !spellsToRemove.includes(spell.id))
      return acc
    }, {})
  }

  return res
}
