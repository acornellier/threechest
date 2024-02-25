import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { PullDetailed } from '../code/types.ts'
import { roundTo } from '../code/stuff.ts'
import { Mob } from '../data/types.ts'

type MobCount = Record<number, { mob: Mob; count: number }>

export function Pull({ pullIndex, pull }: { pullIndex: number; pull: PullDetailed }) {
  const { route, dungeon, dispatch } = useRouteContext()

  const isSelectedPull = pullIndex === route.selectedPull
  const percent = (pull.count / dungeon.mdt.totalCount) * 100

  const mobCounts = pull.mobSpawns.reduce<MobCount>((acc, { mob }) => {
    acc[mob.id] ??= { mob, count: 0 }
    acc[mob.id].count += 1
    return acc
  }, {})

  return (
    <div
      className="pull relative h-8 cursor-pointer"
      style={{ backgroundColor: pull.color }}
      onClick={() => dispatch({ type: 'select_pull', pullIndex })}
    >
      {isSelectedPull && <div className="absolute w-full h-full pull-selected-highlight" />}
      <div className="flex justify-between py-0.5 px-1 h-full">
        <div className="flex">
          <div className="min-w-4 mr-1">{pullIndex + 1}</div>
          <div className="flex h-full items-center">
            {Object.entries(mobCounts).map(([, { mob, count }]) => (
              <div
                key={mob.id}
                className="relative h-6 w-full mr-[-3px] rounded-full border border-slate-300"
                style={{ borderWidth: 0.05 }}
              >
                <img className="h-full rounded-full" src={`/vp/npc/${mob.id}.png`} alt="" />
                <div className="absolute bottom-[-3px] w-full text-white text-xs text-center">
                  x{count}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>{roundTo(percent, 2).toLocaleString()}%</div>
      </div>
    </div>
  )
}
