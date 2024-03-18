import { useAwarenessStates } from '../../store/hooks.ts'
import { Fragment } from 'react'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { CursorIcon } from '../Common/Icons/CursorIcon.tsx'

export function AwarenessVisuals() {
  const awarenessStates = useAwarenessStates()

  return (
    <div>
      {awarenessStates
        .filter(({ isCurrentClient }) => !isCurrentClient)
        .map((awareness) => (
          <Fragment key={awareness.clientId}>
            {awareness.mousePosition && (
              <Marker
                position={awareness.mousePosition}
                zIndexOffset={999999}
                interactive={false}
                icon={divIcon({
                  className: 'awareness-cursor',
                  html: renderToStaticMarkup(<CursorIcon width={24} height={24} />),
                })}
              />
            )}
          </Fragment>
        ))}
    </div>
  )
}
