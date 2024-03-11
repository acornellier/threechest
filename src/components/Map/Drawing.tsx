import { memo } from 'react'
import { Drawing as DrawingType } from '../../util/types.ts'
import { Polygon, Polyline } from 'react-leaflet'
import { Point } from '../../data/types.ts'

interface Props {
  drawing: DrawingType
}

const arrowheadPositions: Point[] = [
  [-1, 0],
  [0, -1.5],
  [1, 0],
]

function Arrowhead({ drawing }: Props) {
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

  return <Polygon positions={positions} color={drawing.color} fillOpacity={1} />
}

function DrawingComponent({ drawing }: Props) {
  return (
    <>
      <Polyline
        positions={drawing.positions}
        color={drawing.color}
        weight={drawing.weight}
        opacity={1}
        fillOpacity={0}
      />
      <Arrowhead drawing={drawing} />
    </>
  )
}

export const Drawing = memo(DrawingComponent)
