import { getGrimoireSpell, initGrimoire } from 'grimoire-wow'
import { Spell, SpellIdMap, Spells } from '../types.ts'

export const grimoireSpellsJson = process.cwd() + '/node_modules/grimoire-wow/dist/spells.json'

initGrimoire(grimoireSpellsJson)

export async function compileTimeSpellsAsyncFunction(
  spells1: SpellIdMap,
  spells2: SpellIdMap,
  spellsToRemove?: number[],
) {
  return async function () {
    return {
      data: mergeSpells(spells1, spells2, spellsToRemove),
    }
  }
}

function spellIdToSpell(spellId: number): Spell {
  const spell = getGrimoireSpell(spellId)
  return {
    name: spell.name,
    id: spell.id,
    icon: spell.icon,
    damage: spell.damage,
    aoe: !!spell.aoe,
    physical: !!spell.physical,
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
