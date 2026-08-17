import { Pull } from './Pull.tsx'
import { useKeyHeld } from '../../../util/hooks/useKeyHeld.ts'
import type { PullDetailed } from '../../../util/types.ts'
import type { ItemInterface } from 'react-sortablejs'
import { ReactSortable } from 'react-sortablejs'
import { useCallback, useMemo, useState } from 'react'
import { selectPull, setPulls } from '../../../store/routes/routesReducer.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import {
  PullContextMenu,
  pullContextMenuMinHeight,
  pullContextMenuMinWidth,
} from './PullContextMenu.tsx'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import { PullTooltip } from './PullTooltip.tsx'
import type { RouteComparison } from '../../../util/compareRoutes.ts'
import type { OrphanRow, PullCompareInfo } from './compareRows.ts'
import { buildCompareInfo, buildOrphanRows } from './compareRows.ts'
import { CompareOrphanPull } from './CompareOrphanPull.tsx'

type SortablePull = PullDetailed &
  ItemInterface & {
    compare?: PullCompareInfo
    orphan?: OrphanRow
  }

interface Props {
  pullsDetailed: PullDetailed[]
  comparePullsDetailed?: PullDetailed[]
  comparison?: RouteComparison | null
  disableSorting?: boolean
}

export function PullList({
  pullsDetailed,
  comparePullsDetailed,
  comparison,
  disableSorting,
}: Props) {
  const dispatch = useAppDispatch()
  const hoveredPull = useHoveredPull()
  const hoveredPullDetailed = pullsDetailed.find(({ index }) => index === hoveredPull)
  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)
  const isShiftHeld = useKeyHeld('Shift')
  const [contextMenuPullIndex, setContextMenuPullIndex] = useState<number>(0)
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu({
    minHeight: pullContextMenuMinHeight,
    minWidth: pullContextMenuMinWidth,
  })

  const pullsWithCompare = useMemo<SortablePull[]>(() => {
    if (!comparison || !comparePullsDetailed) return pullsDetailed

    const compareInfo = buildCompareInfo(comparison, comparePullsDetailed)
    const orphansByAnchor = buildOrphanRows(comparison, comparePullsDetailed)

    const orphanRows = (anchor: number): SortablePull[] =>
      (orphansByAnchor.get(anchor) ?? []).map((orphan) => ({
        ...orphan.comparePull,
        id: -(orphan.comparePullIndex + 2),
        filtered: true,
        orphan,
      }))

    return [
      ...orphanRows(-1),
      ...pullsDetailed.flatMap((pull, index) => [
        { ...pull, compare: compareInfo[index] },
        ...orphanRows(index),
      ]),
    ]
  }, [comparePullsDetailed, comparison, pullsDetailed])

  // Sortable works in list indices, which stop matching pull indices once orphans are interleaved.
  const sortingDisabled = disableSorting || !!comparison

  const pullsWithGhost = useMemo(() => {
    const pulls: SortablePull[] = [...pullsWithCompare]
    if (sortingDisabled) return pulls
    if (ghostPullIndex !== null) {
      const ghostPull = pullsWithCompare[ghostPullIndex]
      if (ghostPull) {
        pulls.splice(ghostPullIndex + 1, 0, {
          ...ghostPull,
          id: -1,
          filtered: true,
        })
      }
    }
    return pulls
  }, [sortingDisabled, pullsWithCompare, ghostPullIndex])

  const setPullsWrapper = useCallback(
    (pulls: SortablePull[]) => {
      if (pulls.every((pull, idx) => pull.id === pullsWithGhost[idx]!.id)) return

      dispatch(setPulls(pulls.filter(({ filtered }) => !filtered)))
    },
    [dispatch, pullsWithGhost],
  )

  const onRightClickPull = useCallback(
    (e: MouseEvent, pullIndex: number) => {
      dispatch(selectPull(pullIndex))
      setContextMenuPullIndex(pullIndex)
      onRightClick(e)
    },
    [dispatch, onRightClick],
  )

  return (
    <>
      <ReactSortable
        className="flex flex-col relative overflow-auto h-fit"
        disabled={sortingDisabled}
        filter=".sortable-filter"
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={(e) => {
          setGhostPullIndex(null)
          if (e.newIndex !== undefined && ghostPullIndex !== null) {
            dispatch(selectPull(e.newIndex > ghostPullIndex ? e.newIndex - 1 : e.newIndex))
          }
        }}
        list={pullsWithGhost}
        setList={setPullsWrapper}
        delay={100}
        delayOnTouchOnly
      >
        {pullsWithGhost.map((pull) =>
          pull.orphan ? (
            <CompareOrphanPull
              key={pull.id}
              comparePull={pull.orphan.comparePull}
              comparePullIndex={pull.orphan.comparePullIndex}
              isShiftHeld={isShiftHeld}
            />
          ) : (
            <Pull
              key={pull.id}
              pull={pull}
              ghost={pull.filtered}
              compare={pull.compare}
              onRightClick={onRightClickPull}
              isShiftHeld={isShiftHeld}
            />
          ),
        )}
      </ReactSortable>
      {contextMenuPosition && (
        <PullContextMenu
          position={contextMenuPosition}
          pullIndex={contextMenuPullIndex}
          onClose={() => onClose()}
          minHeight={pullContextMenuMinHeight}
          minWidth={pullContextMenuMinWidth}
        />
      )}
      <TooltipStyled id="pull-tooltip" place="left-start" positionStrategy="fixed">
        {hoveredPullDetailed ? <PullTooltip pull={hoveredPullDetailed} /> : null}
      </TooltipStyled>
    </>
  )
}
