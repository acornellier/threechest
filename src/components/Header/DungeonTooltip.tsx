import type { Dungeon } from '../../data/types.ts'
import { formatDuration } from '../../util/numbers.ts'

interface Props {
  dungeon: Dungeon
}

export function DungeonTooltip({ dungeon }: Props) {
  return (
    <div className="flex flex-col">
      <div>{dungeon.name}</div>
      <div className="text-gray-300">Timer: {formatDuration(dungeon.timeLimit)}</div>
    </div>
  )
}
