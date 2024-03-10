import type { Map } from 'leaflet'
import { Point } from '../data/types.ts'

export const mapIconScaling = (map: Map) => 5 * 2 ** map.getZoom()

export const equalPoints = (point1: Point, point2: Point) =>
  point1[0] === point2[0] && point1[1] === point2[1]
