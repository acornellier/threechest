import { useCallback, useMemo, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { addPull, clearRoute, selectPull } from '../../../store/routes/routesReducer.ts'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { PullContextMenu } from './PullContextMenu.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'
import { Panel } from '../../Common/Panel.tsx'
import { augmentPulls } from './augmentPulls.ts'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'
import { PullList } from './PullList.tsx'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import { useDungeon, useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])
  usePullShortcuts()

  const hoveredPull = useHoveredPull()
  const clampedHoveredPull = hoveredPull
    ? Math.min(Math.max(hoveredPull, 0), pullsDetailed.length - 1)
    : pullsDetailed.length - 1
  const totalCount = pullsDetailed[clampedHoveredPull]?.countCumulative ?? 0

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
      <PullList pullsDetailed={pullsDetailed} onRightClickPull={onRightClickPull} />
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
