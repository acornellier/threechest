import { PullOutline } from './PullOutline.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import { useRoute, useSelectedPull } from '../../../store/routes/routeHooks.ts'

export function PullOutlines() {
  const route = useRoute()
  const selectedPull = useSelectedPull()
  const hoveredPull = useHoveredPull()

  return route.pulls.map((pull, index) => (
    <PullOutline
      key={pull.id}
      pull={pull}
      index={index}
      isHovered={hoveredPull === index}
      isSelected={selectedPull === index}
    />
  ))
}
