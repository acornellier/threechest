import wclSpells from './dht_spells.json'
import { Spells } from '../types.ts'
import { mergeSpells } from './mergeSpells.ts'

const extraSpells: Spells = {
  95772: [{ id: 225484, name: 'Grievous Rip', icon: 'spell_frost_iceclaw.jpg' }],
  99359: [
    { id: 220369, name: 'Vile Mushroom', icon: 'creature_sporemushroom' },
    { id: 225497, name: 'Corrupted Infusion', icon: 'sha_spell_shadow_shadesofdarkness_nightmare' },
  ],
}

export const dhtSpells = mergeSpells(wclSpells, extraSpells)
