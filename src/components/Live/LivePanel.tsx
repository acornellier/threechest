import { Panel } from '../Common/Panel.tsx'
import { Button } from '../Common/Button.tsx'
import { StopIcon } from '@heroicons/react/24/solid'
import { mobCountPercentStr } from '../../util/numbers.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { useMemo } from 'react'
import { countMobs } from '../../util/mobSpawns.ts'
import { PullDetailed } from '../../util/types.ts'
import { useDungeon, useRoute } from '../../store/routes/routeHooks.ts'
import { setMapMode } from '../../store/reducers/mapReducer.ts'
import { TotalCount } from '../Sidebar/Pulls/TotalCount.tsx'

interface Props {
  pull: PullDetailed
  prevPull: PullDetailed | undefined
  pullsDetailed: PullDetailed[]
}

const livePanelWidth = 300
const livePanelRightOffset = 32
export const livePanelRight = livePanelWidth + livePanelRightOffset

export function LivePanel({ pull, prevPull, pullsDetailed }: Props) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const route = useRoute()
  const sortedCounts = useMemo(() => countMobs(pull, dungeon), [pull, dungeon])

  return (
    <div
      className="fixed z-[10000]  top-1/2"
      style={{ transform: 'translateY(-50%)', width: livePanelWidth, right: livePanelRightOffset }}
    >
      <Panel className="text-lg" innerClass="gap-3 px-3">
        Live: {route.name}
        <div>
          <div className="text-sm">Before pull</div>
          <TotalCount pullsDetailed={pullsDetailed} curPullIndex={prevPull?.index ?? -1} />
        </div>
        <div>
          <div className="rounded bg-fancy-red mb-1 min-w-6 text-center">
            <b>Pull {pull.index + 1}</b> - Forces: <b>{pull?.count ?? 0}</b> (
            {mobCountPercentStr(pull?.count ?? 0, dungeon.mdt.totalCount)})
          </div>
          {sortedCounts.map(({ mob, count }) => (
            <div key={mob.id} className="flex gap-2">
              <img
                className="rounded-full w-6"
                src={`/npc_portraits/${mob.id}.png`}
                alt={mob.name}
              />
              {count}x {mob.name}
            </div>
          ))}
        </div>
        <div>
          <div className="text-sm">After pull</div>
          <TotalCount pullsDetailed={pullsDetailed} curPullIndex={pull.index} />
        </div>
        <Button Icon={StopIcon} outline short onClick={() => dispatch(setMapMode('editing'))}>
          End live route
        </Button>
      </Panel>
    </div>
  )
}
