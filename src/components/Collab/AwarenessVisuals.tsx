import { useAwarenessStates } from '../../store/hooks.ts'
import { Fragment } from 'react'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { CursorIcon } from '../Common/Icons/CursorIcon.tsx'
import { getTextColor } from '../../util/colors.ts'

export function AwarenessVisuals() {
  const awarenessStates = useAwarenessStates()

  return (
    <div>
      {awarenessStates
        .filter(({ isCurrentClient }) => !isCurrentClient)
        .map((awareness) => (
          <Fragment key={awareness.clientId}>
            {awareness.mousePosition && awareness.color && (
              <Marker
                position={awareness.mousePosition}
                zIndexOffset={999999}
                interactive={false}
                icon={divIcon({
                  className: 'awareness-cursor',
                  html: renderToStaticMarkup(
                    <div className="relative">
                      <CursorIcon width={24} height={24} color={awareness.color} />
                      <div
                        className="absolute top-4 left-4 w-fit px-1 whitespace-nowrap rounded-md rounded-tl-sm"
                        style={{
                          backgroundColor: awareness.color,
                          color: getTextColor(awareness.color),
                        }}
                      >
                        {awareness.name}
                      </div>
                    </div>,
                  ),
                })}
              />
            )}
          </Fragment>
        ))}
    </div>
  )
}
