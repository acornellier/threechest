import wclSpells from './brh_spells.json'
import type { Spells } from '../../types.ts'
import { mergeSpellsOld } from '../mergeSpells.ts'

const extraSpells: Spells = {
  98521: [
    { id: 194966, name: 'Soul Echoes', icon: 'spell_warlock_demonsoul.jpg' },
    { id: 196883, name: 'Spirit Blast', icon: 'spell_misc_zandalari_council_soulswap.jpg' },
  ],
  98681: [{ id: 225909, name: 'Soul Venom', icon: 'spell_warlock_soulburn.jpg' }],
  98677: [{ id: 225909, name: 'Soul Venom', icon: 'spell_warlock_soulburn.jpg' }],
  98706: [
    { id: 200261, name: 'Bonebreaking Strike', icon: 'ability_deathknight_brittlebones.jpg' },
  ],
  101549: [{ id: 200256, name: 'Phased Explosion', icon: 'spell_arcane_arcanetorrent.jpg' }],
}

export default mergeSpellsOld(wclSpells, extraSpells)
