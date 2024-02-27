import { useRoute } from '../RouteContext/UseRoute.ts'
import { PullDetailed } from '../../code/types.ts'
import { roundTo } from '../../code/util.ts'
import { Mob } from '../../data/types.ts'
import { adjustColor } from '../../code/colors.ts'

type MobCount = Record<number, { mob: Mob; count: number }>

interface Props {
  pullIndex: number
  pull: PullDetailed
  ghost?: boolean
}

export function Pull({ pullIndex, pull, ghost }: Props) {
  const { route, dungeon, dispatch } = useRoute()

  const isSelectedPull = pullIndex === route.selectedPull
  const percent = (pull.count / dungeon.mdt.totalCount) * 100

  const mobCounts = pull.mobSpawns.reduce<MobCount>((acc, { mob }) => {
    acc[mob.id] ??= { mob, count: 0 }
    acc[mob.id].count += 1
    return acc
  }, {})

  return (
    <div
      className="pull relative h-8 cursor-pointer bg-contain bg-blend-overlay bg-no-repeat"
      style={{
        backgroundColor: ghost ? 'grey' : adjustColor(pull.color, -25),
        backgroundImage: 'url(/wow/UI-Listbox-Highlight2.png)',
      }}
      onClick={() => dispatch({ type: 'select_pull', pullIndex })}
    >
      {isSelectedPull && (
        <div
          className="absolute w-full h-full border-[1.5px] rounded-md"
          style={{
            borderColor: adjustColor(pull.color, -75),
            boxShadow: `inset 0 0 4px 4px ${adjustColor(pull.color, +100)}`,
          }}
        />
      )}
      <div className="flex justify-between py-0.5 px-2 h-full">
        <div className="flex">
          <div className="min-w-4 mr-1">{ghost ? pullIndex : pullIndex + 1}</div>
          <div className="flex h-full items-center">
            {Object.entries(mobCounts).map(([, { mob, count }]) => (
              <div
                key={mob.id}
                className="relative h-7 w-7 mr-[-3px] rounded-full border border-slate-300"
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
        <div>{roundTo(percent, 2).toFixed(2).toLocaleString()}%</div>
      </div>
    </div>
  )
}
