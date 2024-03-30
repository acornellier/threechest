import { useMap } from 'react-leaflet'
import { useContextMenu } from '../Common/useContextMenu.ts'
import { useCallback, useEffect, useState } from 'react'
import { LatLng, LeafletMouseEvent } from 'leaflet'
import { ContextMenu } from '../Common/ContextMenu.tsx'
import { addNote } from '../../store/routes/routesReducer.ts'

import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'

const minHeight = 50
const minWidth = 180

export function MapContextMenu() {
  const dispatch = useAppDispatch()
  const map = useMap()
  const isDrawing = useRootSelector((state) => state.map.isDrawing)

  const { contextMenuPosition, onRightClick, onClose } = useContextMenu({ minHeight, minWidth })
  const [leafletPos, setLeafletPos] = useState<LatLng | null>(null)

  const onRightClickMap = useCallback(
    (e: LeafletMouseEvent) => {
      onRightClick(e.originalEvent)
      setLeafletPos(e.latlng)
    },
    [onRightClick],
  )

  useEffect(() => {
    map.on({
      contextmenu: onRightClickMap,
      dragstart: onClose,
      zoomstart: onClose,
    })
  }, [map, onClose, onRightClickMap])

  if (!contextMenuPosition || !leafletPos || isDrawing) return null

  return (
    <ContextMenu
      position={contextMenuPosition}
      onClose={onClose}
      minHeight={minHeight}
      minWidth={minWidth}
      buttons={[
        {
          text: 'Add note',
          onClick: () =>
            dispatch(addNote({ position: [leafletPos.lat, leafletPos.lng], text: '' })),
        },
      ]}
    />
  )
}
