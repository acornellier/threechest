import { useEffect, useMemo, useRef } from 'react'
import { useDungeon, useRoute, useSelectedPull } from '../../store/routes/routeHooks.ts'
import { useMap } from 'react-leaflet'
import type { Point } from '../../data/types.ts'
import { augmentPulls } from '../Sidebar/Pulls/augmentPulls.ts'
import { LivePanel, livePanelRight } from './LivePanel.tsx'
import { LivePlayhead, livePlayheadBottom } from './LivePlayhead.tsx'
import { useWindowSize } from 'usehooks-ts'
import { mobScale } from '../../util/mobSpawns.ts'
import { mobScaleToRadius } from '../../util/hull.ts'

export function LiveController() {
  const map = useMap()
  const route = useRoute()
  const dungeon = useDungeon()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])
  const selectedPull = useSelectedPull()
  const lastSelectedPull = useRef<number>()
  const { height: windowHeight, width: windowWidth } = useWindowSize()

  const prevPull = pullsDetailed[selectedPull - 1]
  const pull = pullsDetailed[selectedPull]!

  useEffect(() => {
    if (!pull.spawns.length) return
    if (lastSelectedPull.current === selectedPull) return

    let [top, left, bottom, right] = [-Infinity, Infinity, 0, 0]

    for (const spawnId of pull.spawns) {
      const mobSpawn = dungeon.mobSpawns[spawnId]!
      const radius = mobScaleToRadius(mobScale(mobSpawn))
      const [y, x] = mobSpawn.spawn.pos

      top = Math.max(top, y + radius)
      left = Math.min(left, x - radius)
      bottom = Math.min(bottom, y - radius)
      right = Math.max(right, x + radius)
    }

    const pullWidthLeaflet = Math.abs(right - left)
    const pullHeightLeaflet = Math.abs(top - bottom)
    const pullAspect = pullWidthLeaflet / pullHeightLeaflet

    const viewportHeight = windowHeight - livePlayheadBottom
    const viewportWidth = windowWidth - livePanelRight
    const viewportAspect = viewportWidth / viewportHeight
    const constrainedVertically = pullAspect < viewportAspect

    const leafletUnitsPerPixel = constrainedVertically
      ? pullHeightLeaflet / viewportHeight
      : pullWidthLeaflet / viewportWidth

    const panelWidthLeaflet = livePanelRight * leafletUnitsPerPixel
    const windowWidthLeaflet = windowWidth * leafletUnitsPerPixel
    const panelToPullGap = windowWidthLeaflet / 2 - pullWidthLeaflet / 2 - panelWidthLeaflet
    const marginRight = panelToPullGap > 0 ? 0 : -panelToPullGap * 2

    const playheadHeightLeaflet = livePlayheadBottom * leafletUnitsPerPixel
    const windowHeightLeaflet = windowHeight * leafletUnitsPerPixel
    const playheadToPullGap =
      windowHeightLeaflet / 2 - pullHeightLeaflet / 2 - playheadHeightLeaflet
    const marginBottom = playheadToPullGap > 0 ? 0 : playheadToPullGap * 2

    const bounds: [Point, Point] = [
      [top, left],
      [bottom + marginBottom, right + marginRight],
    ]

    const padding = 150
    map.flyToBounds(bounds, { maxZoom: 3.6, padding: [padding, padding] })

    lastSelectedPull.current = selectedPull
  }, [dungeon.mobSpawns, lastSelectedPull, map, pull, selectedPull, windowHeight, windowWidth])

  return (
    <>
      <LivePanel prevPull={prevPull} pull={pull} pullsDetailed={pullsDetailed} />
      <LivePlayhead />
    </>
  )
}
