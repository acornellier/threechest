import { useMap, useMapEvents } from 'react-leaflet'
import { useMemo, useState } from 'react'
import { mapIconScaling } from '../../util/map.ts'
import { useAppDispatch, useDungeon } from '../../store/hooks.ts'
import { MobSpawnWrapper } from './MobSpawn.tsx'
import { boxSelectSpawns, commitBoxSelect } from '../../store/routes/routesReducer.ts'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { setBoxHovering } from '../../store/reducers/hoverReducer.ts'

export function Mobs() {
  const dungeon = useDungeon()
  const map = useMap()
  const dispatch = useAppDispatch()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))

  const mapEvents: LeafletEventHandlerFnMap = useMemo(() => {
    return {
      zoomend: () => setIconScaling(mapIconScaling(map)),
      boxselectstart: () => dispatch(setBoxHovering(true)),
      boxselectmove({ bounds }) {
        const spawns = Object.values(dungeon.mobSpawns)
          .filter(({ spawn }) => bounds.contains(spawn.pos))
          .map(({ spawn }) => spawn.id)

        dispatch(boxSelectSpawns(spawns))
      },
      boxselectend() {
        dispatch(setBoxHovering(false))
        dispatch(commitBoxSelect())
      },
    }
  }, [dispatch, dungeon, map])

  useMapEvents(mapEvents)

  return (
    <>
      {Object.values(dungeon.mobSpawns).map((mobSpawn) => (
        <MobSpawnWrapper key={mobSpawn.spawn.id} iconScaling={iconScaling} mobSpawn={mobSpawn} />
      ))}
    </>
  )
}
