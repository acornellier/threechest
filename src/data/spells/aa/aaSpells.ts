import spells from './aa_spells.json'
import { mergeSpells } from '../mergeSpells.ts'
import { Spells } from '../../types.ts'

const extraSpells: Spells = {
  191736: [{ id: 397210, name: 'Sonic Vulnerability', icon: 'ability_vehicle_sonicshockwave' }],
}

const removedSpells = [387523, 386181, 38865, 388984, 388982, 388940, 390915, 181089]

export default mergeSpells(spells, extraSpells, removedSpells)
