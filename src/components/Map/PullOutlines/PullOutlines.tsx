import { PullOutline } from './PullOutline.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import { useRoute, useSelectedPull } from '../../../store/routes/routeHooks.ts'
import { useRootSelector } from '../../../store/storeUtil.ts'
import { selectIsLive } from '../../../store/reducers/mapReducer.ts'

export function PullOutlines() {
  const route = useRoute()
  const selectedPull = useSelectedPull()
  const hoveredPull = useHoveredPull()
  const isLive = useRootSelector(selectIsLive)

  return route.pulls.map((pull, index) => (
    <PullOutline
      key={pull.id}
      pull={pull}
      index={index}
      isHovered={hoveredPull === index}
      isSelected={selectedPull === index}
      faded={isLive && index < selectedPull}
    />
  ))
}
