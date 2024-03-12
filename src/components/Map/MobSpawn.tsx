import { Mob, Spawn } from '../../data/types.ts'
import { Marker } from 'react-leaflet'
import { divIcon, type LeafletEventHandlerFnMap } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { memo, useMemo } from 'react'
import { mobScale, pullContainsMobSpawn } from '../../util/mobSpawns.ts'
import {
  useAppDispatch,
  useHoveredMobSpawn,
  useHoverSelector,
  useRoute,
} from '../../store/hooks.ts'
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
  const isBoxHovering = useHoverSelector((state) => state.isBoxHovering)
  const isActuallyHovered = isHovered && !isBoxHovering
  const iconSize = iconScaling * mobScale(mob) * (isActuallyHovered ? 1.2 : 1)

  const eventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click: (e) => {
        dispatch(
          toggleSpawn({
            spawn: spawn.id,
            individual: e.originalEvent?.ctrlKey || e.originalEvent?.metaKey,
          }),
        )
      },
      contextmenu: () => dispatch(selectMobSpawn(spawn.id)),
      mouseover: () => dispatch(hoverMobSpawn(spawn.id)),
      mouseout: () => dispatch(hoverMobSpawn(null)),
    }),
    [dispatch, spawn],
  )

  return (
    <>
      <Marker
        position={spawn.pos}
        riseOnHover
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
              isGroupHovered={isGroupHovered && !isBoxHovering}
              matchingPullIndex={matchingPullIndex}
            />,
          ),
        })}
      >
        {isActuallyHovered && <MobSpawnTooltip mob={mob} spawn={spawn} iconScaling={iconScaling} />}
      </Marker>
      {mob.isBoss && <BossMarker spawn={spawn} isHovered={isActuallyHovered} iconSize={iconSize} />}
      <Patrol spawn={spawn} isGroupHovered={isGroupHovered} />
    </>
  )
}

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawn({ iconScaling, mob, spawn }: MobSpawnProps) {
  const route = useRoute()

  const hoveredMobSpawn = useHoveredMobSpawn()
  const isHovered = !!hoveredMobSpawn && hoveredMobSpawn.spawn.id === spawn.id
  const isGroupHovered =
    isHovered ||
    (!!hoveredMobSpawn &&
      hoveredMobSpawn.spawn.group !== null &&
      hoveredMobSpawn.spawn.group === spawn.group)

  const matchingPullIndex = useMemo(() => {
    const index = route.pulls.findIndex((pull) => pullContainsMobSpawn(pull, spawn.id))
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
