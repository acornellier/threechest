import { vp } from '../data/vp.ts'
import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet'
import { icon } from 'leaflet'
import { useState } from 'react'

export function Mobs() {
  const map = useMap()

  const toIconSize = () => 6 * 2 ** map.getZoom()

  const [iconSize, setIconSize] = useState(toIconSize())

  useMapEvent('zoom', () => {
    console.log('hi')
    setIconSize(toIconSize())
  })

  return (
    <>
      {vp.mdtMobs.map((mob) =>
        mob.spawns.map((spawn, idx) => (
          <Marker
            key={`${mob.id}${idx}`}
            position={spawn.pos}
            icon={icon({
              iconUrl: 'https://keystone.guru/images/enemyportraits/45915.png',
              iconSize: [iconSize, iconSize],
              className: 'mob',
            })}
          >
            <Popup>{mob.name}</Popup>
          </Marker>
        )),
      )}
    </>
  )
}
