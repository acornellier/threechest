import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { mapIconScaling } from '../../code/map.ts'
import { useDungeon } from '../../store/hooks.ts'
import { MobSpawn } from './MobSpawn.tsx'
import { mobSpawnToKey } from '../../code/mobSpawns.ts'

export function Mobs() {
  const dungeon = useDungeon()
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map))
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) =>
        mob.spawns.map((spawn) => (
          <MobSpawn
            key={mobSpawnToKey({ mob, spawn })}
            iconScaling={iconScaling}
            mob={mob}
            spawn={spawn}
          />
        )),
      )}
    </>
  )
}
