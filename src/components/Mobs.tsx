import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { Dungeon } from '../data/types.ts'
import { Mob } from './Mob.tsx'
import { mobSpawnToKey } from '../code/stuff.ts'

type Props = {
  dungeon: Dungeon
}

export function Mobs({ dungeon }: Props) {
  const map = useMap()

  const toIconSize = () => 5 * 2 ** map.getZoom()

  const [iconSize, setIconSize] = useState(toIconSize())

  useMapEvent('zoom', () => {
    setIconSize(toIconSize())
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) =>
        mob.spawns.map((spawn) => (
          <Mob key={mobSpawnToKey({ mob, spawn })} iconScaling={iconSize} mob={mob} spawn={spawn} />
        )),
      )}
    </>
  )
}
