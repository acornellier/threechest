import spells from './bh_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {
  186121: [
    {
      id: 373939,
      name: 'Rotting Burst',
      icon: 'sha_spell_shaman_lavaburst_nightmare',
    },
    {
      id: 387264,
      name: 'Withered Eruption',
      icon: 'warlock_curse_weakness_aura',
    },
  ],
}

const removedSpells = [373915, 373917, 385361]

export default mergeSpells(spells, extraSpells, removedSpells)
