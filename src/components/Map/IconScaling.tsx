import { useMap, useMapEvents } from 'react-leaflet'
import { useCallback } from 'react'
import { mapIconScaling } from '../../util/map.ts'

/**
 * Publishes the map's current icon scaling as a --icon-scaling CSS variable on the map container.
 * Every map icon sizes itself off that variable (see .scaled-icon in styles.scss), so a zoom is a
 * single property write rather than a pass over every icon on the map.
 */
export function IconScaling() {
  const map = useMap()

  const updateScaling = useCallback(() => {
    map.getContainer().style.setProperty('--icon-scaling', String(mapIconScaling(map)))
  }, [map])

  // Set during render so icons never paint at the fallback size
  updateScaling()

  useMapEvents({ zoom: updateScaling, zoomend: updateScaling, viewreset: updateScaling })

  return null
}
