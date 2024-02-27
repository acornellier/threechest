import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { Dungeon } from '../../data/types.ts'
import { Mob } from './Mob.tsx'
import { mapIconScaling } from '../../code/map.ts'

type Props = {
  dungeon: Dungeon
}

export function Mobs({ dungeon }: Props) {
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoom', () => {
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
