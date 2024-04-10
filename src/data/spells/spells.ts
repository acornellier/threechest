import { Spells } from '../types.ts'
import ad from './ad/adSpells.ts'
import eb from './eb/ebSpells.ts'
import brh from './brh/brhSpells.ts'
import dht from './dht/dhtSpells.ts'
import fall from './fall/fallSpells.ts'
import tott from './tott/tottSpells.ts'
import wcm from './wcm/wcmSpells.ts'
import rise from './rise/riseSpells.ts'
import { DungeonKey } from '../dungeonKeys.ts'

const aa = import.meta.compileTime<Spells>('./aa/aaSpells.ts')
const av = import.meta.compileTime<Spells>('./av/avSpells.ts')
const bh = import.meta.compileTime<Spells>('./bh/bhSpells.ts')
const hoi = import.meta.compileTime<Spells>('./hoi/hoiSpells.ts')
const nelth = import.meta.compileTime<Spells>('./nelth/nelthSpells.ts')
const nok = import.meta.compileTime<Spells>('./nok/nokSpells.ts')
const rlp = import.meta.compileTime<Spells>('./rlp/rlpSpells.ts')
const uld = import.meta.compileTime<Spells>('./uld/uldSpells.ts')

export const dungeonSpells: Record<DungeonKey, Spells> = {
  aa,
  av,
  bh,
  hoi,
  nelth,
  nok,
  rlp,
  uld,

  ad,
  brh,
  dht,
  fall,
  eb,
  rise,
  tott,
  wcm,
}
