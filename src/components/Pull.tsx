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
      className={`pull ${isSelectedPull ? 'selected' : ''}`}
      style={{ backgroundColor: pull.color }}
      onClick={() => dispatch({ type: 'select_pull', pullIndex })}
    >
      {isSelectedPull && <div className="pull-selected-highlight" />}
      <div className="pull-inner">
        <div className="flex">
          <div className="pull-idx">{pullIndex + 1}</div>
          <div className="pull-mobs">
            {Object.entries(mobCounts).map(([, { mob, count }]) => (
              <div key={mob.id} className="pull-mob-icon" style={{ borderWidth: 0.05 }}>
                <img src={`/vp/npc/${mob.id}.png`} alt="" />
                <div className="pull-mob-icon-count">x{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div>{roundTo(percent, 2).toLocaleString()}%</div>
      </div>
    </div>
  )
}
