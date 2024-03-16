import { Dungeon, Point } from '../../data/types.ts'
import { LatLngBoundsExpression } from 'leaflet'
import { useMap } from 'react-leaflet'
import { useDungeon } from '../../store/hooks.ts'
import { useEffect } from 'react'
import { mapBounds } from '../../util/map.ts'

function getAdjustedBounds(dungeon: Dungeon): LatLngBoundsExpression {
  const defaultBounds: [Point, Point] = dungeon.defaultBounds ?? mapBounds

  const topbarOffset = 10
  const top = Math.min(0, defaultBounds[0][0] + topbarOffset)
  const left = defaultBounds[0][1]
  const bottom = defaultBounds[1][0]
  const sidebarOffset = 50
  const right = defaultBounds[1][1] + sidebarOffset

  return [
    [top, left],
    [bottom, right],
  ]
}

export function MapInitialZoom() {
  const map = useMap()
  const dungeon = useDungeon()

  useEffect(() => {
    const bounds = getAdjustedBounds(dungeon)
    map.fitBounds(bounds, {
      animate: false,
    })
  }, [map, dungeon])

  return null
}
