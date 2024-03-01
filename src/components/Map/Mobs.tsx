import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { Mob } from './Mob.tsx'
import { mapIconScaling } from '../../code/map.ts'
import { Dungeon } from '../../data/types.ts'

type Props = {
  dungeon: Dungeon
}

export function Mobs({ dungeon }: Props) {
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map))
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) => (
        <Mob key={mob.id} mob={mob} iconScaling={iconScaling} />
      ))}
    </>
  )
}
