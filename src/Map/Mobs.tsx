import { Marker, Popup, useMap, useMapEvent } from 'react-leaflet'
import { icon } from 'leaflet'
import { useState } from 'react'
import { Dungeon } from '../data/types.ts'

type Props = {
  dungeon: Dungeon
}

export function Mobs({ dungeon }: Props) {
  const map = useMap()

  const toIconSize = () => 6 * 2 ** map.getZoom()

  const [iconSize, setIconSize] = useState(toIconSize())

  useMapEvent('zoom', () => {
    setIconSize(toIconSize())
  })

  return (
    <>
      {dungeon.mdtMobs.map((mob) =>
        mob.spawns.map((spawn, idx) => (
          <Marker
            key={`${mob.id}${idx}`}
            position={spawn.pos}
            icon={icon({
              iconUrl: `/vp/npc/${mob.id}.png`,
              iconSize: [iconSize * mob.scale, iconSize * mob.scale],
              className: 'mob',
            })}
          >
            <Popup>{`${mob.name} g: ${spawn.group}`}</Popup>
          </Marker>
        )),
      )}
    </>
  )
}
