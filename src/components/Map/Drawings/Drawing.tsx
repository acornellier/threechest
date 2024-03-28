import { memo, useMemo } from 'react'
import { Drawing as DrawingType } from '../../../util/types.ts'
import { Polyline, useMap } from 'react-leaflet'
import { Arrowhead } from './Arrowhead.tsx'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { deleteDrawing } from '../../../store/routes/routesReducer.ts'

interface Props {
  drawing: DrawingType
}

const overDrawingClass = 'over-drawing'

function DrawingComponent({ drawing }: Props) {
  const dispatch = useAppDispatch()
  const map = useMap()
  const hidden = useMapObjectsHidden()
  const drawMode = useRootSelector((state) => state.map.drawMode)

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        dispatch(deleteDrawing(drawing))
        map.getContainer().classList.remove(overDrawingClass)
      },
      mouseover: () => map.getContainer().classList.add(overDrawingClass),
      mouseout: () => map.getContainer().classList.remove(overDrawingClass),
    }),
    [dispatch, drawing, map],
  )

  return (
    <>
      <Polyline
        key={`${hidden}`}
        className="fade-in-map-object"
        positions={drawing.positions}
        color={drawing.color}
        weight={drawing.weight}
        opacity={hidden ? 0 : 1}
        fillOpacity={0}
        interactive
        eventHandlers={drawMode === 'deleting' ? eventHandlers : {}}
      />
      <Arrowhead drawing={drawing} hidden={hidden} />
    </>
  )
}

export const Drawing = memo(DrawingComponent)
