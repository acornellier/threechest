import { useMap, useMapEvent } from 'react-leaflet'
import { useCallback, useState } from 'react'
import { mapIconScaling } from '../map.ts'

/**
 * Icon scaling as of the last completed zoom. Icon *sizes* come from CSS (see IconScaling.tsx), so
 * this is only for the things that still need a number in JS: Leaflet's tooltip/popup anchors.
 */
export function useIconScaling() {
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(() => mapIconScaling(map))

  const zoomEndEvent = useCallback(() => {
    setIconScaling(mapIconScaling(map))
  }, [map])
  useMapEvent('zoomend', zoomEndEvent)

  return iconScaling
}
