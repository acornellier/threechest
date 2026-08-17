import type { LatLngLiteral, Map } from 'leaflet'
import type { Point } from '../data/types.ts'

export const mapHeight = 256
export const mapWidth = 384
const maxCoords: Point = [-mapHeight, mapWidth]
export const mapCenter: Point = [maxCoords[0] / 2, maxCoords[1] / 2]
export const mapBounds: [Point, Point] = [[0, 0], maxCoords]

export const mapIconScaling = (map: Map) => 4.4 * 2 ** map.getZoom()

/**
 * Outline stroke widths relative to the zoom they were tuned at, so they scale with the map the
 * way icons do. Anchored to a fixed zoom rather than the initial fit, which varies per dungeon.
 */
const outlineReferenceZoom = 2
export const mapOutlineScaling = (map: Map) => 2 ** (map.getZoom() - outlineReferenceZoom)

export const equalPoints = (point1: Point, point2: Point) =>
  point1[0] === point2[0] && point1[1] === point2[1]

export const latLngToPoint = (latLng: LatLngLiteral): Point => [latLng.lat, latLng.lng]
