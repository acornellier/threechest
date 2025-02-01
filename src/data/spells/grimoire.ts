import { getGrimoireSpell } from 'grimoire-wow'
import type { MdtSpell, Spell, Spells } from '../types.ts'
import type { DungeonKey } from '../dungeonKeys.ts'
import { mdtDungeons } from '../mdtDungeons.ts'

function mdtSpellToSpell(mdtSpell: MdtSpell): Spell {
  const spell = getGrimoireSpell(mdtSpell.id)
  const effect = spell.effects?.[0]

  return {
    name: spell.name,
    id: spell.id,
    icon: spell.icon,
    damage: effect?.damage,
    aoe: effect?.aoe,
    physical: spell.schools && spell.schools[0] === 'physical',
    castTime: spell.castTime,
    attributes: mdtSpell.attributes,
  }
}

// const dungeonKeyToSpellBankName: Partial<Record<DungeonKey, string>> = {}

export function mergeSpells(dungeonKey: DungeonKey, spellsToRemove?: number[]) {
  const res: Spells = {}

  const mdtDungeon = mdtDungeons[dungeonKey]
  for (const enemy of mdtDungeon.enemies) {
    for (const mdtSpell of enemy.spells) {
      if (spellsToRemove?.includes(mdtSpell.id)) continue

      res[enemy.id] ??= []
      res[enemy.id]!.push(mdtSpellToSpell(mdtSpell))
    }
  }

  return res
}
