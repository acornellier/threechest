import { memo, useEffect, useState } from 'react'
import { Drawing as DrawingType } from '../../util/types.ts'
import { Polyline } from 'react-leaflet'
import { Arrowhead } from './Arrowhead.tsx'
import { useMapObjectsHidden } from '../../store/reducers/mapReducer.ts'

interface Props {
  drawing: DrawingType
}

function DrawingComponent({ drawing }: Props) {
  const hidden = useMapObjectsHidden()

  // Change key to force re-render
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((prevKey) => prevKey + 1000)
  }, [hidden])

  return (
    <>
      <Polyline
        key={key}
        className="fade-in-map-object"
        positions={drawing.positions}
        color={drawing.color}
        weight={drawing.weight}
        opacity={hidden ? 0 : 1}
        fillOpacity={0}
      />
      <Arrowhead drawing={drawing} hidden={hidden} />
    </>
  )
}

export const Drawing = memo(DrawingComponent)
