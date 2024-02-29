import { Spawn } from '../../data/types.ts'
import { useRoute } from '../RouteContext/UseRoute.ts'
import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Mob } from '../../data/types.ts'
import { renderToString } from 'react-dom/server'
import { useState } from 'react'
import { mobSpawnsEqual } from '../../code/util.ts'
import { darkenColor } from '../../code/colors.ts'

type MobProps = {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

export function MobSpawn({ iconScaling, mob, spawn }: MobProps) {
  const { route, dispatch } = useRoute()
  const [mobHovered, setMobHovered] = useState(false)

  const matchingPull = route.pulls.find((pull) =>
    pull.mobSpawns.some((mobSpawn) => mobSpawnsEqual(mobSpawn, { mob, spawn })),
  )

  const iconSize = iconScaling * mob.scale * (mobHovered ? 1.2 : 1)

  return (
    <Marker
      position={spawn.pos as [number, number]}
      zIndexOffset={mobHovered ? 100_000 : 0}
      icon={divIcon({
        popupAnchor: [100, 0],
        iconUrl: `/npc_portaits/${mob.id}.png`,
        iconSize: [iconSize, iconSize],
        className: 'mob',
        html: renderToString(
          <div
            className="absolute h-full w-full rounded-full border border-slate-300 overflow-hidden"
            style={{
              borderWidth: iconScaling * 0.04,
              backgroundColor: matchingPull ? darkenColor(matchingPull.color, 100) : undefined,
              backgroundImage: `url('/npc_portraits/${mob.id}.png')`,
              backgroundSize: 'contain',
              backgroundBlendMode: 'overlay',
            }}
          />,
        ),
      })}
      eventHandlers={{
        click: () => dispatch({ type: 'toggle_spawn', mob, spawn }),
        mouseover: () => setMobHovered(true),
        mouseout: () => setMobHovered(false),
      }}
    >
      {mobHovered && (
        <Tooltip direction="top" offset={[0, -5]}>
          {`${mob.name} ${mob.enemyIndex}-${spawn.spawnIndex} g${spawn.group}`}
        </Tooltip>
      )}
    </Marker>
  )
}
