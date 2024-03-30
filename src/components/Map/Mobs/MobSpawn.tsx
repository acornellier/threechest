import { Marker } from 'react-leaflet'
import { divIcon, type LeafletEventHandlerFnMap } from 'leaflet'
import { renderToString } from 'react-dom/server'
import { memo, useMemo } from 'react'
import { mobScale } from '../../../util/mobSpawns.ts'
import { toggleSpawn } from '../../../store/routes/routesReducer.ts'
import { MobIcon } from './MobIcon.tsx'
import { MobSpawnTooltip } from './MobSpawnTooltip.tsx'
import {
  hoverSpawn,
  selectIsBoxHovering,
  selectSpawn,
  useHoveredMobSpawn,
} from '../../../store/reducers/hoverReducer.ts'
import { MobSpawn } from '../../../data/types.ts'
import { useRoute, useSelectedPull } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { Delayed } from '../../Common/Delayed.tsx'
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
  hidden: boolean
}

function MobSpawnComponent({
  iconScaling,
  mobSpawn,
  isHovered,
  isGroupHovered,
  matchingPullIndex,
  hidden,
}: MobSpawnMemoProps) {
  const { mob, spawn } = mobSpawn
  const dispatch = useAppDispatch()
  const isDrawing = useRootSelector((state) => state.map.isDrawing)
  const isBoxHovering = useRootSelector(selectIsBoxHovering)
  const disableHover = isDrawing || isBoxHovering
  const selectedPull = useSelectedPull()
  const isActuallyHovered = isHovered && !disableHover
  const iconSize = iconScaling * mobScale(mobSpawn) * (isActuallyHovered ? 1.15 : 1)

  const eventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      click: (e) => {
        dispatch(
          toggleSpawn({
            spawn: spawn.id,
            individual: e.originalEvent.ctrlKey || e.originalEvent.metaKey,
            newPull: e.originalEvent.shiftKey,
          }),
        )
      },
      contextmenu: () => dispatch(selectSpawn(spawn.id)),
      mouseenter: () => dispatch(hoverSpawn(spawn.id)),
      mouseleave: () => dispatch(hoverSpawn(null)),
    }),
    [dispatch, spawn],
  )

  return (
    <>
      <Marker
        position={spawn.pos}
        zIndexOffset={isActuallyHovered ? 1000 : 0}
        eventHandlers={eventHandlers}
        opacity={hidden ? 0 : 1}
        icon={divIcon({
          className: `mob-spawn-icon fade-in-map-object`,
          popupAnchor: [100, 0],
          iconUrl: `/npc_portaits/${mob.id}.png`,
          iconSize: [iconSize, iconSize],
          html: renderToString(
            <MobIcon
              mobSpawn={mobSpawn}
              iconScaling={iconScaling}
              isGroupHovered={isGroupHovered && !disableHover}
              isSelected={selectedPull === matchingPullIndex}
              matchingPullIndex={matchingPullIndex}
            />,
          ),
        })}
      >
        <Delayed delay={300}>
          <MobSpawnTooltip
            mob={mob}
            spawn={spawn}
            iconScaling={iconScaling}
            hidden={disableHover}
          />
        </Delayed>
      </Marker>
      {mob.isBoss && (
        <BossMarker
          spawn={spawn}
          isHovered={isActuallyHovered}
          iconSize={iconSize}
          hidden={hidden}
        />
      )}
      <Patrol spawn={spawn} isGroupHovered={isGroupHovered} hidden={hidden} />
    </>
  )
}

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawnWrapper({ iconScaling, mobSpawn }: MobSpawnProps) {
  const route = useRoute()

  // Delay each individual mob by up to 100ms for performance and because it looks cool
  const hidden = useMapObjectsHidden(0, 100)

  const hoveredMobSpawn = useHoveredMobSpawn()
  const isHovered = !!hoveredMobSpawn && hoveredMobSpawn.spawn.id === mobSpawn.spawn.id
  const isGroupHovered =
    isHovered ||
    (!!hoveredMobSpawn &&
      hoveredMobSpawn.spawn.group !== null &&
      hoveredMobSpawn.spawn.group === mobSpawn.spawn.group)

  const matchingPullIndex = useMemo(() => {
    const index = route.pulls.findIndex((pull) => pull.spawns.includes(mobSpawn.spawn.id))
    return index !== -1 ? index : null
  }, [route.pulls, mobSpawn])

  return (
    <MobSpawnMemo
      iconScaling={iconScaling}
      mobSpawn={mobSpawn}
      isHovered={isHovered}
      isGroupHovered={isGroupHovered}
      matchingPullIndex={matchingPullIndex}
      hidden={hidden}
    />
  )
}
