import { Button } from '../../Common/Button.tsx'
import { PlusIcon } from '@heroicons/react/24/outline'
import { addPull } from '../../../store/routes/routesReducer.ts'
import { shortcuts } from '../../../data/shortcuts.ts'
import { Panel } from '../../Common/Panel.tsx'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { TotalCount } from './TotalCount.tsx'
import { useDungeon, useRoute, useSelectedPull } from '../../../store/routes/routeHooks.ts'
import { useMemo } from 'react'
import { augmentPulls } from './augmentPulls.ts'
import { PullList } from './PullList.tsx'
import { PullDetailed } from '../../../util/types.ts'

export function MiniPulls() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const selectedPull = useSelectedPull()
  const pullsDetailed = useMemo(() => augmentPulls(route.pulls, dungeon), [route.pulls, dungeon])
  const threePulls = [
    pullsDetailed[selectedPull - 1],
    pullsDetailed[selectedPull],
    pullsDetailed[selectedPull + 1],
  ].filter(Boolean) as PullDetailed[]

  return (
    <Panel>
      <TotalCount pullsDetailed={pullsDetailed} alwaysShowTotal />
      <PullList pullsDetailed={threePulls} disableSorting />
      <Button
        short
        Icon={PlusIcon}
        onClick={() => dispatch(addPull())}
        shortcut={shortcuts.addPull[0]}
      >
        Add pull
      </Button>
    </Panel>
  )
}
