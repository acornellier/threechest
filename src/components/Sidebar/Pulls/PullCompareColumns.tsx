import { getPullColor } from '../../../util/colors.ts'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import type { PullCompareInfo } from './compareRows.ts'

interface Props {
  compare: PullCompareInfo
  isShiftHeld?: boolean
}

const maxChips = 2

export function ComparePullChips({ comparePullIndices }: { comparePullIndices: number[] }) {
  const overflow = comparePullIndices.length - maxChips

  return (
    <div className="flex items-center gap-[1px]">
      {comparePullIndices.slice(0, maxChips).map((index) => (
        <ComparePullChip key={index} index={index} />
      ))}
      {overflow > 0 && <div className="text-outline font-bold text-[10px]">+{overflow}</div>}
    </div>
  )
}

export function ComparePullChip({ index }: { index: number }) {
  return (
    <div
      className="text-outline rounded-sm px-[3px] font-bold text-[11px] leading-4"
      style={{
        backgroundColor: getPullColor(index, true),
        border: `1px solid ${getPullColor(index)}`,
      }}
    >
      {index + 1}
    </div>
  )
}

export function PullCompareColumns({ compare, isShiftHeld }: Props) {
  const dungeon = useDungeon()
  const { comparePullIndices, compareCountCumulative, outOfOrder } = compare

  return (
    <div className="flex items-center gap-1">
      <ComparePullChips comparePullIndices={comparePullIndices} />
      <div
        className="text-outline font-bold text-xs w-[44px] text-right"
        style={{ opacity: outOfOrder ? 0.45 : 1 }}
        title={outOfOrder ? 'These pulls happen at very different points in the route' : undefined}
      >
        {compareCountCumulative === null
          ? '—'
          : isShiftHeld
            ? compareCountCumulative
            : mobCountPercentStr(compareCountCumulative, dungeon.mdt.totalCount)}
      </div>
    </div>
  )
}
