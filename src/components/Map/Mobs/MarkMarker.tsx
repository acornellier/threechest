import type { Spawn } from '../../../data/types.ts'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import type { WowMark } from '../../../util/marks.ts'

interface Props {
  spawn: Spawn
  iconSize: number
  mark: WowMark
}

export function MarkMarker({ spawn, iconSize, mark }: Props) {
  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={1100}
      icon={divIcon({
        iconSize: [iconSize, iconSize],
        className: `mark-marker fade-in-map-object`,
        html: renderToStaticMarkup(
          <div
            className="absolute"
            style={{
              backgroundImage: `url(/images/markers/${mark}.png)`,
              backgroundSize: 'contain',
              zIndex: -1,
              width: '80%',
              height: '80%',
              top: '10%',
              left: '10%',
            }}
          />,
        ),
      })}
    />
  )
}
