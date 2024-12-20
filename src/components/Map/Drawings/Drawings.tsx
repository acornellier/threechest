import { DrawingMemo } from './Drawing.tsx'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useMapEvents } from 'react-leaflet'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { useMemo } from 'react'
import { setIsErasing } from '../../../store/reducers/mapReducer.ts'

export function Drawings() {
  const route = useRoute()
  const dispatch = useAppDispatch()
  const drawMode = useRootSelector((state) => state.map.drawMode)
  const isErasing = useRootSelector((state) => state.map.isErasing)

  const mapEvents = useMemo(
    () => ({
      mousedown: () => {
        if (drawMode === 'erasing') dispatch(setIsErasing(true))
      },
      mouseup: () => {
        if (isErasing) dispatch(setIsErasing(false))
      },
    }),
    [dispatch, drawMode, isErasing],
  )

  useMapEvents(mapEvents)

  return route.drawings.map((drawing) => <DrawingMemo key={drawing.id} drawing={drawing} />)
}
