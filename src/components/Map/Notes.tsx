import { useDungeon, useRoute } from '../../store/hooks.ts'
import { Note } from './Note.tsx'
import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { mapIconScaling } from '../../util/map.ts'

export function Notes() {
  const dungeon = useDungeon()
  const map = useMap()
  const route = useRoute()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map, dungeon))

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map, dungeon))
  })

  return route.notes.map((note, index) => (
    <Note key={index} note={note} noteIndex={index} iconScaling={iconScaling} />
  ))
}
