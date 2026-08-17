import { useMemo } from 'react'
import { CompareOutline } from './CompareOutline.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import {
  useCompareMode,
  useCompareRoute,
  useRouteComparison,
} from '../../../store/routes/routeHooks.ts'

export function CompareOutlines() {
  const compareRoute = useCompareRoute()
  const comparison = useRouteComparison()
  const mode = useCompareMode()
  const hoveredPull = useHoveredPull()

  const highlighted = useMemo(
    () =>
      hoveredPull === null
        ? null
        : new Set(comparison?.pullMatches[hoveredPull]?.comparePullIndices ?? []),
    [comparison, hoveredPull],
  )

  if (!compareRoute || !comparison || mode !== 'overlay') return null

  return compareRoute.pulls.map((pull, index) =>
    comparison.changedComparePulls.has(index) ? (
      <CompareOutline
        key={`${compareRoute.uid}-${pull.id}`}
        pull={pull}
        index={index}
        isHighlighted={highlighted?.has(index) ?? false}
      />
    ) : null,
  )
}
