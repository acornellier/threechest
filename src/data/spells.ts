import { DungeonKey, Spells } from './types.ts'
import { adSpells } from './spells/adSpells.ts'
import { ebSpells } from './spells/ebSpells.ts'
import { brhSpells } from './spells/brhSpells.ts'
import { dhtSpells } from './spells/dhtSpells.ts'
import { fallSpells } from './spells/fallSpells.ts'
import { riseSpells } from './spells/riseSpells.ts'
import { tottSpells } from './spells/tottSpells.ts'
import { wcmSpells } from './spells/wcmSpells.ts'
import { nokSpells } from './spells/nok.ts'

export const dungeonSpells: Record<DungeonKey, Spells> = {
  aa: {}, // TODO
  ad: adSpells,
  bh: {}, // TODO
  brh: ebSpells,
  dht: brhSpells,
  fall: dhtSpells,
  rise: fallSpells,
  eb: riseSpells,
  nok: nokSpells,
  tott: tottSpells,
  wcm: wcmSpells,
}
