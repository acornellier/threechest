import type { Spells } from '../types.ts'
import type { DungeonKey } from '../dungeonKeys.ts'

const ak = import.meta.compileTime<Spells>('./ak/akSpells.ts')
const cot = import.meta.compileTime<Spells>('./cot/cotSpells.ts')
const db = import.meta.compileTime<Spells>('./db/dbSpells.ts')
const gb = import.meta.compileTime<Spells>('./gb/gbSpells.ts')
const mot = import.meta.compileTime<Spells>('./mot/motSpells.ts')
const nw = import.meta.compileTime<Spells>('./nw/nwSpells.ts')
const sob = import.meta.compileTime<Spells>('./sob/sobSpells.ts')
const sv = import.meta.compileTime<Spells>('./sv/svSpells.ts')

export const dungeonSpells: Record<DungeonKey, Spells> = {
  ak,
  cot,
  db,
  gb,
  mot,
  nw,
  sob,
  sv,
}
