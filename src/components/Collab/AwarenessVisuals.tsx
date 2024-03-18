import { useAwarenessStates } from '../../store/hooks.ts'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { CursorIcon } from '../Common/Icons/CursorIcon.tsx'
import { getTextColor } from '../../util/colors.ts'
import { AwarenessState } from '../../store/reducers/collabReducer.ts'

function AwarenessCursor({ awareness }: { awareness: AwarenessState }) {
  if (awareness.isCurrentClient) return
  if (!awareness.mousePosition || !awareness.color) return

  const textColor = getTextColor(awareness.color)

  return (
    <Marker
      position={awareness.mousePosition}
      zIndexOffset={999999}
      interactive={false}
      icon={divIcon({
        className: 'awareness-cursor',
        html: renderToStaticMarkup(
          <div className="relative">
            <CursorIcon width={24} height={24} color={awareness.color} stroke={textColor} />
            <div
              className="absolute top-4 left-4 w-fit px-1 whitespace-nowrap rounded-md rounded-tl-sm"
              style={{
                backgroundColor: awareness.color,
                color: textColor,
              }}
            >
              {awareness.name}
            </div>
          </div>,
        ),
      })}
    />
  )
}

export function AwarenessVisuals() {
  const awarenessStates = useAwarenessStates()

  return (
    <>
      {awarenessStates.map((awareness) => (
        <AwarenessCursor key={awareness.clientType} awareness={awareness} />
      ))}
    </>
  )
}
