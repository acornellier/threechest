import { describe, expect, it } from 'vitest'
import type { Mob, SpellAttribute } from '../data/types.ts'
import type { SpellCooldowns } from '../data/spells/spellCooldownTypes.ts'
import { kicksNeeded, mobKickRate } from './interrupts.ts'

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
  15: { cooldown: 15 },
  18: { cooldown: 18 },
  30: { cooldown: 30 },
  99: { cooldown: null, note: 'deliberately excluded' },
}

const pullKicks = (mobs: Mob[]) =>
  kicksNeeded(mobs.reduce((rate, m) => rate + mobKickRate(m, cooldowns), 0))

describe('kicksNeeded', () => {
  it('needs two kickers for a single 8s bolt', () => {
    // 1.875 rate, but one 15s kick only covers 1.0 of it.
    expect(pullKicks([mob(1, [8])])).toBe(2)
  })

  it('needs one kicker for a single 18s cast', () => {
    expect(pullKicks([mob(1, [18])])).toBe(1)
  })

  it('needs two kickers for two 18s mobs', () => {
    // Under two kicks' worth of rate, but they can cast simultaneously.
    expect(pullKicks([mob(1, [18]), mob(2, [18])])).toBe(2)
  })

  it('needs three kickers for three 15s mobs', () => {
    expect(pullKicks([mob(1, [15]), mob(2, [15]), mob(3, [15])])).toBe(3)
  })

  it('sums multiple interruptible spells on one mob', () => {
    // 15/15 + 15/30 = 1.5
    expect(pullKicks([mob(1, [15, 30])])).toBe(2)
  })

  it('does not overshoot on mixed cooldowns that sum to a whole number', () => {
    // Regression: exactly 10, but in floating point 10.000000000000002, which ceils to 11.
    expect(pullKicks([mob(1, [3]), mob(2, [9]), mob(3, [6]), mob(4, [18])])).toBe(10)

    // A fractional mixed sum (8.5) still rounds up normally.
    expect(pullKicks([mob(1, [3]), mob(2, [9]), mob(3, [30]), mob(4, [18]), mob(5, [30])])).toBe(9)
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
