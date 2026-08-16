import type { SpellCooldowns } from './spellCooldownTypes.ts'
import { minedCooldowns } from './spellCooldownsMined.ts'

/**
 * Hand-written corrections over the mined intervals, mirroring how mdtDungeons.ts patches upstream
 * MDT data. Patches win, and survive re-running `yarn cooldowns`.
 *
 * Set `cooldown: null` to exclude a spell — the second half of a cast/channel pair MDT lists twice
 * under two ids, or a cast that doesn't really demand a kick. Or give a hand-measured value for
 * spells the run flagged LOW CONFIDENCE or NO INTERVAL, which it leaves unmined.
 */
const patches: SpellCooldowns = {
  // 1264110: { cooldown: null, note: 'cast/channel duplicate of Felstorm 1264106' },
}

/**
 * Seconds between required kicks, keyed by spell id: how long after one kick lands until the next
 * is needed. Combines the mob's cooldown (or interrupt lockout, whichever binds) with the cast
 * time the kicker has to react in. See scripts/guessSpellCooldowns.ts.
 *
 * A missing entry contributes nothing, so unmined and deliberately-excluded behave the same at
 * runtime — but stay distinguishable in the data, which keeps the coverage table meaningful.
 */
export const spellCooldowns: SpellCooldowns = Object.fromEntries(
  Object.entries(minedCooldowns).map(([id, cooldown]) => [id, { cooldown }]),
)

Object.assign(spellCooldowns, patches)
