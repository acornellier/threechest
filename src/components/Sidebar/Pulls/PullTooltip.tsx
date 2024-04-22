import { mobCountPercentStr } from '../../../util/numbers.ts'
import type { PullDetailed } from '../../../util/types.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useMemo } from 'react'
import { countMobs, mobEfficiency } from '../../../util/mobSpawns.ts'
import { sum } from '../../../util/nodash.ts'

interface Props {
  pull: PullDetailed
}

export function PullTooltip({ pull }: Props) {
  const dungeon = useDungeon()

  const sortedCounts = useMemo(() => countMobs(pull, dungeon), [pull, dungeon])

  const totalHealth = sum(
    pull.spawns.map((spawnId) => {
      const mob = dungeon.mobSpawns[spawnId]!.mob
      return mob.isBoss ? 0 : dungeon.mobSpawns[spawnId]!.mob.health
    }),
  )
  const { efficiencyScore, efficiencyColor } = mobEfficiency(
    { count: pull.count, health: totalHealth },
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
          Average efficiency: <span style={{ color: efficiencyColor }}>{efficiencyScore}</span>
        </div>
      )}
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
