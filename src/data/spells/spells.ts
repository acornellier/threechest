import { DungeonKey, Spells } from '../types.ts'
import { adSpells } from './adSpells.ts'
import { ebSpells } from './ebSpells.ts'
import { brhSpells } from './brhSpells.ts'
import { dhtSpells } from './dhtSpells.ts'
import { fallSpells } from './fallSpells.ts'
import { tottSpells } from './tottSpells.ts'
import { wcmSpells } from './wcmSpells.ts'
import { nokSpells } from './nok.ts'
import { riseSpells } from './riseSpells.ts'

export const dungeonSpells: Record<DungeonKey, Spells> = {
  aa: {}, // TODO
  ad: adSpells,
  bh: {}, // TODO
  brh: brhSpells,
  dht: dhtSpells,
  fall: fallSpells,
  eb: ebSpells,
  nok: nokSpells, // TODO
  rise: riseSpells,
  tott: tottSpells,
  wcm: wcmSpells,
}
