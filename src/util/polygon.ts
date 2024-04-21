import type { Point } from '../data/types.ts'
import { average } from './nodash.ts'
import { makeConvexHull } from './hull.ts'

export const averagePoint = (points: Point[]): Point => [
  average(points.map((point) => point[0])),
  average(points.map((point) => point[1])),
]

export function polygonCenter(points: Point[]): Point {
  if (points.length === 1) return points[0]!

  const hull = makeConvexHull(points.map((pos) => ({ pos }))).map(({ pos }) => pos)

  let area = 0
  let y = 0
  let x = 0

  // polygon centroid algorithm;
  for (let i = 0; i < hull.length; ++i) {
    const p1 = hull[i]!
    const p2 = hull[i === hull.length - 1 ? 0 : i + 1]!
    const f = p1[1] * p2[0] - p2[1] * p1[0]

    area += f
    y += (p1[0] + p2[0]) * f
    x += (p1[1] + p2[1]) * f
  }

  let center: Point
  if (area === 0) {
    // Polygon is so small that all points are on same pixel.
    center = hull[0]!
  } else {
    area /= 2
    center = [y / (6 * area), x / (6 * area)]
  }

  return center
}
