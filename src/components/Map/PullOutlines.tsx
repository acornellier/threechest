import { useRoute } from '../RouteContext/UseRoute.ts'
import { useMemo } from 'react'
import { Map } from 'leaflet'
import { Circle, useMap } from 'react-leaflet'
import makeHull from 'hull.js'
import Offset from 'polygon-offset'
import { PullOutline } from './PullOutline.tsx'
import { Pull } from '../../code/types.ts'

interface PullHull {
  pull: Pull
  hull?: Array<[number, number]>
  circle?: { center: [number, number]; radius: number }
}

function createOutline(pull: Pull, map: Map): PullHull {
  if (pull.mobSpawns.length <= 0) return { pull }

  if (pull.mobSpawns.length === 1) {
    return {
      pull,
      hull: [],
      circle: { center: pull.mobSpawns[0].spawn.pos, radius: 3 },
    }
  }

  let hull = makeHull(
    pull.mobSpawns.map((mobSpawn) => mobSpawn.spawn.pos),
    Infinity,
  )

  const arcSegments = Math.max(5, 9 - hull.length + 2 * map.getZoom())
  const margin = 2.8
  hull = new Offset().data(hull).arcSegments(arcSegments).margin(margin)[0]

  return { pull, hull }
}

export function PullOutlines() {
  const map = useMap()
  const { route } = useRoute()

  const pullOutlines = useMemo(
    () => route.pulls.map((pull) => createOutline(pull, map)),
    [map, route.pulls],
  )

  return pullOutlines.map(({ pull, hull, circle }, idx) => {
    return circle ? (
      <Circle center={circle.center} radius={circle.radius} color={pull.color} />
    ) : hull ? (
      <PullOutline key={idx} pull={pull} hull={hull} idx={idx} />
    ) : null
  })
}
