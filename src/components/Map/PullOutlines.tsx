import { useRoute } from '../RouteContext/UseRoute.ts'
import { useMemo, useState } from 'react'
import { Polygon, useMap, useMapEvent } from 'react-leaflet'
import makeHull from 'hull.js'
import Offset from 'polygon-offset'

export function PullOutlines() {
  const map = useMap()
  const { route } = useRoute()

  console.time()
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
  console.timeEnd()

  return convexHulls.map(({ pull, hull }, idx) => (
    <Polygon key={idx} positions={hull} color={pull.color} />
  ))
}
