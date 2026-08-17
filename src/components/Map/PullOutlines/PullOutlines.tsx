import { PullOutline } from './PullOutline.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import {
  useCompareMode,
  useCompareRoute,
  useRoute,
  useSelectedPull,
} from '../../../store/routes/routeHooks.ts'
import { useRootSelector } from '../../../store/storeUtil.ts'
import { selectIsLive } from '../../../store/reducers/mapReducer.ts'

export function PullOutlines() {
  const route = useRoute()
  const selectedPull = useSelectedPull()
  const hoveredPull = useHoveredPull()
  const isLive = useRootSelector(selectIsLive)
  const compareRoute = useCompareRoute()
  const compareMode = useCompareMode()

  // Diff mode is about membership, not grouping, so pull colors would only add noise.
  const hiddenForDiff = !!compareRoute && compareMode === 'diff'

  return route.pulls.map((pull, index) => (
    <PullOutline
      key={pull.id}
      pull={pull}
      index={index}
      isHovered={hoveredPull === index}
      isSelected={selectedPull === index}
      faded={isLive && index < selectedPull}
      forceHidden={hiddenForDiff}
    />
  ))
}
