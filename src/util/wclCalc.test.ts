import { describe, expect, it } from 'vitest'
import { wclEventKey, wclResultToRoute, type WclResult, type WclTrace } from './wclCalc.ts'
import lvzFixture from './__fixtures__/wclRoute-LvZWMHBf3zrk9nFN-12.json'
import gqwFixture from './__fixtures__/wclRoute-gqw4y97LcfAFnHBX-9.json'
import kv3Fixture from './__fixtures__/wclRoute-kv3rTjxn2XLQpwKf-9.json'
import cftFixture from './__fixtures__/wclRoute-CfTcvG8NAj3xY7BD-6.json'
import tfkFixture from './__fixtures__/wclRoute-tfKGMcnvPJVhw1y2-1.json'
import byxFixture from './__fixtures__/wclRoute-byxFGKhMgkAcPp6V-21.json'
import rgpFixture from './__fixtures__/wclRoute-rGPCqaDyQmJbBLfX-9.json'
import sixpmFixture from './__fixtures__/wclRoute-6pMc2dJHBh1Q8rGF-13.json'

// Regression test: two lone Deathwhisper Necrolytes (raw events 20 and 33) each fell to
// calculateCompositionPull's exact-cover search, which ranked the several identical necrolyte groups
// (same composition, different locations) by distance to the pooled pull centroid. In a pull whose
// leftovers span two locations, that centroid sits between them, leaving two identical groups nearly
// equidistant — so the search claimed the one a hair nearer the centroid (group 52, 35 units from
// event 20) over the one the event sits right on (group 28, 1 unit away). That in turn forced the
// second necrolyte (event 33, 7 units from group 52) onto the leftover far group 28. Ranking
// candidate groups by proximity to the nearest event they'd actually claim puts each necrolyte on
// its own group.
describe('wclResultToRoute — identical whole groups ranked by nearest covered event', () => {
  it('claims the necrolyte group the event sits on, not a farther identical one', () => {
    const { route, errors } = wclResultToRoute(kv3Fixture as unknown as WclResult)
    expect(errors).toEqual([])

    const pullOf = (spawn: string) => route.pulls.find((pull) => pull.spawns.includes(spawn))

    // Group 28's necrolyte (1-4) sits right on event 20; it must own that group's whole cover.
    expect(pullOf('1-4')?.spawns).toEqual(expect.arrayContaining(['2-9', '2-10', '2-11', '3-4']))
    // Group 52's necrolyte (1-3) sits on event 33; it must own group 52, not the far group 28.
    expect(pullOf('1-3')?.spawns).toEqual(expect.arrayContaining(['2-6', '2-7', '2-8', '3-3']))
    // The two necrolytes land in different pulls (not both swept into one).
    expect(pullOf('1-4')).not.toBe(pullOf('1-3'))
  })
})

// Regression test: two Tormented Shades (raw events 80 and 82) each sit 4-5 units from a separate
// single-shade spawn group (15-2, 15-4), but calculateCompositionPull's exact-cover search claimed
// them both for group 92 — a two-shade group 41-50 units away — because getPulledGroups prefers the
// largest group first and one 2-shade group covers both shades in a single claim. Validating that a
// clean cover's groups actually sit on their events (rejecting it when an event belongs to a
// markedly nearer eligible group) sends this to the partial fallback, which claims the near
// singletons instead.
describe('wclResultToRoute — exact cover rejected when a larger group is farther than singletons', () => {
  it('claims the two near single-shade groups, not the far two-shade group', () => {
    const { route, errors } = wclResultToRoute(cftFixture as unknown as WclResult)
    expect(errors).toEqual([])

    const pullOf = (spawn: string) => route.pulls.find((pull) => pull.spawns.includes(spawn))

    // The near single-shade groups the events sit on are claimed...
    expect(pullOf('15-2')).toBeDefined()
    expect(pullOf('15-4')).toBeDefined()
    // ...and the far two-shade group 92 (15-14, 15-15) is not swept in by composition.
    expect(pullOf('15-14')).toBeUndefined()
    expect(pullOf('15-15')).toBeUndefined()
  })
})

// Whole-route snapshots: capture the full pull-by-pull output for real WCL fights so any change to
// the composition passes surfaces as a reviewable diff. Update deliberately with `vitest -u` after
// confirming a change is intended. Each snapshot is keyed to a fixture whose bug fixes are covered
// by the targeted tests above.
describe('wclResultToRoute — full route pull snapshots', () => {
  it('LvZWMHBf3zrk9nFN-12 (Magister) pulls', () => {
    const { route, errors } = wclResultToRoute(lvzFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('gqw4y97LcfAFnHBX-9 (Windrunner) pulls', () => {
    const { route, errors } = wclResultToRoute(gqwFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('kv3rTjxn2XLQpwKf-9 (Pit) pulls', () => {
    const { route, errors } = wclResultToRoute(kv3Fixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('CfTcvG8NAj3xY7BD-6 (Maisara Caverns) pulls', () => {
    const { route, errors } = wclResultToRoute(cftFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('tfKGMcnvPJVhw1y2-1 (Magister 2) pulls', () => {
    const { route, errors } = wclResultToRoute(tfkFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('byxFGKhMgkAcPp6V-21 (Maisara Caverns 2) pulls', () => {
    const { route, errors } = wclResultToRoute(byxFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('rGPCqaDyQmJbBLfX-9 (Magister 3) pulls', () => {
    const { route, errors } = wclResultToRoute(rgpFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })

  it('6pMc2dJHBh1Q8rGF-13 (Windrunner 2) pulls', () => {
    const { route, errors } = wclResultToRoute(sixpmFixture as unknown as WclResult)
    expect(errors).toEqual([])
    expect(route.pulls).toMatchSnapshot()
  })
})

// Regression test for a bug where a swarm of same-mob-type events (24x Brightscale Wyrm, raw
// event ids 40-63) fell through every composition pass to the byNearestSpawn last resort, even
// though two whole MDT groups (spawn groups 20 and 21, 12 wyrms each) cleanly cover them. The
// cause: calculateCompositionPull required its ENTIRE remaining event pool to compose to zero,
// including two unrelated singleton bosses (Arcane Magister, Lightward Healer) dying in the same
// window that no group could also cover — so the whole match bailed instead of claiming the part
// it could confidently solve.
describe('wclResultToRoute — Brightscale Wyrm swarm composition', () => {
  it('assigns the swarm via a composition pass, not the byNearestSpawn last resort', () => {
    const wclResult = lvzFixture as unknown as WclResult
    const trace: WclTrace = new Map()

    const { errors } = wclResultToRoute(wclResult, undefined, trace)
    expect(errors).toEqual([])

    const swarmEvents = wclResult.events.filter(
      (event) => event.gameId === 232106 && event.id! >= 40 && event.id! <= 63,
    )
    expect(swarmEvents).toHaveLength(24)

    for (const event of swarmEvents) {
      const entry = trace.get(wclEventKey(event))
      expect(entry?.status).toBe('assigned')
      expect(entry?.passName).not.toBe('byNearestSpawn')
    }

    // All 24 should land in the same pull, assigned as one clean composition match.
    const pullIndices = new Set(swarmEvents.map((event) => trace.get(wclEventKey(event))?.pullIdx))
    expect(pullIndices.size).toBe(1)
  })
})

// Regression test for a bug introduced by the fix above: calculateCompositionPull's partial
// fallback claimed groups by composition alone, with no check that the matched events were
// actually near each other. Raw event ids 72, 73, 75, 77 (2x Sunblade Enforcer, Lightward Healer,
// Spellwoven Familiar) happen to match MDT spawn group 14's composition exactly, but they're real
// kills scattered ~90-110 units away from group 14's location and up to ~14s apart — a coincidence,
// not a group. The fallback must reject a claim whose matched events sit farther than
// CONFIDENT_CLAIM_MAX_DISTANCE from the group instead of stitching them together.
describe('wclResultToRoute — coincidental composition match across scattered kills', () => {
  it('does not stitch distant, unrelated kills into a whole-group match on composition alone', () => {
    const wclResult = lvzFixture as unknown as WclResult
    const trace: WclTrace = new Map()

    const { errors } = wclResultToRoute(wclResult, undefined, trace)
    expect(errors).toEqual([])

    const scatteredEventIds = [72, 73, 75, 77]
    const events = wclResult.events.filter((event) => scatteredEventIds.includes(event.id!))
    expect(events).toHaveLength(4)

    const passNames = events.map((event) => trace.get(wclEventKey(event))?.passName)
    expect(passNames).not.toEqual(['byComposition', 'byComposition', 'byComposition', 'byComposition'])
  })
})

// Regression test: a seam-ambiguous Arcane Magister (raw event 74 on map 2516, whose true position
// is its other-map candidate event 69 — 6 units from spawn group 25's Magister + 2 Enforcers) was
// being pulled into MDT group 27 (Magister + Spellbreaker + Familiar) by calculateCompositionPull's
// composition fallback. The magister's event sits 37 units from group 27 but only ~6 from group 25,
// so it should complete group 25 (with its two enforcers, events 70/71), not group 27. Grabbing it
// for group 27 also scattered group 25's enforcers to byNearestSpawn and left the *later* real
// group-27 magister (event 78, killed 60s afterward) to steal group 25's magister spawn 1-9.
//
// Correct outcome: Magister spawn 1-9 lands with its two enforcers (18-12, 18-13) as group 25,
// while group 27's magister spawn 1-11 is claimed on its own by the later kill (event 78).
describe('wclResultToRoute — seam-ambiguous magister claimed by the nearer group', () => {
  it('completes group 25 with the magister, leaving group 27 magister on its own', () => {
    const wclResult = lvzFixture as unknown as WclResult

    const { route, errors } = wclResultToRoute(wclResult)
    expect(errors).toEqual([])

    const pullOf = (spawn: string) => route.pulls.find((pull) => pull.spawns.includes(spawn))

    // Group 25 (Magister 1-9 + Enforcers 18-12, 18-13) must land together in one pull.
    const g25Pull = pullOf('1-9')
    expect(g25Pull?.spawns).toContain('18-12')
    expect(g25Pull?.spawns).toContain('18-13')

    // Group 27's magister (1-11) is the later, separate kill — on its own in its pull.
    const g27MagisterPull = pullOf('1-11')
    expect(g27MagisterPull?.spawns).toEqual(['1-11'])
  })
})
