import { mobCountPercentStr } from '../../../util/numbers.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useHoveredPull } from '../../../store/reducers/hoverReducer.ts'
import { PullDetailed } from '../../../util/types.ts'

interface Props {
  pullsDetailed: PullDetailed[]
  curPullIndex?: number
}

export function TotalCount({ pullsDetailed, curPullIndex }: Props) {
  const dungeon = useDungeon()
  const hoveredPull = useHoveredPull()
  const clampedHoveredPull =
    curPullIndex ??
    Math.min(Math.max(hoveredPull ?? pullsDetailed.length - 1, 0), pullsDetailed.length - 1)
  const totalCount = pullsDetailed[clampedHoveredPull]?.countCumulative ?? 0
  const percent = (totalCount / dungeon.mdt.totalCount) * 100

  return (
    <div className="flex-1 relative flex justify-center rounded-sm font-bold border border-gray-400">
      <div
        className="gritty absolute left-0 max-w-full h-full z-[-1]"
        style={{
          backgroundColor: percent >= 102 ? '#e21e1e' : percent >= 100 ? '#0f950f' : '#426bff',
          width: `${percent}%`,
        }}
      />
      <div className="text-outline">
        {totalCount}/{dungeon.mdt.totalCount} -{' '}
        {mobCountPercentStr(totalCount, dungeon.mdt.totalCount)}
      </div>
    </div>
  )
}
