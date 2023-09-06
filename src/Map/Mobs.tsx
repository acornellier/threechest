import { mobs } from '../data/vp.ts'
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet'
import { icon } from 'leaflet'
import { useState } from 'react'

// 1 => 1
// 2 => 4
// 3 => 8
// 4 => 16
// 5 => 32

export function Mobs() {
  const map = useMap()

  const toIconSize = () => 6 * 2 ** map.getZoom()

  const [iconSize, setIconSize] = useState(toIconSize())

  useMapEvent('zoom', () => {
    setIconSize(toIconSize())
  })

  return (
    <>
      {mobs.map((mob) => (
        <Marker
          key={mob.name}
          position={mob.pos}
          icon={icon({
            iconUrl: 'https://keystone.guru/images/enemyportraits/45915.png',
            iconSize: [iconSize, iconSize],
            className: 'mob',
          })}
        >
          <Popup>{mob.name}</Popup>
        </Marker>
      ))}
    </>
  )
}
