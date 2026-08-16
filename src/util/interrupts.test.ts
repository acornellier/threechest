import { describe, expect, it } from 'vitest'
import type { Mob, SpellAttribute } from '../data/types.ts'
import type { SpellCooldowns } from '../data/spells/spellCooldownTypes.ts'
import { mobKickRate, mobKicksNeeded } from './interrupts.ts'

// Synthetic mobs rather than shipped dungeon data, so these stay valid across seasons. Must not
// import anything reaching data/spells/spells.ts — vitest has no compileTime transform.
const mob = (id: number, spellIds: number[], overrides: Partial<Mob> = {}): Mob =>
  ({
    id,
    name: `Mob ${id}`,
    count: 5,
    isBoss: false,
    spells: spellIds.map((spellId) => ({
      id: spellId,
      attributes: ['interruptible'] as SpellAttribute[],
    })),
    ...overrides,
  }) as Mob

const cooldowns: SpellCooldowns = {
  3: { cooldown: 3 },
  6: { cooldown: 6 },
  8: { cooldown: 8 },
  9: { cooldown: 9 },
  10: { cooldown: 10 },
  15: { cooldown: 15 },
  18: { cooldown: 18 },
  30: { cooldown: 30 },
  99: { cooldown: null, note: 'deliberately excluded' },
}

// Mirrors augmentPulls: each mob rounds up on its own, because a kicker stays on one target.
const pullKicks = (mobs: Mob[]) =>
  mobs.reduce((total, m) => total + mobKicksNeeded(m, cooldowns), 0)

describe('pull kicks', () => {
  it('needs two kickers for a single 8s bolt', () => {
    // 1.875 rate, but one 15s kick only covers 1.0 of it.
    expect(pullKicks([mob(1, [8])])).toBe(2)
  })

  it('needs one kicker for a single 18s cast', () => {
    expect(pullKicks([mob(1, [18])])).toBe(1)
  })

  it('needs three kickers for three 15s mobs', () => {
    expect(pullKicks([mob(1, [15]), mob(2, [15]), mob(3, [15])])).toBe(3)
  })

  it('sums multiple interruptible spells on one mob', () => {
    // 15/15 + 15/30 = 1.5
    expect(pullKicks([mob(1, [15, 30])])).toBe(2)
  })

  it('gives each mob its own kicker rather than pooling spare capacity', () => {
    // Two mobs at 0.5 and 1.5 kicks worth of rate need 1 and 2 dedicated kickers, not ceil(2.0).
    expect(pullKicks([mob(1, [30]), mob(2, [10])])).toBe(3)

    // Five half-rate mobs still need five bodies, since nobody switches target.
    expect(pullKicks([30, 30, 30, 30, 30].map((cd, i) => mob(i, [cd])))).toBe(5)
  })

  it('does not overshoot when one mob’s spells sum to a whole number', () => {
    // Regression: exactly 10, but in floating point 10.000000000000002, which ceils to 11.
    expect(pullKicks([mob(1, [3, 9, 6, 18])])).toBe(10)
  })
})

describe('mobKickRate', () => {
  it('ignores spells with a null cooldown', () => {
    expect(mobKickRate(mob(1, [99]), cooldowns)).toBe(0)
  })

  it('ignores spells missing from the cooldown data', () => {
    expect(mobKickRate(mob(1, [123456]), cooldowns)).toBe(0)
  })

  it('ignores non-interruptible spells', () => {
    const enrager = mob(1, [15])
    enrager.spells[0]!.attributes = ['enrage']
    expect(mobKickRate(enrager, cooldowns)).toBe(0)
  })

  it('ignores bosses, which award no enemy forces', () => {
    expect(mobKickRate(mob(1, [8], { isBoss: true, count: 0 }), cooldowns)).toBe(0)
  })

  it('still counts forces-bearing mini-bosses', () => {
    // Vale's Kezkitt and Lightwarden Ruia are isBoss but award 30 forces and need kicking.
    expect(mobKickRate(mob(1, [15], { isBoss: true, count: 30 }), cooldowns)).toBe(1)
  })
})
