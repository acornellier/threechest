import { renderToStaticMarkup } from 'react-dom/server'
import type { Spawn } from '../../../data/types.ts'
import { Marker } from 'react-leaflet'
import { scaledDivIcon } from '../../../util/scaledIcon.ts'

interface Props {
  spawn: Spawn
  isHovered: boolean
  scale: number
  boxScale: number
  hidden: boolean
}

export function BossMarker({ spawn, isHovered, scale, boxScale, hidden }: Props) {
  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={isHovered ? 0 : -10_000}
      opacity={hidden ? 0 : 1}
      icon={scaledDivIcon(
        {
          className: `boss-marker fade-in-map-object`,
          html: renderToStaticMarkup(
            <div
              className="absolute"
              style={{
                backgroundImage: `url(/images/elite.png)`,
                backgroundSize: 'contain',
                zIndex: -1,
                width: '165%',
                height: '165%',
                top: '-30%',
                left: '-45%',
              }}
            />,
          ),
        },
        { scale, boxScale },
      )}
    />
  )
}
