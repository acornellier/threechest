import { divIcon } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { Spawn } from '../../data/types.ts'
import { Marker } from 'react-leaflet'

interface Props {
  spawn: Spawn
  isHovered: boolean
  iconSize: number
}

export function BossMarker({ spawn, isHovered, iconSize }: Props) {
  return (
    <Marker
      position={spawn.pos}
      interactive={false}
      zIndexOffset={isHovered ? 1000 : -10_000}
      icon={divIcon({
        iconSize: [iconSize, iconSize],
        className: 'elite-portait',
        html: renderToString(
          <div
            className="absolute"
            style={{
              backgroundImage: `url(/wow/elite.png)`,
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
