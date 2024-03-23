import { LatLngLiteral, Map } from 'leaflet'
import { Point } from '../data/types.ts'

export const mapHeight = 256
export const mapWidth = 384
const maxCoords: Point = [-mapHeight, mapWidth]
export const mapCenter: Point = [maxCoords[0] / 2, maxCoords[1] / 2]
export const mapBounds: [Point, Point] = [[0, 0], maxCoords]

export const mapIconScaling = (map: Map) => 4.4 * 2 ** map.getZoom()

export const equalPoints = (point1: Point, point2: Point) =>
  point1[0] === point2[0] && point1[1] === point2[1]

export const latLngToPoint = (latLng: LatLngLiteral): Point => [latLng.lat, latLng.lng]
