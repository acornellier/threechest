import { PullDetailed } from '../../code/types.ts'
import { roundTo } from '../../code/util.ts'
import { Mob } from '../../data/types.ts'
import { darkenColor, getPullColor, lightenColor } from '../../code/colors.ts'
import { useAppDispatch, useDungeon, useRoute } from '../../store/hooks.ts'
import { hoverPull, selectPull } from '../../store/reducer.ts'
import { MouseEvent } from 'react'

type MobCount = Record<number, { mob: Mob; count: number }>

interface Props {
  pullIndex: number
  pull: PullDetailed
  ghost: boolean | undefined
  onRightClick: (e: MouseEvent, pullIndex: number) => void
}

export function Pull({ pullIndex, pull, ghost, onRightClick }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const dungeon = useDungeon()

  const pullColor = getPullColor(pullIndex)
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
        backgroundColor: ghost ? 'grey' : darkenColor(pullColor, 100),
        backgroundImage: 'url(/wow/UI-Listbox-Highlight2.png)',
      }}
      onClick={() => dispatch(selectPull(pullIndex))}
      onMouseEnter={() => dispatch(hoverPull(pullIndex))}
      onMouseLeave={() => dispatch(hoverPull(null))}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(e, pullIndex)
      }}
    >
      {isSelectedPull && (
        <div
          className="absolute w-full h-full border-[1.5px] rounded-md"
          style={{
            borderColor: darkenColor(pullColor, 75),
            boxShadow: `inset 0 0 4px 3px ${lightenColor(pullColor, 100)}`,
          }}
        />
      )}
      <div className="flex justify-between py-0.5 px-2 h-full">
        <div className="flex items-center">
          <div className="min-w-4 mr-1 text-yellow-400 text-xs">
            {ghost ? pullIndex : pullIndex + 1}
          </div>
          <div className="flex h-full items-center">
            {Object.entries(mobCounts).map(([, { mob, count }]) => (
              <div
                key={mob.id}
                className="relative h-7 w-7 mr-[-3px] rounded-full border border-slate-300"
                style={{ borderWidth: 0.05 }}
              >
                <img className="h-full rounded-full" src={`/npc_portraits/${mob.id}.png`} alt="" />
                <div className="absolute bottom-[-3px] w-full text-white text-xs text-center">
                  x{count}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center text-white text-xs">
          {roundTo(percent, 2).toFixed(2).toLocaleString()}%
        </div>
      </div>
    </div>
  )
}
