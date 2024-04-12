import type { PullDetailed } from '../../../util/types.ts'
import { getPullColor, lightenColor } from '../../../util/colors.ts'
import { selectPull } from '../../../store/routes/routesReducer.ts'
import { useEffect, useMemo, useRef } from 'react'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { hoverPull } from '../../../store/reducers/hoverReducer.ts'
import { useDungeon, useSelectedPull } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { countMobs } from '../../../util/mobSpawns.ts'

interface Props {
  pull: PullDetailed
  ghost?: boolean | undefined
  onRightClick: (e: MouseEvent, pullIndex: number) => void
  isShiftHeld?: boolean
}

export function Pull({ pull, ghost, onRightClick, isShiftHeld }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const dispatch = useAppDispatch()
  const selectedPull = useSelectedPull()
  const dungeon = useDungeon()

  const pullColor = getPullColor(pull.index)
  const darkPullColor = getPullColor(pull.index, true)
  const isSelectedPull = pull.index === selectedPull

  const sortedCounts = useMemo(() => countMobs(pull, dungeon), [pull, dungeon])

  useEffect(() => {
    if (isSelectedPull) {
      ref.current?.scrollIntoView({ block: 'nearest' })
    }
  }, [isSelectedPull])

  return (
    <div
      className="pull"
      data-tooltip-id="pull-tooltip"
      ref={ref}
      onClick={() => dispatch(selectPull(pull.index))}
      onTouchEnd={() => dispatch(selectPull(pull.index))}
      onMouseEnter={() => dispatch(hoverPull(pull.index))}
      onMouseLeave={() => dispatch(hoverPull(null))}
      onContextMenu={(e) => {
        e.preventDefault()
        onRightClick(e.nativeEvent, pull.index)
      }}
    >
      <div className="relative h-8 min-h-8">
        <div
          className="gritty absolute h-full w-full cursor-pointer rounded-sm border border-gray-500"
          style={{
            backgroundColor: ghost ? 'grey' : darkPullColor,
            filter: 'contrast(80%)',
          }}
        />
        {isSelectedPull && (
          <div
            className="absolute w-full h-full border-2 rounded-sm"
            style={{
              borderColor: lightenColor(pullColor, 100),
              boxShadow: `inset 0 0 12px 2px ${lightenColor(pullColor, 100)}`,
            }}
          />
        )}

        <div className="relative flex justify-between py-0.5 px-2 h-full z-10">
          <div className="flex items-center">
            <div className="text-outline min-w-4 mr-1 text-yellow-200 text-sm font-bold">
              {ghost ? pull.index : pull.index + 1}
            </div>
            <div className="flex h-full items-center">
              {sortedCounts.slice(0, 7).map(({ mob, count }) => (
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
                  <div className="text-outline absolute bottom-[-3px] w-full font-bold text-xs text-center">
                    x{count}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-outline flex items-center font-bold text-sm">
            {isShiftHeld
              ? pull.countCumulative
              : mobCountPercentStr(pull.countCumulative, dungeon.mdt.totalCount)}
          </div>
        </div>
      </div>
    </div>
  )
}
