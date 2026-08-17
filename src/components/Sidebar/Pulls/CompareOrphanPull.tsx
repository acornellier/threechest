import { useMemo } from 'react'
import { countMobs } from '../../../util/mobSpawns.ts'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { compareColors, getPullColor } from '../../../util/colors.ts'
import type { PullDetailed } from '../../../util/types.ts'
import { ComparePullChip } from './PullCompareColumns.tsx'

interface Props {
  comparePull: PullDetailed
  comparePullIndex: number
  isShiftHeld?: boolean
}

const maxPortraits = 4

/** A pull the compare route has and this route doesn't. */
export function CompareOrphanPull({ comparePull, comparePullIndex, isShiftHeld }: Props) {
  const dungeon = useDungeon()
  const sortedCounts = useMemo(
    () => countMobs(comparePull.spawns, dungeon),
    [comparePull.spawns, dungeon],
  )
  const overflow = sortedCounts.length - maxPortraits

  return (
    <div className="pull">
      <div className="relative h-8 min-h-8">
        <div
          className="absolute h-full w-full rounded-sm"
          style={{
            border: `1px dashed ${getPullColor(comparePullIndex)}`,
            backgroundColor: '#00000055',
          }}
        />

        <div className="relative flex justify-between py-0.5 px-2 h-full z-10 opacity-80">
          <div className="flex items-center">
            <div className="text-outline min-w-4 mr-1 font-bold text-sm">·</div>
            <div className="flex h-full items-center">
              {sortedCounts.slice(0, maxPortraits).map(({ mob, count }) => (
                <div
                  key={mob.id}
                  className="relative h-6 w-6 mr-[-2px] rounded-full"
                  style={{ boxShadow: `0 0 0 1.5px ${compareColors.removed}` }}
                >
                  <img
                    className="h-full w-full rounded-full"
                    src={`/npc_portraits/${mob.id}.png`}
                    alt={mob.name}
                  />
                  <div
                    className="text-outline absolute -top-1 -left-0.5 font-bold text-sm leading-none"
                    style={{ color: compareColors.removed }}
                  >
                    −
                  </div>
                  <div className="text-outline absolute -bottom-1 w-full font-bold text-[10px] text-center leading-none">
                    x{count}
                  </div>
                </div>
              ))}
              {overflow > 0 && (
                <div className="text-outline ml-1 font-bold text-[10px] text-gray-200">
                  +{overflow}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ComparePullChip index={comparePullIndex} />
            <div className="text-outline font-bold text-xs w-[44px] text-right">
              {isShiftHeld
                ? comparePull.countCumulative
                : mobCountPercentStr(comparePull.countCumulative, dungeon.mdt.totalCount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
