import { Spells } from '../types.ts'
import aa from './aa/aaSpells.ts'
import ad from './ad/adSpells.ts'
import av from './av/avSpells.ts'
import eb from './eb/ebSpells.ts'
import bh from './bh/bhSpells.ts'
import brh from './brh/brhSpells.ts'
import dht from './dht/dhtSpells.ts'
import fall from './fall/fallSpells.ts'
import hoi from './hoi/hoiSpells.ts'
import nelth from './nelth/nelthSpells.ts'
import tott from './tott/tottSpells.ts'
import wcm from './wcm/wcmSpells.ts'
import nok from './nok/nokSpells.ts'
import rise from './rise/riseSpells.ts'
import rlp from './rlp/rlpSpells.ts'
import uld from './uld/uldSpells.ts'
import { DungeonKey } from '../dungeonKeys.ts'

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
