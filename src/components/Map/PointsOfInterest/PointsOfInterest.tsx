import { PointOfInterest } from './PointOfInterest.tsx'
import { mapIconScaling } from '../../../util/map.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useCallback } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useIconScaling } from '../../../util/hooks/useIconScaling.ts'

export function PointsOfInterest() {
  const map = useMap()
  const dungeon = useDungeon()

  const { iconScaling, tempIconScaling } = useIconScaling()

  const zoomEvent = useCallback(() => {
    const newIconScaling = mapIconScaling(map)
    const icons = document.querySelectorAll<HTMLDivElement>('.poi-icon')
    for (const icon of icons) {
      const image = icon.querySelector<HTMLDivElement>('img')
      if (!image) continue

      image.style.width = `${newIconScaling}px`
      image.style.height = `${newIconScaling}px`
    }

    tempIconScaling.current = newIconScaling
  }, [map, tempIconScaling])

  useMapEvent('zoom', zoomEvent)

  return dungeon.mdt.pois.map((poi, index) => (
    <PointOfInterest key={index} poi={poi} index={index} iconScaling={iconScaling} />
  ))
}
