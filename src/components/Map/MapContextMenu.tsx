import { useMap } from 'react-leaflet'
import { useContextMenu } from '../Common/useContextMenu.ts'
import { useCallback, useEffect, useState } from 'react'
import { LatLng, LeafletMouseEvent } from 'leaflet'
import { ContextMenu } from '../Common/ContextMenu.tsx'
import { Button } from '../Common/Button.tsx'
import { useAppDispatch } from '../../store/hooks.ts'
import { addNote } from '../../store/routesReducer.ts'

export function MapContextMenu() {
  const dispatch = useAppDispatch()
  const map = useMap()
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu()
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

  if (!contextMenuPosition || !leafletPos) return null

  return (
    <ContextMenu position={contextMenuPosition} onClose={onClose}>
      <Button
        short
        justifyStart
        onClick={(e) => {
          dispatch(addNote({ position: [leafletPos.lat, leafletPos.lng], text: '' }))
          onClose()
          e.stopPropagation()
        }}
      >
        Add note
      </Button>
    </ContextMenu>
  )
}
