import { Marker, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet';
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { CursorIcon } from '../Common/Icons/CursorIcon.tsx'
import { getTextColor } from '../../util/colors.ts'
import {
  setMousePosition,
  useAwarenessStates,
  useCollabSelector,
} from '../../store/collab/collabReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { memo, useMemo } from 'react'

interface Props {
  color: string
  name: string
  mouseLat: number
  mouseLng: number
}

function AwarenessCursor({ mouseLat, mouseLng, color, name }: Props) {
  const textColor = getTextColor(color)

  return (
    <Marker
      position={[mouseLat, mouseLng]}
      zIndexOffset={999999}
      interactive={false}
      icon={divIcon({
        className: 'awareness-cursor',
        html: renderToStaticMarkup(
          <div className="relative">
            <CursorIcon width={24} height={24} color={color} stroke={textColor} />
            <div
              className="absolute top-4 left-4 w-fit px-1 whitespace-nowrap rounded-md rounded-tl-sm"
              style={{
                backgroundColor: color,
                color: textColor,
              }}
            >
              {name}
            </div>
          </div>,
        ),
      })}
    />
  )
}

const AwarenessCursorMemo = memo(AwarenessCursor)

export function AwarenessCursors() {
  const dispatch = useAppDispatch()
  const active = useCollabSelector((state) => state.active)
  const awarenessStates = useAwarenessStates()

  const mapEvents = useMemo(
    () => ({
      mousemove: (e: LeafletMouseEvent) => active && dispatch(setMousePosition(e.latlng)),
      mouseout: () => active && dispatch(setMousePosition(null)),
    }),
    [dispatch, active],
  )

  useMapEvents(mapEvents)

  if (!active) return false

  return (
    <>
      {awarenessStates
        .filter(({ isCurrentClient }) => !isCurrentClient)
        .filter(({ color, mousePosition }) => mousePosition && color)
        .map((awareness) => (
          <AwarenessCursorMemo
            key={awareness.clientId}
            color={awareness.color!}
            name={awareness.name}
            mouseLat={awareness.mousePosition!.lat}
            mouseLng={awareness.mousePosition!.lng}
          />
        ))}
    </>
  )
}
