import type { MobSpawn, Point } from '../../../data/types.ts'
import type { PolygonVertexScaled } from '../../../util/hull.ts'
import { expandPolygon, makeConvexHull, mobScaleToRadius } from '../../../util/hull.ts'
import { mobScale } from '../../../util/mobSpawns.ts'

export interface Outline {
  hull?: Array<Point>
  circle?: { center: Point; radius: number }
}

export function createOutline(mobSpawns: MobSpawn[]): Outline {
  if (mobSpawns.length <= 0) return {}

  if (mobSpawns.length === 1) {
    const mobSpawn = mobSpawns[0]!
    const scale = mobScale(mobSpawn)
    return {
      circle: {
        center: mobSpawn.spawn.pos,
        radius: mobScaleToRadius(scale),
      },
    }
  }

  const vertices: PolygonVertexScaled[] = mobSpawns.map((mobSpawn) => ({
    pos: mobSpawn.spawn.pos,
    scale: mobScale(mobSpawn),
  }))

  let hull = makeConvexHull(vertices)
  hull = expandPolygon(hull, 10)
  hull = makeConvexHull(hull)

  return { hull: hull.map((m) => m.pos) }
}
