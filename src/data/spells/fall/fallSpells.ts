import wclSpells from './fall_spells.json'
import { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {
  198933: [{ id: 198933, name: 'Timerip', icon: 'ability_evoker_timespiral' }],
  198996: [
    { id: 403910, name: 'Decaying Time', icon: 'ability_malkorok_blightofyshaarj_red' },
    { id: 403912, name: 'Accelerating Time', icon: 'ability_malkorok_blightofyshaarj_yellow' },
    { id: 414307, name: 'Radiant', icon: 'spell_holy_rune' },
  ],
}

export default mergeSpellsOld(wclSpells, extraSpells)
