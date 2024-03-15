import { Pull as PullComponent } from './Pull.tsx'
import { ItemInterface, ReactSortable } from 'react-sortablejs'
import type { PullDetailed } from '../../../util/types.ts'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useDungeon, useHoveredPull, useRoute } from '../../../store/hooks.ts'
import { addPull, clearRoute, selectPull, setPulls } from '../../../store/routesReducer.ts'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { PullContextMenu } from './PullContextMenu.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'
import { Panel } from '../../Common/Panel.tsx'
import { augmentPulls } from '../../../store/augmentPulls.ts'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'
import { useKeyHeld } from '../../../hooks/useKeyHeld.ts'

type SortablePull = PullDetailed & ItemInterface

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const [ghostPullIndex, setGhostPullIndex] = useState<number | null>(null)
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])
  const isShiftHeld = useKeyHeld('Shift')
  usePullShortcuts()

  const hoveredPull = useHoveredPull()
  const clampedHoveredPull = hoveredPull
    ? Math.min(Math.max(hoveredPull, 0), pullsDetailed.length - 1)
    : pullsDetailed.length - 1
  const totalCount = pullsDetailed[clampedHoveredPull]?.countCumulative ?? 0

  const pullsWithGhost = useMemo(() => {
    const pulls: SortablePull[] = [...pullsDetailed]
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
  }, [pullsDetailed, ghostPullIndex])

  const setPullsWrapper = useCallback(
    (pulls: SortablePull[]) => {
      if (pulls.every((pull, idx) => pull.id === pullsWithGhost[idx]!.id)) return

      dispatch(setPulls(pulls.filter(({ filtered }) => !filtered)))
    },
    [dispatch, pullsWithGhost],
  )

  const [contextMenuPullIndex, setContextMenuPullIndex] = useState<number>(0)
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu()

  const onRightClickPull = useCallback(
    (e: MouseEvent, pullIndex: number) => {
      dispatch(selectPull(pullIndex))
      setContextMenuPullIndex(pullIndex)
      onRightClick(e)
    },
    [dispatch, onRightClick],
  )

  const percent = (totalCount / dungeon.mdt.totalCount) * 100

  let pullIndex = 0
  return (
    <Panel noRightBorder className="overflow-auto select-none">
      <div className="flex-1 relative flex justify-center mx-2 rounded-sm font-bold border border-gray-400">
        <div
          className="gritty absolute left-0 max-w-full h-full z-[-1]"
          style={{
            backgroundColor: percent >= 102 ? '#e21e1e' : percent >= 100 ? '#0f950f' : '#426bff',
            width: `${percent}%`,
          }}
        />
        <div>
          {totalCount}/{dungeon.mdt.totalCount} -{' '}
          {mobCountPercentStr(totalCount, dungeon.mdt.totalCount)}
        </div>
      </div>
      <ReactSortable
        onStart={(e) => e.oldIndex !== undefined && setGhostPullIndex(e.oldIndex)}
        onEnd={() => setGhostPullIndex(null)}
        list={pullsWithGhost}
        setList={setPullsWrapper}
        className="flex flex-col relative overflow-auto"
      >
        {pullsWithGhost.map((pull) => (
          <PullComponent
            key={pull.id}
            pullIndex={pull.id === -1 ? pullIndex : pullIndex++}
            pull={pull}
            ghost={pull.filtered}
            onRightClick={onRightClickPull}
            isShiftHeld={isShiftHeld}
          />
        ))}
      </ReactSortable>
      <div className="flex gap-1">
        <Button
          className="grow"
          Icon={PlusIcon}
          onClick={() => dispatch(addPull())}
          shortcut={shortcuts.addPull[0]}
        >
          Add pull
        </Button>
        <Button onClick={() => dispatch(clearRoute())}>
          <ClearIcon />
          Clear
        </Button>
      </div>
      {contextMenuPosition && (
        <PullContextMenu
          position={contextMenuPosition}
          pullIndex={contextMenuPullIndex}
          onClose={() => onClose()}
        />
      )}
    </Panel>
  )
}
