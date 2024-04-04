import spells from './uld_spells.json'
import { Spells } from '../../types.ts'
import { mergeSpells } from '../mergeSpells.ts'

const extraSpells: Spells = {
  184422: [
    { id: 369006, name: 'Burning Heat', icon: 'ability_warlock_fireandbrimstone' },
    { id: 369052, name: 'Seeking Flame', icon: 'spell_fire_fireball02' },
  ],
}

const removedSpells = [373662, 375339, 369792, 369423, 369022, 369026]

export default mergeSpells(spells, extraSpells, removedSpells)
