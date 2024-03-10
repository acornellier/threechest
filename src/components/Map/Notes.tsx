import { useRoute } from '../../store/hooks.ts'
import { Note } from './Note.tsx'
import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { mapIconScaling } from '../../code/map.ts'

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
