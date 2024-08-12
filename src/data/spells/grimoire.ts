import { getGrimoireSpell } from 'grimoire-wow'
import type { DispelType, Spell, SpellIdMap, Spells } from '../types.ts'
import spellBankJson from './spellBank.json'
import { mapBy } from '../../util/nodash.ts'

const extraSpellsData = spellBankJson.result.data.allContentfulPatternItem.nodes
const extraSpellDataById = mapBy(extraSpellsData, 'spellId')

function spellIdToSpell(spellId: number): Spell {
  const spell = getGrimoireSpell(spellId)
  const effect = spell.effects?.[0]

  const extraSpellData = extraSpellDataById[spellId]
  return {
    name: spell.name,
    id: spell.id,
    icon: spell.icon,
    damage: effect?.damage,
    aoe: effect?.aoe,
    physical: spell.schools && spell.schools[0] === 'physical',
    castTime: spell.castTime,
    interrupt: !!extraSpellData?.interruptible,
    stop: !!extraSpellData?.ccable,
    dispel: (extraSpellData?.dispell as DispelType[]) ?? [],
  }
}

export function mergeSpells(
  spellBankDungeon: string,
  spells2: SpellIdMap,
  spellsToRemove?: number[],
) {
  let res: Spells = {}

  for (const spell of extraSpellsData) {
    if (!spell.enemies) continue

    const spellId = Number(spell.spellId)
    if (res[spellId]) continue

    if (!spell.metadata.tags.some((tag) => tag.name != spellBankDungeon)) continue

    for (const enemy of spell.enemies) {
      res[Number(enemy.npcId)] ??= []
      res[Number(enemy.npcId)]!.push(spellIdToSpell(spellId))
    }
  }

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
