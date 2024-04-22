import type { Spells } from '../types.ts'
import type { DungeonKey } from '../dungeonKeys.ts'

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
}
