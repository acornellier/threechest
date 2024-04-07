import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { useMemo } from 'react'
import { CreatedEvent } from '../../Leaflet/Pather/Pather.ts'
import { latLngToPoint } from '../../../util/map.ts'
import { addDrawing } from '../../../store/routes/routesReducer.ts'
import { Drawing } from '../../../util/types.ts'
import { ReactPatherLayerComponent } from './PatherLayerComponent.tsx'

export function PatherComponent() {
  const dispatch = useAppDispatch()

  const { mapMode, drawMode, drawColor, drawWeight } = useRootSelector((state) => state.map)

  const eventHandlers = useMemo(
    () => ({
      created: (e: CreatedEvent) => {
        const drawing: Omit<Drawing, 'id'> = {
          positions: [e.latLngs.map(latLngToPoint)],
          weight: drawWeight,
          color: drawColor,
        }
        dispatch(addDrawing(drawing))
      },
    }),
    [drawColor, dispatch, drawWeight],
  )

  if (mapMode !== 'drawing') return null

  return (
    <ReactPatherLayerComponent
      mode={drawMode}
      strokeWidth={drawWeight}
      strokeColor={drawColor}
      simplifyThreshold={5}
      eventHandlers={eventHandlers}
    />
  )
}
