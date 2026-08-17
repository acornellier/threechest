import { useMap } from 'react-leaflet'
import { useCallback, useSyncExternalStore } from 'react'
import { mapOutlineScaling } from '../map.ts'

/**
 * Stroke scaling as of the last completed zoom. Leaflet transforms the whole SVG pane during a
 * zoom, so strokes already scale mid-gesture; this only corrects them once it settles.
 *
 * useSyncExternalStore rather than state, because zoom ends from a timeout in SmoothWheelZoom.
 * A plain setState there lands on the default lane and React may not render until a later
 * macrotask, letting the browser paint one frame at the old width.
 */
export function useOutlineScaling() {
  const map = useMap()

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      map.on('zoomend viewreset', onStoreChange)
      return () => {
        map.off('zoomend viewreset', onStoreChange)
      }
    },
    [map],
  )

  const getSnapshot = useCallback(() => mapOutlineScaling(map), [map])

  return useSyncExternalStore(subscribe, getSnapshot)
}
