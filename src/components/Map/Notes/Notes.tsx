import { Note } from './Note.tsx'

import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useIconScaling } from '../../../util/hooks/useIconScaling.ts'

export function Notes() {
  const route = useRoute()

  const iconScaling = useIconScaling()

  return route.notes.map((note, index) => (
    <Note key={index} note={note} index={index} iconScaling={iconScaling} />
  ))
}
