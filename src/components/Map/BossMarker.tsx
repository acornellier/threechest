import { divIcon } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { Spawn } from '../../data/types.ts'
import { Marker } from 'react-leaflet'

interface Props {
  spawn: Spawn
  isHovered: boolean
  iconSize: number
  hidden: boolean
}

export function BossMarker({ spawn, isHovered, iconSize, hidden }: Props) {
  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={isHovered ? 0 : -10_000}
      icon={divIcon({
        iconSize: [iconSize, iconSize],
        className: `fade-in-map-object ${hidden ? 'opacity-0' : 'opacity-1'}`,
        html: renderToString(
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
      })}
    />
  )
}
