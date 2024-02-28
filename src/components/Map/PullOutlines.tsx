import { useRoute } from '../RouteContext/UseRoute.ts'
import { useMemo } from 'react'
import { useMap } from 'react-leaflet'
import makeHull from 'hull.js'
import Offset from 'polygon-offset'
import { PullOutline } from './PullOutline.tsx'

export function PullOutlines() {
  const map = useMap()
  const { route } = useRoute()

  const convexHulls = useMemo(() => {
    return route.pulls.map((pull) => {
      if (pull.mobSpawns.length <= 1) return { pull, hull: [] }

      let hull = makeHull(
        pull.mobSpawns.map((mobSpawn) => [mobSpawn.spawn.pos[0], mobSpawn.spawn.pos[1]]),
        Infinity,
      )

      const arcSegments = Math.max(5, 9 - hull.length + 2 * map.getZoom())
      const margin = 2.8
      hull = new Offset().data(hull).arcSegments(arcSegments).margin(margin)[0]

      return { pull, hull }
    })
  }, [map, route.pulls])

  return convexHulls.map(({ pull, hull }, idx) => {
    if (hull.length <= 1) return null
    return <PullOutline key={idx} pull={pull} hull={hull} idx={idx} />
  })
}
