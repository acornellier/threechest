import { Spawn } from '../../data/types.ts'
import { useRoute } from '../RouteContext/UseRoute.ts'
import { Marker, Tooltip } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Mob } from '../../data/types.ts'
import { renderToString } from 'react-dom/server'
import { memo, useMemo, useState } from 'react'
import { mobSpawnsEqual } from '../../code/util.ts'
import { darkenColor } from '../../code/colors.ts'
import { Pull } from '../../code/types.ts'
import { RouteDispatch } from '../RouteContext/RouteReducer.ts'

interface MobSpawnProps {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

interface MobSpawnMemoProps extends MobSpawnProps {
  matchingPull: Pull | undefined
  dispatch: RouteDispatch
}

function MobSpawnComponent({ iconScaling, mob, spawn, matchingPull, dispatch }: MobSpawnMemoProps) {
  const [mobHovered, setMobHovered] = useState(false)
  const iconSize = iconScaling * mob.scale * (mobHovered ? 1.2 : 1)

  return (
    <Marker
      position={spawn.pos}
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

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawn({ iconScaling, mob, spawn }: MobSpawnProps) {
  const { route, dispatch } = useRoute()

  const matchingPull = useMemo(
    () =>
      route.pulls.find((pull) =>
        pull.mobSpawns.some((mobSpawn) => mobSpawnsEqual(mobSpawn, { mob, spawn })),
      ),
    [route.pulls, mob, spawn],
  )

  return (
    <MobSpawnMemo
      iconScaling={iconScaling}
      mob={mob}
      spawn={spawn}
      matchingPull={matchingPull}
      dispatch={dispatch}
    />
  )
}
