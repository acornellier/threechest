import { Note } from './Note.tsx'
import { cssPixels, mapIconScaling, updateIconZoom } from '../../../util/map.ts'

import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useCallback } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useIconScaling } from '../../../util/hooks/useIconScaling.ts'

export function Notes() {
  const map = useMap()
  const route = useRoute()

  const { iconScaling, tempIconScaling } = useIconScaling()

  const zoomEvent = useCallback(() => {
    const newIconScaling = mapIconScaling(map)
    const icons = document.querySelectorAll<HTMLDivElement>('.note-icon')
    for (const icon of icons) {
      updateIconZoom(icon, tempIconScaling.current, newIconScaling)

      const note = icon.querySelector<HTMLDivElement>('.note')
      if (!note) continue

      const curFontSize = cssPixels(note.style.fontSize)
      const fontScale = curFontSize / tempIconScaling.current
      note.style.fontSize = `${fontScale * newIconScaling}px`

      const curBorderWidth = cssPixels(note.style.borderWidth)
      const borderWidthScale = curBorderWidth / tempIconScaling.current
      note.style.borderWidth = `${borderWidthScale * newIconScaling}px`
    }

    tempIconScaling.current = newIconScaling
  }, [map, tempIconScaling])

  useMapEvent('zoom', zoomEvent)

  return route.notes.map((note, index) => (
    <Note key={index} note={note} index={index} iconScaling={iconScaling} />
  ))
}
