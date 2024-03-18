import { PullOutline } from './PullOutline.tsx'
import { useHoveredPull, useRoute, useSelectedPull } from '../../store/hooks.ts'

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
