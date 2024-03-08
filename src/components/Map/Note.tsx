import { memo } from 'react'
import { Note as NoteType } from '../../code/types.ts'
import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToString } from 'react-dom/server'

interface Props {
  note: NoteType
  index: number
  iconScaling: number
}

function NoteComponent({ note, index, iconScaling }: Props) {
  const iconSize = iconScaling

  return (
    <Marker
      position={note.position}
      icon={divIcon({
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
            {index + 1}
          </div>,
        ),
      })}
    >
      <Tooltip
        key={iconScaling}
        className="no-arrow flex flex-col text-white text-md p-0 bg-transparent rounded-sm border-gray-400"
        direction="right"
        offset={[iconSize * 0.5, 0]}
      >
        <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-sm" />
        <div className="p-2">{note.text}</div>
      </Tooltip>
    </Marker>
  )
}

export const Note = memo(NoteComponent)
