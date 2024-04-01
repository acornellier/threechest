import { Spells } from './types.ts'
import aa from './spells/aaSpells.ts'
import ad from './spells/adSpells.ts'
import av from './spells/avSpells.ts'
import eb from './spells/ebSpells.ts'
import bh from './spells/bhSpells.ts'
import brh from './spells/brhSpells.ts'
import dht from './spells/dhtSpells.ts'
import fall from './spells/fallSpells.ts'
import hoi from './spells/hoiSpells.ts'
import nelth from './spells/hoiSpells.ts'
import tott from './spells/tottSpells.ts'
import wcm from './spells/wcmSpells.ts'
import nok from './spells/nokSpells.ts'
import rise from './spells/riseSpells.ts'
import rlp from './spells/rlpSpells.ts'
import uld from './spells/uldSpells.ts'
import { DungeonKey } from './dungeonKeys.ts'

export const dungeonSpells: Record<DungeonKey, Spells> = {
  aa,
  ad,
  av,
  bh,
  brh,
  dht,
  fall,
  eb,
  hoi,
  nelth,
  nok,
  rise,
  rlp,
  tott,
  uld,
  wcm,
}
