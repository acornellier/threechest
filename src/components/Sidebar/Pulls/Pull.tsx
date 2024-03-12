import { PullDetailed } from '../../../util/types.ts'
import { Mob } from '../../../data/types.ts'
import { darkenColor, getPullColor, lightenColor } from '../../../util/colors.ts'
import { useAppDispatch, useDungeon, useRoute } from '../../../store/hooks.ts'
import { selectPull } from '../../../store/routesReducer.ts'
import { useEffect, useMemo, useRef } from 'react'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { hoverPull } from '../../../store/hoverReducer.ts'

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
    const mobCounts = pull.mobSpawns.concat(pull.tempMobSpawns).reduce<MobCount>((acc, { mob }) => {
      acc[mob.id] ??= { mob, count: 0 }
      acc[mob.id]!.count += 1
      return acc
    }, {})

    return Object.values(mobCounts).sort((a, b) => b.mob.count - a.mob.count)
  }, [pull])

  useEffect(() => {
    if (isSelectedPull) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelectedPull])

  return (
    <div
      className="pull"
      ref={ref}
      onClick={() => dispatch(selectPull(pullIndex))}
      onMouseEnter={() => dispatch(hoverPull(pullIndex))}
      onMouseLeave={() => dispatch(hoverPull(null))}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(e.nativeEvent, pullIndex)
      }}
    >
      <div className="relative h-8 min-h-8">
        <div
          className="gritty absolute h-full w-full cursor-pointer rounded-sm border border-gray-500"
          style={{
            backgroundColor: ghost ? 'grey' : darkenColor(pullColor, 100),
            filter: 'contrast(80%)',
          }}
        />
        {isSelectedPull && (
          <div
            className="absolute w-full h-full border-2 rounded-sm"
            style={{
              borderColor: lightenColor(pullColor, 90),
              boxShadow: `inset 0 0 12px 2px ${lightenColor(pullColor, 100)}`,
            }}
          />
        )}
        <div className="relative flex justify-between py-0.5 px-2 h-full z-10">
          <div className="flex items-center">
            <div
              className="min-w-4 mr-1 text-yellow-200 text-sm font-bold"
              style={{ WebkitTextStroke: '0.6px black' }}
            >
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
                    className="absolute bottom-[-3px] w-full font-bold text-sm text-center"
                    style={{ WebkitTextStroke: '0.6px black' }}
                  >
                    x{count}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="flex items-center font-bold text-sm"
            style={{ WebkitTextStroke: '0.6px black' }}
          >
            {mobCountPercentStr(pull.countCumulative, dungeon.mdt.totalCount)}
          </div>
        </div>
      </div>
    </div>
  )
}
