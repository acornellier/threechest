import { PointOfInterest } from './PointOfInterest.tsx'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useIconScaling } from '../../../util/hooks/useIconScaling.ts'

export function PointsOfInterest() {
  const dungeon = useDungeon()

  const iconScaling = useIconScaling()

  return dungeon.mdt.pois.map((poi, index) => (
    <PointOfInterest key={index} poi={poi} index={index} iconScaling={iconScaling} />
  ))
}
