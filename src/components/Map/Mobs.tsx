import { useMap, useMapEvent } from 'react-leaflet'
import { useState } from 'react'
import { mapIconScaling } from '../../code/map.ts'
import { useDungeon } from '../../store/hooks.ts'
import { MobSpawn } from './MobSpawn.tsx'

export function Mobs() {
  const dungeon = useDungeon()
  const map = useMap()

  // const prevZoom = useRef(map.getZoom())
  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  useMapEvent('zoom', () => {
    // if (Math.abs(prevZoom.current - map.getZoom()) > 0.3) {
    //   prevZoom.current = map.getZoom()
    //   setIconScaling(mapIconScaling(map))
    // }
  })

  useMapEvent('zoomend', () => {
    setIconScaling(mapIconScaling(map))
  })

  return (
    <>
      {dungeon.mdt.enemies.map((mob) =>
        mob.spawns.map((spawn) => (
          <MobSpawn
            key={`${mob.enemyIndex}-${spawn.spawnIndex}`}
            iconScaling={iconScaling}
            mob={mob}
            spawn={spawn}
          />
        )),
      )}
    </>
  )
}
