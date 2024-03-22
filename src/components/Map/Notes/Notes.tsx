import { Note } from './Note.tsx'
import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { mapIconScaling } from '../../../util/map.ts'

import { useRoute } from '../../../store/routes/routeHooks.ts'

export function Notes() {
  const map = useMap()
  const route = useRoute()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map))
  })

  return route.notes.map((note, index) => (
    <Note key={index} note={note} noteIndex={index} iconScaling={iconScaling} />
  ))
}
