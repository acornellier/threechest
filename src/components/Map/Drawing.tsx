import { memo } from 'react'
import { Drawing as DrawingType } from '../../code/types.ts'
import { Polygon } from 'react-leaflet'

interface Props {
  drawing: DrawingType
}

function DrawingComponent({ drawing }: Props) {
  return (
    <Polygon
      positions={drawing.positions}
      color={drawing.color}
      weight={drawing.weight}
      opacity={1}
      fillOpacity={0}
    />
  )
}

export const Drawing = memo(DrawingComponent)
