import wclSpells from './eb_spells.json'
import type { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {
  81864: [{ id: 164886, name: 'Dreadpetal Pollen', icon: 'inv_-misc_herb_marrowroot.jpg' }],
  81522: [{ id: 177734, name: 'Agitated Water', icon: 'spell_frost_frostbolt.jpg' }],
}

export default mergeSpellsOld(wclSpells, extraSpells)
