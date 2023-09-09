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
  const { route, toggleSpawn } = useRouteContext()

  const matchingPull = route.pulls.find((pull) =>
    pull.enemies.some(
      (enemy) =>
        enemy.enemyIndex == mob.enemyIndex &&
        enemy.spawnIndexes.some((spawnIndex) => spawnIndex == spawn.spawnIndex),
    ),
  )

  const divStyle = {
    borderWidth: iconScaling * 0.05,
  }

  const colorStyle = {
    backgroundColor: matchingPull?.color,
  }

  return (
    <Marker
      position={spawn.pos}
      icon={divIcon({
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
        click: () => {
          toggleSpawn({ mob, spawn })
        },
      }}
    >
      <Popup>{`${mob.name} g: ${spawn.group}`}</Popup>
    </Marker>
  )
}
