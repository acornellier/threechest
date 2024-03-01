import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { MobComponent } from './Mob.tsx'
import { mapIconScaling } from '../../code/map.ts'
import { useDungeon } from '../../store/hooks.ts'

export function Mobs() {
  const dungeon = useDungeon()
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map))
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) => (
        <MobComponent key={mob.id} mob={mob} iconScaling={iconScaling} />
      ))}
    </>
  )
}
