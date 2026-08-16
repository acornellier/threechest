// How many interrupters a pull demands, assuming full lockdown — every interruptible cast kicked —
// and that a kicker stays on one assigned mob rather than switching targets between casts.
//
// Pull duration cancels out, so it's a rate problem: demand is normalised into melee-kick units.
// Because assignments are per-mob, each mob rounds up on its own before they are summed:
//
//   kicksNeeded = sum over spawns of ceil( 15 / interval )
//
// Rounding the total instead would understate: two mobs at 0.5 and 1.5 kicks worth of rate need 1
// and 2 dedicated kickers, not ceil(2.0).
//
// Reads intervals off `Mob.spells` rather than `dungeonSpells`, deliberately: dungeonSpells comes
// from spells.ts, whose import.meta.compileTime transform only exists in vite.config.ts, so
// importing it here would make this module untestable under vitest.

import type { Mob } from '../data/types.ts'
import type { SpellCooldowns } from '../data/spells/spellCooldownTypes.ts'
import { spellCooldowns } from '../data/spells/spellCooldowns.ts'
import { roundTo } from './numbers.ts'

/** Cooldown of a standard melee interrupt, and the unit demand is expressed in. */
export const MELEE_KICK_CD = 15

/** Kicks a normal group can cover: two melee plus a third body. */
export const KICK_BUDGET = 3

/**
 * School lockout of a melee interrupt — Pummel, Mind Freeze and Rebuke gaps all bottom out at
 * exactly 5.0s across eight logs. A mob can never be re-kicked sooner than this, so mined intervals
 * are floored at it (see scripts/guessSpellCooldowns.ts).
 */
export const MELEE_LOCKOUT = 5

const rateCache = new Map<number, number>()

/**
 * Awarding no enemy forces is what distinguishes a boss from trash — `isBoss` alone doesn't.
 * Vale's Kezkitt and Lightwarden Ruia are `isBoss` yet award 30 forces and need kicking.
 */
const isTrash = (mob: Mob) => !(mob.isBoss && mob.count === 0)

/** Interrupt demand of a single mob, in melee-kick units. */
export function mobKickRate(mob: Mob, cooldowns: SpellCooldowns = spellCooldowns): number {
  const cached = cooldowns === spellCooldowns ? rateCache.get(mob.id) : undefined
  if (cached !== undefined) {
    return cached
  }

  let rate = 0
  if (isTrash(mob)) {
    for (const spell of mob.spells) {
      if (!spell.attributes.includes('interruptible')) {
        continue
      }

      const cooldown = cooldowns[spell.id]?.cooldown
      if (cooldown && cooldown > 0) {
        rate += MELEE_KICK_CD / cooldown
      }
    }
  }

  if (cooldowns === spellCooldowns) {
    rateCache.set(mob.id, rate)
  }

  return rate
}

/**
 * The roundTo is load-bearing: a mob whose spells sum to an exact integer rate can land on
 * 2.0000000000000004 in floating point and ceil to 3.
 */
export const kicksNeeded = (kickRate: number) => Math.ceil(roundTo(kickRate, 6))

/** Dedicated interrupters one mob needs, since a kicker stays on their assigned target. */
export const mobKicksNeeded = (mob: Mob, cooldowns: SpellCooldowns = spellCooldowns) =>
  kicksNeeded(mobKickRate(mob, cooldowns))
