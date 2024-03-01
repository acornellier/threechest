import { PullOutline } from './PullOutline.tsx'
import { useHoveredPull, useRoute, useSelectedPull } from '../../store/hooks.ts'

export function PullOutlines() {
  const route = useRoute()
  const hoveredPull = useHoveredPull()
  const selectedPull = useSelectedPull()

  return route.pulls.map((pull, index) => (
    <PullOutline
      key={pull.id}
      pullId={pull.id}
      index={index}
      isHovered={hoveredPull === index}
      isSelected={selectedPull === index}
    />
  ))
}
