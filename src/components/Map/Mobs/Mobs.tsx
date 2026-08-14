import { useMapEvents } from 'react-leaflet'
import { useMemo } from 'react'
import { MobSpawnWrapper } from './MobSpawn.tsx'
import {
  boxSelectEnd,
  boxSelectSpawns,
  boxSelectStart,
} from '../../../store/routes/routesReducer.ts'
import type { LeafletEventHandlerFnMap } from 'leaflet'
import { setBoxHovering } from '../../../store/reducers/hoverReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { Delayed } from '../../Common/Delayed.tsx'
import { useKeyHeld } from '../../../util/hooks/useKeyHeld.ts'

export function Mobs() {
  const dungeon = useDungeon()
  const dispatch = useAppDispatch()

  const isCtrlKeyDown = useKeyHeld('Control')
  const isAltKeyDown = useKeyHeld('Alt')

  const mapEvents: LeafletEventHandlerFnMap = useMemo(() => {
    return {
      boxselectstart: () => {
        dispatch(setBoxHovering(true))
        dispatch(boxSelectStart())
      },
      boxselectmove({ bounds, inverse }) {
        const spawns = dungeon.mobSpawnsList
          .filter(({ spawn }) => bounds.contains(spawn.pos))
          .map(({ spawn }) => spawn.id)

        dispatch(boxSelectSpawns({ spawns, inverse }))
      },
      boxselectend() {
        dispatch(setBoxHovering(false))
        dispatch(boxSelectEnd())
      },
    }
  }, [dispatch, dungeon.mobSpawnsList])

  useMapEvents(mapEvents)

  // Delay all mobs by 50ms for performance
  return (
    <Delayed delay={50}>
      {dungeon.mobSpawnsList.map((mobSpawn) => (
        <MobSpawnWrapper
          key={mobSpawn.spawn.id}
          mobSpawn={mobSpawn}
          isCtrlKeyDown={isCtrlKeyDown}
          isAltKeyDown={isAltKeyDown}
        />
      ))}
    </Delayed>
  )
}
