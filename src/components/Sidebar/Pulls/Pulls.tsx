import { useCallback, useMemo, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { addPull, clearRoute, selectPull } from '../../../store/routes/routesReducer.ts'
import { PullContextMenu } from './PullContextMenu.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'
import { Panel } from '../../Common/Panel.tsx'
import { augmentPulls } from './augmentPulls.ts'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useContextMenu } from '../../Common/useContextMenu.ts'
import { ClearIcon } from '../../Common/Icons/ClearIcon.tsx'
import { shortcuts } from '../../../data/shortcuts.ts'
import { PullList } from './PullList.tsx'
import { useDungeon, useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { TotalCount } from './TotalCount.tsx'

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])
  const [contextMenuPullIndex, setContextMenuPullIndex] = useState<number>(0)
  const { contextMenuPosition, onRightClick, onClose } = useContextMenu()

  usePullShortcuts()

  const onRightClickPull = useCallback(
    (e: MouseEvent, pullIndex: number) => {
      dispatch(selectPull(pullIndex))
      setContextMenuPullIndex(pullIndex)
      onRightClick(e)
    },
    [dispatch, onRightClick],
  )

  return (
    <Panel noRightBorder className="overflow-auto select-none">
      <TotalCount pullsDetailed={pullsDetailed} />
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
