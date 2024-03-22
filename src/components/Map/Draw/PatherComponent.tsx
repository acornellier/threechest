import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { useMemo } from 'react'
import { CreatedEvent, MODES } from '../../Leaflet/Pather.ts'
import { latLngToPoint } from '../../../util/map.ts'
import { addDrawing } from '../../../store/routes/routesReducer.ts'
import { Drawing } from '../../../util/types.ts'
import { ReactPatherLayerComponent } from './PatherLayerComponent.tsx'

export function PatherComponent() {
  const dispatch = useAppDispatch()

  const { isDrawing, drawColor, drawWeight } = useRootSelector((state) => state.map)

  const eventHandlers = useMemo(
    () => ({
      created: (e: CreatedEvent) => {
        const drawing: Drawing = {
          positions: [e.latLngs.map(latLngToPoint)],
          weight: drawWeight,
          color: drawColor,
        }
        dispatch(addDrawing(drawing))
      },
    }),
    [drawColor, dispatch, drawWeight],
  )

  if (!isDrawing) return

  return (
    <ReactPatherLayerComponent
      mode={MODES.CREATE}
      strokeWidth={drawWeight}
      strokeColor={drawColor}
      eventHandlers={eventHandlers}
    />
  )
}
