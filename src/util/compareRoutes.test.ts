import { describe, expect, it } from 'vitest'
import type { SpawnId } from '../data/types.ts'
import type { Pull } from './types.ts'
import { compareRoutes } from './compareRoutes.ts'

const pulls = (...spawnGroups: SpawnId[][]): Pull[] =>
  spawnGroups.map((spawns, id) => ({ id, spawns }))

describe('pull matching', () => {
  it('matches identical routes with no differences', () => {
    const route = pulls(['a', 'b'], ['c'], ['d', 'e'])
    const { pullMatches, orphanPulls, changedComparePulls } = compareRoutes(route, route)

    expect(pullMatches.every((match) => match.isIdentical)).toBe(true)
    expect(pullMatches.map((match) => match.comparePullIndices)).toEqual([[0], [1], [2]])
    expect(orphanPulls).toEqual([])
    expect(changedComparePulls.size).toBe(0)
  })

  it('reports a compare pull split across two pulls', () => {
    const route = pulls(['a'], ['b', 'c'], ['d', 'e'])
    const compare = pulls(['a'], ['b', 'c', 'd', 'e'])
    const { pullMatches, changedComparePulls } = compareRoutes(route, compare)

    expect(pullMatches.map((match) => match.comparePullIndices)).toEqual([[0], [1], [1]])
    expect(pullMatches[1]!.isIdentical).toBe(false)
    expect(pullMatches[2]!.isIdentical).toBe(false)
    expect(changedComparePulls).toEqual(new Set([1]))
  })

  it('reports two compare pulls merged into one', () => {
    const route = pulls(['a'], ['b', 'c', 'd', 'e'])
    const compare = pulls(['a'], ['b', 'c'], ['d', 'e'])
    const { pullMatches } = compareRoutes(route, compare)

    expect(pullMatches[1]!.comparePullIndices).toEqual([1, 2])
    expect(pullMatches[1]!.isIdentical).toBe(false)
  })

  it('orders covering pulls by coverage, then by index', () => {
    const route = pulls(['a', 'b', 'c', 'd'])
    const compare = pulls(['a'], ['b'], ['c', 'd'])
    const { pullMatches } = compareRoutes(route, compare)

    expect(pullMatches[0]!.comparePullIndices).toEqual([2, 0, 1])
  })

  it('does not call a pull identical when the compare pull holds an extra spawn', () => {
    const route = pulls(['a', 'b'], ['c'])
    const compare = pulls(['a', 'b', 'c'])
    const { pullMatches } = compareRoutes(route, compare)

    expect(pullMatches[0]!.comparePullIndices).toEqual([0])
    expect(pullMatches[0]!.isIdentical).toBe(false)
  })

  it('does not call a pull identical when equal-sized pulls hold different spawns', () => {
    const route = pulls(['a', 'x'], ['y'])
    const compare = pulls(['a', 'y'], ['x'])
    const { pullMatches } = compareRoutes(route, compare)

    expect(pullMatches[0]!.isIdentical).toBe(false)
  })
})

describe('spawn differences', () => {
  it('marks spawns missing from the compare route as added', () => {
    const route = pulls(['a', 'b', 'new'])
    const compare = pulls(['a', 'b'])
    const { pullMatches, onlyInRoute, onlyInCompare } = compareRoutes(route, compare)

    expect(pullMatches[0]!.addedSpawns).toEqual(['new'])
    expect(pullMatches[0]!.removedSpawns).toEqual([])
    expect(onlyInRoute).toEqual(new Set(['new']))
    expect(onlyInCompare.size).toBe(0)
  })

  it('attributes spawns missing from this route to the pull claiming them', () => {
    const route = pulls(['a'], ['b'])
    const compare = pulls(['a'], ['b', 'gone'])
    const { pullMatches, onlyInCompare } = compareRoutes(route, compare)

    expect(pullMatches[0]!.removedSpawns).toEqual([])
    expect(pullMatches[1]!.removedSpawns).toEqual(['gone'])
    expect(onlyInCompare).toEqual(new Set(['gone']))
  })

  it('collects removed spawns from every compare pull merged into one pull', () => {
    const route = pulls(['a', 'b'])
    const compare = pulls(['a', 'gone1'], ['b', 'gone2'])
    const { pullMatches } = compareRoutes(route, compare)

    expect(pullMatches[0]!.removedSpawns).toEqual(['gone1', 'gone2'])
  })

  it('marks spawns the compare route pulls elsewhere as moved', () => {
    const route = pulls(['a', 'b', 'c'], ['d'])
    const compare = pulls(['a', 'b'], ['c', 'd'])
    const { pullMatches, onlyInRoute, onlyInCompare } = compareRoutes(route, compare)

    expect(pullMatches[0]!.movedSpawns).toEqual(['c'])
    expect(pullMatches[0]!.addedSpawns).toEqual([])
    expect(pullMatches[0]!.removedSpawns).toEqual([])
    expect(onlyInRoute.size).toBe(0)
    expect(onlyInCompare.size).toBe(0)
  })
})

describe('orphan pulls', () => {
  it('anchors an orphan to the pull matching the preceding compare pull', () => {
    const route = pulls(['a'], ['b'])
    const compare = pulls(['a'], ['orphan'], ['b'])
    const { orphanPulls } = compareRoutes(route, compare)

    expect(orphanPulls).toEqual([{ comparePullIndex: 1, afterIndex: 0, spawns: ['orphan'] }])
  })

  it('anchors a leading orphan to the top', () => {
    const route = pulls(['a'])
    const compare = pulls(['orphan'], ['a'])
    const { orphanPulls } = compareRoutes(route, compare)

    expect(orphanPulls[0]!.afterIndex).toBe(-1)
  })

  it('keeps consecutive orphans in compare order on the same anchor', () => {
    const route = pulls(['a'], ['b'])
    const compare = pulls(['a'], ['orphan1'], ['orphan2'], ['b'])
    const { orphanPulls } = compareRoutes(route, compare)

    expect(orphanPulls.map((orphan) => orphan.comparePullIndex)).toEqual([1, 2])
    expect(orphanPulls.every((orphan) => orphan.afterIndex === 0)).toBe(true)
  })

  it('treats every compare pull as an orphan when the route is empty', () => {
    const compare = pulls(['a'], ['b'])
    const { pullMatches, orphanPulls, changedComparePulls, onlyInCompare } = compareRoutes(
      [],
      compare,
    )

    expect(pullMatches).toEqual([])
    expect(orphanPulls.map((orphan) => orphan.afterIndex)).toEqual([-1, -1])
    expect(changedComparePulls).toEqual(new Set([0, 1]))
    expect(onlyInCompare).toEqual(new Set(['a', 'b']))
  })

  it('marks everything as added when the compare route is empty', () => {
    const route = pulls(['a'], ['b'])
    const { pullMatches, orphanPulls, onlyInRoute } = compareRoutes(route, [])

    expect(pullMatches.map((match) => match.comparePullIndices)).toEqual([[], []])
    expect(pullMatches.map((match) => match.addedSpawns)).toEqual([['a'], ['b']])
    expect(pullMatches.every((match) => match.isIdentical)).toBe(false)
    expect(orphanPulls).toEqual([])
    expect(onlyInRoute).toEqual(new Set(['a', 'b']))
  })
})
