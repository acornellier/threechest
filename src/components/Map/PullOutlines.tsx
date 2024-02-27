import { useRoute } from '../RouteContext/UseRoute.ts'
import { useEffect, useMemo, useState } from 'react'
import { Polygon, useMap } from 'react-leaflet'
import makeHull from 'hull.js'
import Offset from 'polygon-offset'

export function PullOutlines() {
  const map = useMap()
  const { route } = useRoute()

  const [foo, setFoo] = useState(0)

  useEffect(() => {
    setFoo((foo) => foo + 1000)
  }, [route.selectedPull, route.hoveredPull])

  const convexHulls = useMemo(() => {
    return route.pulls.map((pull) => {
      if (pull.mobSpawns.length <= 1) return { pull, hull: [] }

      let hull = makeHull(
        pull.mobSpawns.map((mobSpawn) => [mobSpawn.spawn.pos[0], mobSpawn.spawn.pos[1]]),
        Infinity,
      )

      const arcSegments = Math.max(5, 9 - hull.length + 2 * map.getZoom())
      const margin = 2.8
      hull = new Offset().data(hull).arcSegments(arcSegments).margin(margin)

      return { pull, hull }
    })
  }, [map, route.pulls])

  return convexHulls.map(({ pull, hull }, idx) => {
    const isHovered = route.hoveredPull === idx
    const isSelected = route.selectedPull === idx
    return (
      <Polygon
        key={idx + foo}
        positions={hull}
        color={pull.color}
        fillOpacity={0}
        opacity={isSelected || isHovered ? 1 : 0.6}
        weight={isSelected ? 5 : isHovered ? 4 : 3}
      />
    )
  })
}
