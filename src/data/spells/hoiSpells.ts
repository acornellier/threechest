import spells from './hoi_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {
  189722: [
    {
      id: 385187,
      name: 'Overpowering Croak',
      icon: 'ability_vehicle_sonicshockwave',
    },
  ],
}

const removedSpells = [385181]

export default mergeSpells(spells, extraSpells, removedSpells)
