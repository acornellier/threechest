import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { Dungeon } from '../../data/types.ts'
import { Mob } from './Mob.tsx'
import { mapIconSize } from '../../code/map.ts'

type Props = {
  dungeon: Dungeon
}

export function Mobs({ dungeon }: Props) {
  const map = useMap()

  const [iconSize, setIconSize] = useState(mapIconSize(map))

  useMapEvent('zoom', () => {
    setIconSize(mapIconSize(map))
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) => (
        <Mob key={mob.id} mob={mob} iconSize={iconSize} />
      ))}
    </>
  )
}
