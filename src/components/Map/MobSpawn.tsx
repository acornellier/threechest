import { Marker } from 'react-leaflet'
import { divIcon, type LeafletEventHandlerFnMap } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { memo, useMemo } from 'react'
import { mobScale, pullContainsMobSpawn } from '../../util/mobSpawns.ts'
import {
  useAppDispatch,
  useHoveredMobSpawn,
  useHoverSelector,
  useMapObjectsHidden,
  useRoute,
} from '../../store/hooks.ts'
import { toggleSpawn } from '../../store/routes/routesReducer.ts'
import { MobIcon } from './MobIcon.tsx'
import { MobSpawnTooltip } from './MobSpawnTooltip.tsx'
import { hoverSpawn, selectSpawn } from '../../store/reducers/hoverReducer.ts'
import { MobSpawn } from '../../data/types.ts'
import { BossMarker } from './BossMarker.tsx'
import { Patrol } from './Patrol.tsx'

interface MobSpawnProps {
  iconScaling: number
  mobSpawn: MobSpawn
}

interface MobSpawnMemoProps extends MobSpawnProps {
  isHovered: boolean
  isGroupHovered: boolean
  matchingPullIndex: number | null
}

function MobSpawnComponent({
  iconScaling,
  mobSpawn,
  isHovered,
  isGroupHovered,
  matchingPullIndex,
}: MobSpawnMemoProps) {
  const { mob, spawn } = mobSpawn
  const dispatch = useAppDispatch()
  const isBoxHovering = useHoverSelector((state) => state.isBoxHovering)
  const isActuallyHovered = isHovered && !isBoxHovering
  const iconSize = iconScaling * mobScale(mobSpawn) * (isActuallyHovered ? 1.2 : 1)
  const hidden = useMapObjectsHidden()

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
      contextmenu: () => dispatch(selectSpawn(spawn.id)),
      mouseover: () => dispatch(hoverSpawn(spawn.id)),
      mouseout: () => dispatch(hoverSpawn(null)),
    }),
    [dispatch, spawn],
  )

  return (
    <div>
      <Marker
        position={spawn.pos}
        riseOnHover
        eventHandlers={eventHandlers}
        icon={divIcon({
          className: `fade-in-map-object ${hidden ? 'opacity-0' : 'opacity-1'}`,
          popupAnchor: [100, 0],
          iconUrl: `/npc_portaits/${mob.id}.png`,
          iconSize: [iconSize, iconSize],
          html: renderToString(
            <MobIcon
              mobSpawn={mobSpawn}
              iconScaling={iconScaling}
              isGroupHovered={isGroupHovered && !isBoxHovering}
              matchingPullIndex={matchingPullIndex}
            />,
          ),
        })}
      >
        {!isBoxHovering && <MobSpawnTooltip mob={mob} spawn={spawn} iconScaling={iconScaling} />}
      </Marker>
      {mob.isBoss && (
        <BossMarker
          spawn={spawn}
          isHovered={isActuallyHovered}
          iconSize={iconSize}
          hidden={hidden}
        />
      )}
      <Patrol spawn={spawn} isGroupHovered={isGroupHovered} />
    </div>
  )
}

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawnWrapper({ iconScaling, mobSpawn }: MobSpawnProps) {
  const route = useRoute()

  const hoveredMobSpawn = useHoveredMobSpawn()
  const isHovered = !!hoveredMobSpawn && hoveredMobSpawn.spawn.id === mobSpawn.spawn.id
  const isGroupHovered =
    isHovered ||
    (!!hoveredMobSpawn &&
      hoveredMobSpawn.spawn.group !== null &&
      hoveredMobSpawn.spawn.group === mobSpawn.spawn.group)

  const matchingPullIndex = useMemo(() => {
    const index = route.pulls.findIndex((pull) => pullContainsMobSpawn(pull, mobSpawn.spawn.id))
    return index !== -1 ? index : null
  }, [route.pulls, mobSpawn])

  return (
    <MobSpawnMemo
      iconScaling={iconScaling}
      mobSpawn={mobSpawn}
      isHovered={isHovered}
      isGroupHovered={isGroupHovered}
      matchingPullIndex={matchingPullIndex}
    />
  )
}
