import { Mob, Spawn } from '../../data/types.ts'
import { Marker } from 'react-leaflet'
import { divIcon, type LeafletEventHandlerFnMap } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { memo, useMemo } from 'react'
import { mobScale, mobSpawnsEqual } from '../../code/mobSpawns.ts'
import { useAppDispatch, useHoverSelector, useRoute } from '../../store/hooks.ts'
import { toggleSpawn } from '../../store/routesReducer.ts'
import { Patrol } from './Patrol.tsx'
import { BossMarker } from './BossMarker.tsx'
import { MobIcon } from './MobIcon.tsx'
import { MobSpawnTooltip } from './MobSpawnTooltip.tsx'
import { hoverMobSpawn, selectMobSpawn } from '../../store/hoverReducer.ts'

interface MobSpawnProps {
  iconScaling: number
  mob: Mob
  spawn: Spawn
}

interface MobSpawnMemoProps extends MobSpawnProps {
  isHovered: boolean
  isGroupHovered: boolean
  matchingPullIndex: number | null
}

function MobSpawnComponent({
  iconScaling,
  mob,
  spawn,
  isHovered,
  isGroupHovered,
  matchingPullIndex,
}: MobSpawnMemoProps) {
  const dispatch = useAppDispatch()
  const iconSize = iconScaling * mobScale(mob) * (isHovered ? 1.2 : 1)

  const eventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click: (e) => {
        dispatch(
          toggleSpawn({
            mobSpawn: { mob, spawn },
            individual: e.originalEvent.ctrlKey || e.originalEvent.metaKey,
          }),
        )
      },
      contextmenu: () => dispatch(selectMobSpawn({ mob, spawn })),
      mouseover: () => dispatch(hoverMobSpawn({ mob, spawn })),
      mouseout: () => dispatch(hoverMobSpawn(null)),
    }),
    [dispatch, mob, spawn],
  )

  return (
    <>
      <Marker
        position={spawn.pos}
        zIndexOffset={isHovered ? 100_000 : 0}
        eventHandlers={eventHandlers}
        icon={divIcon({
          popupAnchor: [100, 0],
          iconUrl: `/npc_portaits/${mob.id}.png`,
          iconSize: [iconSize, iconSize],
          className: 'mob',
          html: renderToString(
            <MobIcon
              mob={mob}
              iconScaling={iconScaling}
              isGroupHovered={isGroupHovered}
              matchingPullIndex={matchingPullIndex}
            />,
          ),
        })}
      >
        {isHovered && <MobSpawnTooltip mob={mob} spawn={spawn} iconScaling={iconScaling} />}
      </Marker>
      {mob.isBoss && <BossMarker spawn={spawn} isHovered={isHovered} iconSize={iconSize} />}
      <Patrol spawn={spawn} isGroupHovered={isGroupHovered} />
    </>
  )
}

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawn({ iconScaling, mob, spawn }: MobSpawnProps) {
  const route = useRoute()

  const hoveredMobSpawn = useHoverSelector((state) => state.hoveredMobSpawn)
  const isHovered = !!hoveredMobSpawn && mobSpawnsEqual(hoveredMobSpawn, { mob, spawn })
  const isGroupHovered =
    isHovered ||
    (!!hoveredMobSpawn &&
      hoveredMobSpawn.spawn.group !== null &&
      hoveredMobSpawn.spawn.group === spawn.group)

  const matchingPullIndex = useMemo(() => {
    const index = route.pulls.findIndex((pull) =>
      pull.mobSpawns.some((mobSpawn) => mobSpawnsEqual(mobSpawn, { mob, spawn })),
    )
    return index !== -1 ? index : null
  }, [route.pulls, mob, spawn])

  return (
    <MobSpawnMemo
      iconScaling={iconScaling}
      mob={mob}
      spawn={spawn}
      isHovered={isHovered}
      isGroupHovered={isGroupHovered}
      matchingPullIndex={matchingPullIndex}
    />
  )
}
