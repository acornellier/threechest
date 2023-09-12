import { Spawn } from '../data/types.ts'
import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Mob } from '../data/types.ts'
import { renderToString } from 'react-dom/server'
import { mobSpawnToKey } from '../code/stuff.ts'

type MobProps = {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

export function Mob({ iconScaling, mob, spawn }: MobProps) {
  const { route, dispatch } = useRouteContext()

  const mobSpawnKey = mobSpawnToKey({ mob, spawn })
  const matchingPull = route.pulls.find((pull) =>
    pull.mobSpawns.some((_mobSpawnKey) => _mobSpawnKey === mobSpawnKey),
  )

  const divStyle = {
    borderWidth: iconScaling * 0.05,
  }

  const colorStyle = {
    backgroundColor: matchingPull?.color,
  }

  return (
    <Marker
      position={spawn.pos as [number, number]}
      icon={divIcon({
        popupAnchor: [100, 0],
        iconUrl: `/vp/npc/${mob.id}.png`,
        iconSize: [iconScaling * mob.scale, iconScaling * mob.scale],
        className: 'mob',
        html: renderToString(
          <div className="mob-icon" style={divStyle}>
            <img src={`/vp/npc/${mob.id}.png`} alt="" />
            <div className="mob-icon-background" style={colorStyle} />
          </div>,
        ),
      })}
      eventHandlers={{
        click: () => dispatch({ type: 'toggle_spawn', mob, spawn }),
      }}
    >
      <Popup>{`${mob.name} ${mob.enemyIndex}-${spawn.spawnIndex} g${spawn.group}`}</Popup>
    </Marker>
  )
}
