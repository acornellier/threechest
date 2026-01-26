import { memo, useEffect, useMemo, useRef, useState } from 'react'
import type { Note as NoteType } from '../../../util/types.ts'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import { divIcon, type LeafletEventHandlerFnMap } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import { deleteNote, editNote, moveNote } from '../../../store/routes/routesReducer.ts'
import { ContextMenu } from '../../Common/ContextMenu.tsx'
import { latLngToPoint } from '../../../util/map.ts'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'

interface Props {
  poi: NoteType
  index: number
  iconScaling: number
}

const contextMenuMinHeight = 150
const contextMenuMinWidth = 180

function NoteComponent({ poi, index, iconScaling }: Props) {
  const dispatch = useAppDispatch()
  const iconSize = iconScaling
  const hidden = useMapObjectsHidden()
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu({
    minHeight: contextMenuMinHeight,
    minWidth: contextMenuMinWidth,
  })
  const [input, setInput] = useState(poi.text)
  const [popupOpen, setPopupOpen] = useState(false)
  const markerRef = useRef<LeafletMarker>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (input !== poi.text && !popupOpen) setInput(poi.text)
  }, [input, poi.text, popupOpen])

  useEffect(() => {
    if (poi.justAdded) {
      setTimeout(() => markerRef.current?.openPopup(), 0)
      dispatch(editNote({ changes: { justAdded: false }, index }))
    }
  }, [dispatch, index, poi.justAdded])

  const markerEventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click: () => inputRef.current?.focus(),
      dragend: (e) =>
        dispatch(
          editNote({
            index: index,
            changes: {
              position: latLngToPoint((e.target as LeafletMarker).getLatLng()),
            },
          }),
        ),
      contextmenu: (e) => {
        onRightClick(e.originalEvent)
        e.originalEvent.stopPropagation()
      },
    }),
    [dispatch, index, onRightClick],
  )

  const popupEventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      add: () => setPopupOpen(true),
      remove: () => {
        setPopupOpen(false)
        dispatch(editNote({ index: index, changes: { text: input } }))
      },
    }),
    [dispatch, input, index],
  )

  return (
    <>
      <Marker
        ref={markerRef}
        position={poi.position}
        draggable
        zIndexOffset={1100}
        eventHandlers={markerEventHandlers}
        icon={divIcon({
          className: `note-icon fade-in-map-object ${hidden ? 'opacity-0' : 'opacity-1'}`,
          tooltipAnchor: [20 + (iconScaling - 40) / 2, 0],
          popupAnchor: [90 + (iconScaling - 40) / 2, 32],
          iconSize: [iconSize, iconSize],
          html: renderToString(
            <div
              className="note w-full h-full flex items-center justify-center rounded-full border-black shadow-2xl text-black"
              style={{
                fontSize: iconSize * 0.6,
                borderWidth: iconSize * 0.05,
                background: 'linear-gradient(135deg, #ffd416, #8f7100)',
                boxShadow: 'black 0px 0px 10px 0px',
                textShadow: '-2px 2px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              {index + 1}
            </div>,
          ),
        })}
      >
        {!popupOpen && (
          <Tooltip
            key={iconScaling}
            direction="right"
            className="no-arrow min-h-8 w-64 p-0 bg-transparent border-none shadow-none"
          >
            <div className="relative min-w-14 w-fit border border-gray-400 rounded-md">
              <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-md" />
              <div className="p-2 whitespace-normal text-white text-xs">{poi.text}</div>
            </div>
          </Tooltip>
        )}
        <Popup
          className="plain-popup"
          minWidth={256}
          offset={[65, 36.5]}
          closeButton={false}
          eventHandlers={popupEventHandlers}
        >
          <textarea
            ref={inputRef}
            autoFocus
            className="fancy w-full [&]:min-h-24 [&]:text-xs resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) markerRef.current?.closePopup()
            }}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </Popup>
      </Marker>
      {contextMenuPosition && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={onClose}
          minHeight={contextMenuMinHeight}
          minWidth={contextMenuMinWidth}
          buttons={[
            {
              contents: 'Delete note',
              onClick: () => dispatch(deleteNote(index)),
            },
            {
              contents: 'Move up',
              onClick: () => dispatch(moveNote({ index: index, indexChange: -1 })),
            },
            {
              contents: 'Move down',
              onClick: () => dispatch(moveNote({ index: index, indexChange: +1 })),
            },
          ]}
        />
      )}
    </>
  )
}

export const Note = memo(NoteComponent)
