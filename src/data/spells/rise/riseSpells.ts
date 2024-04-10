import wclSpells from './rise_spells.json'
import { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {
  205363: [
    { id: 411300, name: 'Fish Bolt Volley', icon: 'ability_mage_waterjet' },
    { id: 411407, name: 'Bubbly Barrage', icon: 'creatureportrait_bubble' },
  ],
  205365: [
    { id: 411700, name: 'Slobbering Bite', icon: 'ability_racial_cannibalize' },
    { id: 411644, name: 'Soggy Bonk', icon: 'inv_polearm_2h_misc_spearfishingrod' },
  ],
}

export default mergeSpellsOld(wclSpells, extraSpells)
