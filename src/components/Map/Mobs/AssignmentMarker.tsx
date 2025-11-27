import type { Spawn } from '../../../data/types.ts'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'

interface Props {
  spawn: Spawn
  iconSize: number
  assignment: string
}

export function AssignmentMarker({ spawn, iconSize, assignment }: Props) {
  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={1100}
      icon={divIcon({
        iconSize: [iconSize, iconSize],
        className: `assignment-marker fade-in-map-object`,
        html: renderToStaticMarkup(
          <div
            className="absolute"
            style={{
              backgroundImage: `url(/images/markers/${assignment}.png)`,
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
