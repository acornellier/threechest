import { PullDetailed } from '../../code/types.ts'
import { Mob } from '../../data/types.ts'
import { darkenColor, getPullColor, lightenColor } from '../../code/colors.ts'
import { useAppDispatch, useDungeon, useRoute } from '../../store/hooks.ts'
import { selectPull } from '../../store/routesReducer.ts'
import { MouseEvent, useEffect, useMemo, useRef } from 'react'
import { mobCountPercentStr } from '../../code/util.ts'
import { hoverPull } from '../../store/hoverReducer.ts'

type MobCount = Record<number, { mob: Mob; count: number }>

interface Props {
  pullIndex: number
  pull: PullDetailed
  ghost: boolean | undefined
  onRightClick: (e: MouseEvent, pullIndex: number) => void
}

export function Pull({ pullIndex, pull, ghost, onRightClick }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const route = useRoute()
  const dungeon = useDungeon()

  const pullColor = getPullColor(pullIndex)
  const isSelectedPull = pullIndex === route.selectedPull

  const sortedCounts = useMemo(() => {
    const mobCounts = pull.mobSpawns.reduce<MobCount>((acc, { mob }) => {
      acc[mob.id] ??= { mob, count: 0 }
      acc[mob.id].count += 1
      return acc
    }, {})

    return Object.values(mobCounts).sort((a, b) => b.mob.count - a.mob.count)
  }, [pull.mobSpawns])

  useEffect(() => {
    if (isSelectedPull) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelectedPull])

  return (
    <div
      ref={ref}
      className="pull relative h-8 min-h-8 cursor-pointer"
      onClick={() => dispatch(selectPull(pullIndex))}
      onMouseEnter={() => dispatch(hoverPull(pullIndex))}
      onMouseLeave={() => dispatch(hoverPull(null))}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(e, pullIndex)
      }}
    >
      <div
        className="gritty absolute h-full w-full cursor-pointer rounded-sm border border-gray-500"
        style={{
          backgroundColor: ghost ? 'grey' : darkenColor(pullColor, 100),
          filter: 'contrast(80%)',
        }}
      />
      {isSelectedPull && (
        <div
          className="absolute w-full h-full border-[1.5px] rounded-sm"
          style={{
            borderColor: darkenColor(pullColor, 75),
            boxShadow: `inset 0 0 12px 2px ${lightenColor(pullColor, 100)}`,
          }}
        />
      )}
      <div className="relative flex justify-between py-0.5 px-2 h-full z-10">
        <div className="flex items-center">
          <div className="min-w-4 mr-1 text-yellow-400 text-xs">
            {ghost ? pullIndex : pullIndex + 1}
          </div>
          <div className="flex h-full items-center">
            {sortedCounts.slice(0, 6).map(({ mob, count }) => (
              <div
                key={mob.id}
                className="relative h-7 w-7 mr-[-3px] rounded-full border border-slate-300"
                style={{ borderWidth: 0.05 }}
              >
                <img
                  className="h-full rounded-full"
                  src={`/npc_portraits/${mob.id}.png`}
                  alt={mob.name}
                />
                <div
                  className="absolute bottom-[-3px] w-full text-white font-bold text-sm text-center"
                  style={{ WebkitTextStroke: '0.6px black' }}
                >
                  x{count}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="flex items-center text-white font-bold text-sm"
          style={{ WebkitTextStroke: '0.6px black' }}
        >
          {mobCountPercentStr(pull.count, dungeon.mdt.totalCount)}
        </div>
      </div>
    </div>
  )
}
