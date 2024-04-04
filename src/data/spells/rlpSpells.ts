import spells from './rlp_spells.json'
import { mergeSpells } from './mergeSpells.ts'
import { Spells } from '../types.ts'

const extraSpells: Spells = {
  188011: [{ id: 371956, name: 'Stone Missile', icon: 'inv_ore_blackrock_ore' }],
  195119: [
    { id: 385310, name: 'Lightning Bolt', icon: 'spell_lightning_lightningbolt01' },
    { id: 385311, name: 'Thunderstorm', icon: 'spell_shaman_thunderstorm' },
    { id: 385313, name: 'Unlucky Strike', icon: 'spell_nature_unrelentingstorm' },
  ],
  189232: [
    { id: 384823, name: 'Inferno', icon: 'ability_warlock_inferno' },
    { id: 373017, name: 'Roaring Blaze', icon: 'spell_fire_flamebolt' },
    { id: 373087, name: 'Burnout', icon: 'spell_fire_selfdestruct' },
  ],
}

const deletedSpells = [372793, 371489, 372568, 372794, 373727, 384197, 381605]

export default mergeSpells(spells, extraSpells, deletedSpells)
