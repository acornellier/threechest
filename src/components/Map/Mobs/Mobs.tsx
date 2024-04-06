import { useMap, useMapEvents } from 'react-leaflet'
import { useCallback, useMemo, useRef } from 'react'
import { cssPixels, mapIconScaling, updateIconZoom, useIconScaling } from '../../../util/map.ts'
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
  const map = useMap()
  const dispatch = useAppDispatch()

  const lastZoom = useRef(map.getZoom())
  const { tempIconScaling } = useIconScaling()

  const isCtrlKeyDown = useKeyHeld('Control')
  const isAltKeyDown = useKeyHeld('Alt')

  const zoomEvent = useCallback(() => {
    const curZoom = map.getZoom()
    const diff = Math.abs(curZoom - lastZoom.current)
    const minChange = (5.5 - map.getZoom()) / 30
    if (diff < minChange) return

    lastZoom.current = curZoom
    const newIconScaling = mapIconScaling(map)
    const icons = document.querySelectorAll<HTMLDivElement>('.mob-spawn-icon')
    for (const icon of icons) {
      updateIconZoom(icon, tempIconScaling.current, newIconScaling)

      const borders = icon.querySelectorAll<HTMLDivElement>('.mob-border')
      for (const border of borders) {
        const curWidth = cssPixels(border.style.borderWidth)
        const borderScale = curWidth / tempIconScaling.current
        border.style.borderWidth = `${borderScale * newIconScaling}px`
      }
    }

    const bossMakers = document.querySelectorAll<HTMLDivElement>('.boss-marker')
    for (const bossMarker of bossMakers) {
      updateIconZoom(bossMarker, tempIconScaling.current, newIconScaling)
    }

    tempIconScaling.current = newIconScaling
  }, [map, tempIconScaling])

  const mapEvents: LeafletEventHandlerFnMap = useMemo(() => {
    return {
      zoom: zoomEvent,
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
  }, [dispatch, dungeon.mobSpawnsList, zoomEvent])

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
