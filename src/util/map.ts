import type { LatLng, Map } from 'leaflet'
import { Dungeon, Point } from '../data/types.ts'

export const mapIconScaling = (map: Map, dungeon: Dungeon) =>
  5 * 2 ** map.getZoom() * (dungeon.iconScaling ?? 1)

export const equalPoints = (point1: Point, point2: Point) =>
  point1[0] === point2[0] && point1[1] === point2[1]

export const latLngToPoint = (latLng: LatLng): Point => [latLng.lat, latLng.lng]
