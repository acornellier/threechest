import type { SpawnId } from '../data/types.ts'
import type { Pull } from './types.ts'

export type PullMatch = {
  index: number
  /** Compare-route pull indices covering this pull's spawns, most-covered first. */
  comparePullIndices: number[]
  /** In this pull, absent from the compare route entirely. */
  addedSpawns: SpawnId[]
  /** In the compare pulls matched to this pull, absent from this route entirely. */
  removedSpawns: SpawnId[]
  /** In both routes, but the compare route pulls them elsewhere. */
  movedSpawns: SpawnId[]
  isIdentical: boolean
}

export type OrphanPull = {
  comparePullIndex: number
  /** Render after this pull index, or at the top when -1. */
  afterIndex: number
  spawns: SpawnId[]
}

export type RouteComparison = {
  pullMatches: PullMatch[]
  /** Compare pulls no pull of this route claims. */
  orphanPulls: OrphanPull[]
  /** Compare pull indices with no exact counterpart, so only these need ghost hulls. */
  changedComparePulls: Set<number>
  onlyInRoute: Set<SpawnId>
  onlyInCompare: Set<SpawnId>
}

function spawnToPullIndex(pulls: Pull[]) {
  const pullIndices = new Map<SpawnId, number>()
  pulls.forEach((pull, index) => {
    for (const spawnId of pull.spawns) {
      pullIndices.set(spawnId, index)
    }
  })
  return pullIndices
}

/** Pull indices of the other route covering these spawns, most-covered first. */
function coveringPulls(spawns: SpawnId[], otherPullIndices: Map<SpawnId, number>) {
  const counts = new Map<number, number>()
  for (const spawnId of spawns) {
    const index = otherPullIndices.get(spawnId)
    if (index === undefined) continue
    counts.set(index, (counts.get(index) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([indexA, countA], [indexB, countB]) => countB - countA || indexA - indexB)
    .map(([index]) => index)
}

const onlyIn = (pullIndices: Map<SpawnId, number>, otherPullIndices: Map<SpawnId, number>) =>
  new Set([...pullIndices.keys()].filter((spawnId) => !otherPullIndices.has(spawnId)))

export function compareRoutes(pulls: Pull[], comparePulls: Pull[]): RouteComparison {
  const pullIndices = spawnToPullIndex(pulls)
  const comparePullIndices = spawnToPullIndex(comparePulls)

  const claimants = new Map<number, number>()
  comparePulls.forEach((comparePull, compareIndex) => {
    const claimant = coveringPulls(comparePull.spawns, pullIndices)[0]
    if (claimant !== undefined) claimants.set(compareIndex, claimant)
  })

  const removedByPull = new Map<number, SpawnId[]>()
  comparePulls.forEach((comparePull, compareIndex) => {
    const claimant = claimants.get(compareIndex)
    if (claimant === undefined) return

    const removed = comparePull.spawns.filter((spawnId) => !pullIndices.has(spawnId))
    if (!removed.length) return

    removedByPull.set(claimant, (removedByPull.get(claimant) ?? []).concat(removed))
  })

  const identicalComparePulls = new Set<number>()

  const pullMatches = pulls.map<PullMatch>((pull, index) => {
    const covering = coveringPulls(pull.spawns, comparePullIndices)
    const primary = covering[0]
    const removedSpawns = removedByPull.get(index) ?? []

    const isIdentical =
      covering.length === 1 &&
      comparePulls[primary!]!.spawns.length === pull.spawns.length &&
      pull.spawns.every((spawnId) => comparePullIndices.get(spawnId) === primary)
    if (isIdentical) identicalComparePulls.add(primary!)

    return {
      index,
      comparePullIndices: covering,
      addedSpawns: pull.spawns.filter((spawnId) => !comparePullIndices.has(spawnId)),
      removedSpawns,
      movedSpawns: pull.spawns.filter((spawnId) => {
        const compareIndex = comparePullIndices.get(spawnId)
        return compareIndex !== undefined && compareIndex !== primary
      }),
      isIdentical,
    }
  })

  const orphanPulls: OrphanPull[] = []
  const changedComparePulls = new Set<number>()

  comparePulls.forEach((comparePull, compareIndex) => {
    if (!identicalComparePulls.has(compareIndex)) changedComparePulls.add(compareIndex)
    if (claimants.has(compareIndex)) return

    let afterIndex = -1
    for (let previous = compareIndex - 1; previous >= 0; previous--) {
      const claimant = claimants.get(previous)
      if (claimant !== undefined) {
        afterIndex = claimant
        break
      }
    }

    orphanPulls.push({ comparePullIndex: compareIndex, afterIndex, spawns: comparePull.spawns })
  })

  return {
    pullMatches,
    orphanPulls,
    changedComparePulls,
    onlyInRoute: onlyIn(pullIndices, comparePullIndices),
    onlyInCompare: onlyIn(comparePullIndices, pullIndices),
  }
}
