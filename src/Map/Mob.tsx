import { Spawn } from '../data/types.ts'
import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Mob } from '../data/types.ts'
import { renderToString } from 'react-dom/server'

type MobProps = {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

export function Mob({ iconScaling, mob, spawn }: MobProps) {
  const { addToRoute } = useRouteContext()

  return (
    <Marker
      position={spawn.pos}
      icon={divIcon({
        iconUrl: `/vp/npc/${mob.id}.png`,
        iconSize: [iconScaling * mob.scale, iconScaling * mob.scale],
        className: 'mob',
        html: renderToString(
          <img src={`/vp/npc/${mob.id}.png`} style={{ borderWidth: iconScaling * 0.05 }} alt="" />,
        ),
      })}
      eventHandlers={{
        click: () => {
          addToRoute(mob, spawn)
        },
      }}
    >
      <Popup>{`${mob.name} g: ${spawn.group}`}</Popup>
    </Marker>
  )
}
