import { useMap, useMapEvent } from 'react-leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mapIconScaling } from '../map.ts'

export function useIconScaling() {
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))
  const tempIconScaling = useRef(mapIconScaling(map))
  useEffect(() => {
    tempIconScaling.current = iconScaling
  }, [iconScaling])

  const zoomEndEvent = useCallback(() => {
    setIconScaling(mapIconScaling(map))
  }, [map])
  useMapEvent('zoomend', zoomEndEvent)

  return { iconScaling, tempIconScaling }
}
