import { useMemo } from 'react'
import { Button } from '../../Common/Button.tsx'
import { addPull, deletePull } from '../../../store/routes/routesReducer.ts'
import { Panel } from '../../Common/Panel.tsx'
import { augmentPulls } from './augmentPulls.ts'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { shortcuts } from '../../../data/shortcuts.ts'
import { PullList } from './PullList.tsx'
import { useDungeon, useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { TotalCount } from './TotalCount.tsx'
import { usePullShortcuts } from './usePullShortcuts.ts'

export function Pulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])

  usePullShortcuts()

  return (
    <Panel noRightBorder className="overflow-auto select-none">
      <TotalCount pullsDetailed={pullsDetailed} />
      <PullList pullsDetailed={pullsDetailed} />
      <div className="flex gap-1">
        <Button
          className="grow"
          Icon={PlusIcon}
          onClick={() => dispatch(addPull())}
          shortcut={shortcuts.addPull[0]}
        >
          Add pull
        </Button>
        <Button
          Icon={TrashIcon}
          onClick={() => dispatch(deletePull({}))}
          shortcut={shortcuts.deletePull[0]}
        ></Button>
      </div>
    </Panel>
  )
}
