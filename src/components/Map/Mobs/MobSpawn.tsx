import { Marker, useMap } from 'react-leaflet'
import { type LeafletEventHandlerFnMap } from 'leaflet'
import { scaledDivIcon } from '../../../util/scaledIcon.ts'
import { mapIconScaling } from '../../../util/map.ts'
import { renderToString } from 'react-dom/server'
import { memo, useMemo } from 'react'
import { mobScale } from '../../../util/mobSpawns.ts'
import { toggleSpawn } from '../../../store/routes/routesReducer.ts'
import { MobIcon } from './MobIcon.tsx'
import { MobSpawnTooltip } from './MobSpawnTooltip.tsx'
import {
  hoverSpawn,
  selectHoveredKicks,
  selectIsBoxHovering,
  selectSpawn,
  useHoveredMobSpawn,
} from '../../../store/reducers/hoverReducer.ts'
import type { MobSpawn } from '../../../data/types.ts'
import { useRoute, useSelectedPull } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { selectIsLive, useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { Patrol } from './Patrol.tsx'
import { BossMarker } from './BossMarker.tsx'
import { useIconScaling } from '../../../util/hooks/useIconScaling.ts'
import type { WowMark } from '../../../util/marks.ts'
import { MarkMarker } from './MarkMarker.tsx'
import { CcMarker } from './CcMarker.tsx'
import { MarkContextMenu, markerPopupMinHeight, markerPopupMinWidth } from './MarkContextMenu.tsx'
import { Delayed } from '../../Common/Delayed.tsx'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import {
  mobMatchesSearch,
  selectMobSearchTermNormalized,
} from '../../../store/reducers/mobSearchReducer.ts'

interface MobSpawnProps {
  mobSpawn: MobSpawn
  isCtrlKeyDown: boolean
  isAltKeyDown: boolean
  isKKeyDown: boolean
}

interface MobSpawnMemoProps extends MobSpawnProps {
  isSelected: boolean
  isHovered: boolean
  isGroupHovered: boolean
  matchingPullIndex: number | null
  hidden: boolean
  faded: boolean
  mark: WowMark | null
  ccSpellId: number | null
  isCtrlKeyDown: boolean
  isAltKeyDown: boolean
  isSearchMatch: boolean
  isSearchDimmed: boolean
}

function MobSpawnComponent({
  mobSpawn,
  isSelected,
  isHovered,
  isGroupHovered,
  matchingPullIndex,
  hidden,
  faded,
  mark,
  ccSpellId,
  isCtrlKeyDown,
  isAltKeyDown,
  isKKeyDown,
  isSearchMatch,
  isSearchDimmed,
}: MobSpawnMemoProps) {
  const { mob, spawn } = mobSpawn
  const dispatch = useAppDispatch()
  const isDrawing = useRootSelector((state) => state.map.mapMode === 'drawing')
  const isBoxHovering = useRootSelector(selectIsBoxHovering)
  const disableHover = isDrawing || isBoxHovering
  const isActuallyHovered = isHovered && !disableHover
  const isHoveringKicks = useRootSelector(selectHoveredKicks)
  const showKicks = isKKeyDown || isHoveringKicks
  const {
    contextMenuPosition: markingMenuPosition,
    onRightClick: onOpenMarking,
    onClose: onCloseMarking,
  } = useContextMenu({ minHeight: markerPopupMinHeight, minWidth: markerPopupMinWidth })

  // Icon sizes come from CSS off --icon-scaling; iconSize below only feeds tooltipAnchor, which
  // Leaflet needs as a number. Call useIconScaling() to re-render on zoomend but read the map's
  // live zoom, so the anchor is right even if we render mid-zoom.
  useIconScaling()
  const map = useMap()
  const scale = mobScale(mobSpawn)
  const boxScale = isActuallyHovered ? 1.15 : 1
  const iconSize = mapIconScaling(map) * scale * boxScale

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
      contextmenu: (e) => {
        if (e.originalEvent.ctrlKey) {
          onOpenMarking(e.originalEvent)
        } else {
          dispatch(selectSpawn(spawn.id))
        }
      },
      mouseover: () => dispatch(hoverSpawn(spawn.id)),
      mouseout: (e) => {
        const target = e.originalEvent.target as HTMLElement
        target.blur()
        dispatch(hoverSpawn(null))
      },
    }),
    [dispatch, onOpenMarking, spawn.id],
  )

  const mobIcon = useMemo(
    () => (
      <MobIcon
        mobSpawn={mobSpawn}
        showKicks={showKicks}
        showCount={(isGroupHovered && !disableHover) || isCtrlKeyDown}
        showGroup={isAltKeyDown && mobSpawn.spawn.group !== null && !isBoxHovering}
        isSelected={isSelected}
        isSearchMatch={isSearchMatch}
        matchingPullIndex={matchingPullIndex}
        faded={faded}
      />
    ),
    [
      disableHover,
      faded,
      isGroupHovered,
      isSelected,
      isSearchMatch,
      matchingPullIndex,
      mobSpawn,
      isCtrlKeyDown,
      isAltKeyDown,
      isBoxHovering,
      showKicks,
    ],
  )

  const icon = useMemo(() => {
    return scaledDivIcon(
      {
        className: `mob-spawn-icon fade-in-map-object`,
        tooltipAnchor: [iconSize / 2, 0],
        html: renderToString(mobIcon),
      },
      { scale, boxScale },
    )
  }, [iconSize, mobIcon, scale, boxScale])

  return (
    <>
      <Marker
        position={spawn.pos}
        zIndexOffset={isActuallyHovered ? 1000 : isSearchMatch ? 500 : 0}
        eventHandlers={eventHandlers}
        opacity={hidden ? 0 : isSearchDimmed ? 0.25 : faded ? 0.5 : 1}
        icon={icon}
      >
        <Delayed delay={300}>
          <MobSpawnTooltip mob={mob} spawn={spawn} hidden={disableHover} />
        </Delayed>
      </Marker>
      {markingMenuPosition && (
        <MarkContextMenu
          spawnId={spawn.id}
          contextMenuPosition={markingMenuPosition}
          onClose={onCloseMarking}
        />
      )}
      {mob.isBoss && (
        <BossMarker
          spawn={spawn}
          isHovered={isActuallyHovered}
          scale={scale}
          boxScale={boxScale}
          hidden={hidden}
        />
      )}
      {mark && <MarkMarker spawn={spawn} scale={scale} boxScale={boxScale} mark={mark} />}
      {ccSpellId !== null && (
        <CcMarker spawn={spawn} scale={scale} boxScale={boxScale} spellId={ccSpellId} />
      )}
      <Patrol spawn={spawn} isGroupHovered={isGroupHovered} hidden={hidden} />
    </>
  )
}

const MobSpawnMemo = memo(MobSpawnComponent)

export function MobSpawnWrapper({
  mobSpawn,
  isCtrlKeyDown,
  isAltKeyDown,
  isKKeyDown,
}: MobSpawnProps) {
  const route = useRoute()

  // Delay each individual mob by up to 100ms for performance and because it looks cool
  const hidden = useMapObjectsHidden(0, 100)
  const isLive = useRootSelector(selectIsLive)

  const selectedPull = useSelectedPull()
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

  const isSelected = matchingPullIndex !== null && selectedPull === matchingPullIndex
  const faded = isLive && matchingPullIndex !== null && matchingPullIndex < selectedPull
  const mark = route.assignments?.[mobSpawn.spawn.id] ?? null
  const ccSpellId = route.ccSpawns?.[mobSpawn.spawn.id] ?? null

  const searchTerm = useRootSelector(selectMobSearchTermNormalized)
  const isSearchMatch = mobMatchesSearch(mobSpawn.mob, searchTerm)
  const isSearchDimmed = !!searchTerm && !isSearchMatch

  return (
    <MobSpawnMemo
      mobSpawn={mobSpawn}
      isSelected={isSelected}
      isHovered={isHovered}
      isGroupHovered={isGroupHovered}
      matchingPullIndex={matchingPullIndex}
      hidden={hidden}
      faded={faded}
      mark={mark}
      ccSpellId={ccSpellId}
      isCtrlKeyDown={isCtrlKeyDown}
      isAltKeyDown={isAltKeyDown}
      isKKeyDown={isKKeyDown}
      isSearchMatch={isSearchMatch}
      isSearchDimmed={isSearchDimmed}
    />
  )
}
