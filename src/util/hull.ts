import type { Point } from '../data/types.ts'

export interface PolygonVertex {
  pos: Point
}

export interface PolygonVertexScaled extends PolygonVertex {
  scale: number
}

const iconSizeMagicScaling = 2.8 // no idea lol

export const mobScaleToRadius = (scale: number) => scale * iconSizeMagicScaling

function isStrictlyLowerLeft(point1: Point, point2: Point): boolean {
  return (
    point1[1] < point2[1] || // Compare y-coordinates
    (point1[1] === point2[1] && point1[0] < point2[0]) // If y-coordinates are equal, compare x-coordinates
  )
}

function isLeftOfLineSegment(origin: Point, point1: Point, point2: Point): boolean {
  const vector1 = [point1[0] - origin[0], point1[1] - origin[1]] as const
  const vector2 = [point2[0] - origin[0], point2[1] - origin[1]] as const
  const crossProduct = vector1[0] * vector2[1] - vector1[1] * vector2[0]
  return crossProduct > 0
}

export function makeConvexHull<T extends PolygonVertex>(vertices: T[]): T[] {
  if (vertices.length === 0) return []

  const points = vertices.map((vertex) => vertex.pos)
  // Find the leftmost and lowermost point as the starting point
  let lowerLeftIndex = 0
  for (let i = 1; i < points.length; i++) {
    if (isStrictlyLowerLeft(points[i]!, points[lowerLeftIndex]!)) {
      lowerLeftIndex = i
    }
  }

  const hullIndexes: number[] = []

  let loopCount = 0 // avoid infinite loops
  let startingPointIndex = lowerLeftIndex
  let nextPointIndex = 0
  while (nextPointIndex !== hullIndexes[0] && loopCount < 100) {
    hullIndexes.push(startingPointIndex)

    nextPointIndex = 0
    for (let i = 0; i < points.length; i++) {
      if (
        i !== startingPointIndex &&
        (startingPointIndex === nextPointIndex ||
          isLeftOfLineSegment(points[startingPointIndex]!, points[nextPointIndex]!, points[i]!))
      ) {
        nextPointIndex = i
      }
    }

    startingPointIndex = nextPointIndex
    loopCount++
  }

  return hullIndexes.map((index) => vertices[index]!)
}

export function expandPolygon(
  vertices: PolygonVertexScaled[],
  numCirclePoints: number,
): PolygonVertexScaled[] {
  const expandedPolygon: PolygonVertexScaled[] = []

  for (const { pos, scale } of vertices) {
    const x = pos[0]
    const y = pos[1]
    const radius = mobScaleToRadius(scale)
    const adjustedNumPoints = Math.max(1, Math.floor(numCirclePoints * radius))

    for (let i = 1; i <= adjustedNumPoints; i++) {
      const angle = ((2 * Math.PI) / adjustedNumPoints) * i
      const cx = x + radius * Math.cos(angle)
      const cy = y + radius * Math.sin(angle)
      expandedPolygon.push({ pos: [cx, cy], scale })
    }
  }

  return expandedPolygon
}
