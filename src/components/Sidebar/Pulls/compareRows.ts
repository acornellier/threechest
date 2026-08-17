import type { SpawnId } from '../../../data/types.ts'
import type { PullDetailed } from '../../../util/types.ts'
import type { RouteComparison } from '../../../util/compareRoutes.ts'

export interface PullCompareInfo {
  comparePullIndices: number[]
  compareCountCumulative: number | null
  addedSpawns: SpawnId[]
  removedSpawns: SpawnId[]
  movedSpawns: SpawnId[]
  /** Order diverged far enough that the side-by-side cumulative counts aren't comparable. */
  outOfOrder: boolean
}

export interface OrphanRow {
  comparePull: PullDetailed
  comparePullIndex: number
}

const outOfOrderThreshold = 2

export function buildCompareInfo(
  comparison: RouteComparison,
  comparePulls: PullDetailed[],
): PullCompareInfo[] {
  return comparison.pullMatches.map(
    ({ index, comparePullIndices, addedSpawns, removedSpawns, movedSpawns }) => {
      const primary = comparePullIndices[0]

      return {
        comparePullIndices,
        compareCountCumulative:
          primary === undefined ? null : (comparePulls[primary]?.countCumulative ?? null),
        addedSpawns,
        removedSpawns,
        movedSpawns,
        outOfOrder: primary !== undefined && Math.abs(index - primary) > outOfOrderThreshold,
      }
    },
  )
}

/** Orphan compare pulls keyed by the pull index they render after, -1 meaning the top. */
export function buildOrphanRows(comparison: RouteComparison, comparePulls: PullDetailed[]) {
  const rowsByAnchor = new Map<number, OrphanRow[]>()

  for (const { comparePullIndex, afterIndex } of comparison.orphanPulls) {
    const comparePull = comparePulls[comparePullIndex]
    if (!comparePull) continue

    const rows = rowsByAnchor.get(afterIndex) ?? []
    rows.push({ comparePull, comparePullIndex })
    rowsByAnchor.set(afterIndex, rows)
  }

  return rowsByAnchor
}
