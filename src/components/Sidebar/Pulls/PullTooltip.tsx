import { mobCountPercentStr } from '../../../util/numbers.ts'
import type { PullDetailed } from '../../../util/types.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useMemo } from 'react'
import { countMobs, mobEfficiency } from '../../../util/mobSpawns.ts'

interface Props {
  pull: PullDetailed
}

export function PullTooltip({ pull }: Props) {
  const dungeon = useDungeon()

  const sortedCounts = useMemo(() => countMobs(pull, dungeon), [pull, dungeon])

  const { efficiencyScore, efficiencyColor } = mobEfficiency(
    { count: pull.count, health: pull.health },
    dungeon,
  )

  const { efficiencyScore: totalEffiency, efficiencyColor: totalEffiencyColor } = mobEfficiency(
    { count: pull.countCumulative, health: pull.healthCumulative },
    dungeon,
  )

  return (
    <>
      <div>
        Forces: {pull.count} ({mobCountPercentStr(pull.count, dungeon.mdt.totalCount)})
      </div>
      <div>
        Total: {pull.countCumulative} (
        {mobCountPercentStr(pull.countCumulative, dungeon.mdt.totalCount)})
      </div>
      {pull.count > 0 && (
        <div>
          Pull efficiency: <span style={{ color: efficiencyColor }}>{efficiencyScore}</span>
        </div>
      )}
      <div>
        Total efficiency: <span style={{ color: totalEffiencyColor }}>{totalEffiency}</span>
      </div>
      <div>
        {sortedCounts.map(({ mob, count }) => (
          <div key={mob.id}>
            {count}x {mob.name}
          </div>
        ))}
      </div>
    </>
  )
}
