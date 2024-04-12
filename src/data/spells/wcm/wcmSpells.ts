import wclSpells from './wcm_spells.json'
import type { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {
  135234: [{ id: 265642, name: 'Diseased Crunch', icon: 'ability_creature_poison_01' }],
  131850: [
    { id: 264525, name: 'Shrapnel Trap', icon: 'ability_hunter_traplauncher' },
    { id: 264520, name: 'Severing Serpent', icon: 'ability_hunter_cobrashot' },
  ],
  131849: [
    { id: 264510, name: 'Shoot', icon: 'ability_marksmanship' },
    { id: 264456, name: 'Tracking Explosive', icon: 'inv_gizmo_rocketlauncher' },
  ],
}

export default mergeSpellsOld(wclSpells, extraSpells)
