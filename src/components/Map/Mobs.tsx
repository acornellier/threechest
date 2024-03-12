import { useMap, useMapEvents } from 'react-leaflet'
import { useMemo, useState } from 'react'
import { mapIconScaling } from '../../util/map.ts'
import { useAppDispatch, useDungeon } from '../../store/hooks.ts'
import { MobSpawn } from './MobSpawn.tsx'
import { boxSelectSpawns } from '../../store/routesReducer.ts'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { setBoxHovering } from '../../store/hoverReducer.ts'

export function Mobs() {
  const dungeon = useDungeon()
  const map = useMap()
  const dispatch = useAppDispatch()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  const mapEvents: LeafletEventHandlerFnMap = useMemo(
    () => ({
      zoomend: () => setIconScaling(mapIconScaling(map)),
      boxselectstart: () => dispatch(setBoxHovering(true)),
      boxselectend: ({ bounds }) => {
        dispatch(setBoxHovering(false))

        const spawnsToAdd = dungeon.mdt.enemies
          .flatMap((mob) => mob.spawns.map((spawn) => ({ mob, spawn })))
          .filter(({ spawn }) => bounds.contains(spawn.pos))

        dispatch(boxSelectSpawns(spawnsToAdd))
      },
    }),
    [dispatch, dungeon, map],
  )

  useMapEvents(mapEvents)

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
