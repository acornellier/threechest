import spells from './nelth_spells.json'
import { mergeSpells } from '../mergeSpells.ts'
import { Spells } from '../../types.ts'

const extraSpells: Spells = {
  181861: [{ id: 375890, name: 'Magma Eruption', icon: 'ability_rhyolith_volcano' }],
  189901: [{ id: 376783, name: 'Flame Eruption', icon: 'ability_warlock_inferno' }],
}

const removedSpells = [
  375436, 375057, 396424, 373735, 374704, 375055, 373762, 374586, 374842, 374839, 374534, 374535,
  377995, 382795, 378281, 373089, 372543,
]

export default mergeSpells(spells, extraSpells, removedSpells)
