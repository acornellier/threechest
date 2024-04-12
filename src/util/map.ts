import type { LatLngLiteral, Map } from 'leaflet'
import type { Point } from '../data/types.ts'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'

export const mapHeight = 256
export const mapWidth = 384
const maxCoords: Point = [-mapHeight, mapWidth]
export const mapCenter: Point = [maxCoords[0] / 2, maxCoords[1] / 2]
export const mapBounds: [Point, Point] = [[0, 0], maxCoords]

export const mapIconScaling = (map: Map) => 4.4 * 2 ** map.getZoom()

export const equalPoints = (point1: Point, point2: Point) =>
  point1[0] === point2[0] && point1[1] === point2[1]

export const latLngToPoint = (latLng: LatLngLiteral): Point => [latLng.lat, latLng.lng]

export const cssPixels = (str: string) => Number(str.substring(0, str.length - 2))

export function updateIconZoom(icon: HTMLDivElement, prevScaling: number, newScaling: number) {
  const curSize = cssPixels(icon.style.height)
  const iconScale = curSize / prevScaling
  const newSize = iconScale * newScaling
  icon.style.height = `${newSize}px`
  icon.style.width = `${newSize}px`
  icon.style.marginLeft = `-${newSize / 2}px`
  icon.style.marginTop = `-${newSize / 2}px`
}

export function useIconScaling() {
  const map = useMap()

  const [iconScaling, setIconScaling] = useState(mapIconScaling(map))
  const tempIconScaling = useRef(mapIconScaling(map))
  useEffect(() => {
    tempIconScaling.current = iconScaling
  }, [iconScaling])

  const zoomEndEvent = useCallback(() => {
    setIconScaling(mapIconScaling(map))
  }, [map])
  useMapEvent('zoomend', zoomEndEvent)

  return { iconScaling, tempIconScaling }
}
