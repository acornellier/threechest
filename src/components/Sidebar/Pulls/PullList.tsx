﻿import { Pull } from './Pull.tsx'
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

type SortablePull = PullDetailed & ItemInterface

interface Props {
  pullsDetailed: PullDetailed[]
  disableSorting?: boolean
}

export function PullList({ pullsDetailed, disableSorting }: Props) {
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

  const pullsWithGhost = useMemo(() => {
    const pulls: SortablePull[] = [...pullsDetailed]
    if (disableSorting) return pulls
    if (ghostPullIndex !== null) {
      const ghostPull = pullsDetailed[ghostPullIndex]
      if (ghostPull) {
        pulls.splice(ghostPullIndex + 1, 0, {
          ...ghostPull,
          id: -1,
          filtered: true,
        })
      }
    }
    return pulls
  }, [disableSorting, pullsDetailed, ghostPullIndex])

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
        disabled={disableSorting}
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
        {pullsWithGhost.map((pull) => (
          <Pull
            key={pull.id}
            pull={pull}
            ghost={pull.filtered}
            onRightClick={onRightClickPull}
            isShiftHeld={isShiftHeld}
          />
        ))}
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
