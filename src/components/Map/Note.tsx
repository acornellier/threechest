import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Note as NoteType } from '../../util/types.ts'
import { Marker, Popup, Tooltip } from 'react-leaflet'
import { divIcon, type LeafletEventHandlerFnMap, Marker as LeafletMarker } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { useAppDispatch } from '../../store/hooks.ts'
import { useContextMenu } from '../Common/useContextMenu.ts'
import { Button } from '../Common/Button.tsx'
import { deleteNote, editNote } from '../../store/routesReducer.ts'
import { ContextMenu } from '../Common/ContextMenu.tsx'
import { latLngToPoint } from '../../util/map.ts'

interface Props {
  note: NoteType
  noteIndex: number
  iconScaling: number
}

function NoteComponent({ note, noteIndex, iconScaling }: Props) {
  const dispatch = useAppDispatch()
  const iconSize = iconScaling
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu()
  const [input, setInput] = useState(note.text)
  const [popupOpen, setPopupOpen] = useState(false)
  const markerRef = useRef<LeafletMarker>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (note.justAdded) {
      setTimeout(() => markerRef.current?.openPopup(), 0)
      dispatch(editNote({ changes: { justAdded: false }, noteIndex }))
    }
  }, [dispatch, noteIndex, note.justAdded])

  const markerEventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click: () => inputRef.current?.focus(),
      dragend: (e) =>
        dispatch(
          editNote({
            noteIndex,
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
    [dispatch, noteIndex, onRightClick],
  )

  const popupEventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      add: () => setPopupOpen(true),
      remove: () => {
        setPopupOpen(false)
        dispatch(editNote({ noteIndex, changes: { text: input } }))
      },
    }),
    [dispatch, input, noteIndex],
  )

  return (
    <>
      <Marker
        ref={markerRef}
        position={note.position}
        draggable
        eventHandlers={markerEventHandlers}
        icon={divIcon({
          tooltipAnchor: [20 + (iconScaling - 40) / 2, 0],
          popupAnchor: [90 + (iconScaling - 40) / 2, 32],
          iconSize: [iconSize, iconSize],
          className: 'mob',
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
              {noteIndex + 1}
            </div>,
          ),
        })}
      >
        {!popupOpen && (
          <Tooltip
            key={iconScaling}
            direction="right"
            className="no-arrow flex flex-col text-white text-md p-0 bg-transparent rounded-md border-gray-400 min-h-8 min-w-14"
          >
            <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-md" />
            <div className="p-2">{note.text}</div>
          </Tooltip>
        )}
        <Popup className="plain-popup" closeButton={false} eventHandlers={popupEventHandlers}>
          <input
            ref={inputRef}
            autoFocus
            className="p-2 w-full bg-gray-100 fancy min-w-32"
            onKeyDown={(e) => {
              if (e.key === 'Enter') markerRef.current?.closePopup()
            }}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </Popup>
      </Marker>
      {contextMenuPosition && (
        <ContextMenu position={contextMenuPosition} onClose={onClose}>
          <Button
            short
            justifyStart
            onClick={(e) => {
              dispatch(deleteNote(noteIndex))
              onClose()
              e.stopPropagation()
            }}
          >
            Delete note
          </Button>
        </ContextMenu>
      )}
    </>
  )
}

export const Note = memo(NoteComponent)
