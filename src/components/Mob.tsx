import { Spawn } from '../data/types.ts'
import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Mob } from '../data/types.ts'
import { renderToString } from 'react-dom/server'
import { useState } from 'react'
import { mobSpawnsEqual } from '../code/stuff.ts'

type MobProps = {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

export function Mob({ iconScaling, mob, spawn }: MobProps) {
  const { route, dispatch } = useRouteContext()
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const matchingPull = route.pulls.find((pull) =>
    pull.mobSpawns.some((mobSpawn) => mobSpawnsEqual(mobSpawn, { mob, spawn })),
  )

  const iconSize = iconScaling * mob.scale

  return (
    <Marker
      position={spawn.pos as [number, number]}
      icon={divIcon({
        popupAnchor: [100, 0],
        iconUrl: `/vp/npc/${mob.id}.png`,
        iconSize: [iconSize, iconSize],
        className: 'mob',
        html: renderToString(
          <div
            className="mob-icon"
            style={{
              borderWidth: iconScaling * 0.05,
            }}
          >
            <img src={`/vp/npc/${mob.id}.png`} alt="" />
            <div
              className="mob-icon-background"
              style={{
                backgroundColor: matchingPull?.color,
              }}
            />
          </div>,
        ),
      })}
      eventHandlers={{
        click: () => dispatch({ type: 'toggle_spawn', mob, spawn }),
        mouseover: () => setTooltipOpen(true),
        mouseout: () => setTooltipOpen(false),
      }}
    >
      {tooltipOpen && (
        <Tooltip direction="top" offset={[0, -5]}>
          {`${mob.name} ${mob.enemyIndex}-${spawn.spawnIndex} g${spawn.group}`}
        </Tooltip>
      )}
    </Marker>
  )
}
