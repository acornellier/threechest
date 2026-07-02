import { describe, expect, it } from 'vitest'
import { wclEventKey, wclResultToRoute, type WclResult, type WclTrace } from './wclCalc.ts'
import lvzFixture from './__fixtures__/wclRoute-LvZWMHBf3zrk9nFN-12.json'

// Regression test for a bug where a swarm of same-mob-type events (24x Brightscale Wyrm, raw
// event ids 40-63) fell through every composition pass to the byNearestSpawn last resort, even
// though two whole MDT groups (spawn groups 20 and 21, 12 wyrms each) cleanly cover them. The
// cause: calculateWholeGroupPull required its ENTIRE remaining event pool to compose to zero,
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

// Regression test for a bug introduced by the fix above: calculateWholeGroupPull's partial
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
    expect(passNames).not.toEqual(['byWholeGroup', 'byWholeGroup', 'byWholeGroup', 'byWholeGroup'])
  })
})
