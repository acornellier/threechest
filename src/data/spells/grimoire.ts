import { getGrimoireSpell } from 'grimoire-wow'
import type { MdtSpell, Spell, Spells } from '../types.ts'
import type { DungeonKey } from '../dungeonKeys.ts'
import { mdtDungeons } from '../mdtDungeons.ts'
import { spellCooldowns } from './spellCooldowns.ts'

function mdtSpellToSpell(mdtSpell: MdtSpell): Spell {
  const spell = getGrimoireSpell(mdtSpell.id)
  const effect = spell.effects?.[0]

  // Display only. The pull interrupt math reads spellCooldowns directly off Mob.spells rather than
  // through here, so the two can diverge if mergeSpells is given spellsToRemove or getGrimoireSpell
  // throws for an id (caught below, dropping the spell from display but not from the math).
  const cooldown = spellCooldowns[mdtSpell.id]?.cooldown

  return {
    name: spell.name,
    id: spell.id,
    icon: spell.icon,
    damage: effect?.damage,
    aoe: effect?.aoe,
    physical: spell.schools && spell.schools[0] === 'physical',
    castTime: spell.castTime,
    ...(cooldown ? { cooldown } : {}),
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
      try {
        res[enemy.id]!.push(mdtSpellToSpell(mdtSpell))
      } catch (e) {
        console.error(e)
      }
    }
  }

  return res
}
