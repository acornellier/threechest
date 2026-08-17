import { useMemo } from 'react'
import type { SpawnId } from '../../../data/types.ts'
import type { Mob } from '../../../data/types.ts'
import { countMobs } from '../../../util/mobSpawns.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { compareColors } from '../../../util/colors.ts'
import type { PullCompareInfo } from './compareRows.ts'

interface Props {
  compare: PullCompareInfo
  maxPortraits: number
}

type DiffKind = 'added' | 'removed' | 'moved'

const marks: Record<DiffKind, { symbol: string; color: string; label: string }> = {
  added: { symbol: '+', color: compareColors.added, label: 'not in the compare route' },
  removed: { symbol: '−', color: compareColors.removed, label: 'not in this route' },
  moved: { symbol: '↕', color: compareColors.moved, label: 'pulled elsewhere in the compare route' },
}

interface DiffEntry {
  kind: DiffKind
  mob: Mob
  count: number
}

export function PullDiffPortraits({ compare, maxPortraits }: Props) {
  const dungeon = useDungeon()

  const entries = useMemo(() => {
    const groups: [DiffKind, SpawnId[]][] = [
      ['added', compare.addedSpawns],
      ['removed', compare.removedSpawns],
      ['moved', compare.movedSpawns],
    ]

    return groups.flatMap(([kind, spawns]) =>
      countMobs(spawns, dungeon).map<DiffEntry>(({ mob, count }) => ({ kind, mob, count })),
    )
  }, [compare, dungeon])

  const overflow = entries.length - maxPortraits

  return (
    <div className="flex h-full items-center">
      {entries.slice(0, maxPortraits).map(({ kind, mob, count }) => {
        const { symbol, color, label } = marks[kind]

        return (
          <div
            key={`${kind}-${mob.id}`}
            className="relative h-6 w-6 mr-[-2px] rounded-full"
            style={{ boxShadow: `0 0 0 1.5px ${color}` }}
          >
            <img
              className="h-full w-full rounded-full"
              src={`/npc_portraits/${mob.id}.png`}
              alt={`${mob.name} ${label}`}
            />
            <div
              className="text-outline absolute -top-1 -left-0.5 font-bold text-sm leading-none"
              style={{ color }}
            >
              {symbol}
            </div>
            <div className="text-outline absolute -bottom-1 w-full font-bold text-[10px] text-center leading-none">
              x{count}
            </div>
          </div>
        )
      })}
      {overflow > 0 && (
        <div className="text-outline ml-1 font-bold text-[10px] text-gray-200">+{overflow}</div>
      )}
    </div>
  )
}
