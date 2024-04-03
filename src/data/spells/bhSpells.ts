import spells from './bh_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {
  191926: [
    { id: 384854, name: 'Fish Slap!', icon: 'inv_10_fishing_fishdecayed_color2' },
    { id: 384847, name: 'Fresh Catch', icon: 'achievement_profession_fishing_northrendangler' },
  ],
  186121: [
    { id: 373939, name: 'Rotting Burst', icon: 'sha_spell_shaman_lavaburst_nightmare' },
    { id: 387264, name: 'Withered Eruption', icon: 'warlock_curse_weakness_aura' },
  ],
}

const removedSpells = [373915, 373917, 385361, 378229, 384150, 367485, 381416, 381419]

export default mergeSpells(spells, extraSpells, removedSpells)
