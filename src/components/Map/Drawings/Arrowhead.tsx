import type { Point } from '../../../data/types.ts'
import { Polygon } from 'react-leaflet'
import type { Drawing as DrawingType } from '../../../util/types.ts'

const arrowheadPositions: Point[] = [
  [-1, 0],
  [0, -1.5],
  [1, 0],
]

interface Props {
  drawing: DrawingType
  hidden: boolean
}

export function Arrowhead({ drawing, hidden }: Props) {
  const rotation = drawing.arrowRotation
  if (rotation === undefined) return null

  const lastLine = drawing.positions[drawing.positions.length - 1]
  if (!lastLine) return null

  const lastPoint = lastLine[lastLine.length - 1]
  if (!lastPoint) return null

  const positions = arrowheadPositions.map((point) => {
    const x = point[1]
    const y = point[0]
    const xRotated = x * Math.cos(rotation) - y * Math.sin(rotation)
    const yRotated = y * Math.cos(rotation) + x * Math.sin(rotation)
    const xFinal = (xRotated * drawing.weight) / 5 + lastPoint[1]
    const yFinal = (yRotated * drawing.weight) / 5 + lastPoint[0]
    return [yFinal, xFinal] as [number, number]
  })

  return (
    <Polygon
      key={`${hidden}`}
      className="fade-in-map-object"
      positions={positions}
      color={drawing.color}
      fillOpacity={hidden ? 0 : 1}
      opacity={hidden ? 0 : 1}
      interactive={false}
    />
  )
}
