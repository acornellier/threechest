import type { Mob, Spawn } from '../../../data/types.ts'
import { Tooltip } from 'react-leaflet'
import { mobCountPercentStr } from '../../../util/numbers.ts'
import { isMobile } from '../../../util/dev.ts'

import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { mobEfficiency } from '../../../util/mobSpawns.ts'

interface Props {
  mob: Mob
  spawn: Spawn
  hidden: boolean
}

export function MobSpawnTooltip({ mob, spawn, hidden }: Props) {
  const dungeon = useDungeon()

  if (isMobile) return null

  const { efficiencyScore, efficiencyColor } = mobEfficiency(
    { count: mob.count, health: mob.health },
    dungeon,
  )

  const spawnText = mob.spawns.length > 1 ? ` ${spawn.idx}` : ''
  const groupText = spawn.group ? ` | G${spawn.group}` : ''

  return (
    <Tooltip
      key={hidden.toString()}
      className={`no-arrow flex flex-col text-white p-0 bg-transparent rounded-sm border-gray-400 ${hidden ? 'hidden' : ''}`}
      direction="right"
    >
      <div className="absolute w-full h-full bg-slate-800 opacity-85 -z-10 rounded-sm" />
      <div className="p-2 rounded-sm">
        <div>
          <span className="font-bold">
            {mob.name}
            {spawnText}
          </span>
          {groupText}
        </div>
        <div>
          Forces: {mob.count} | {mobCountPercentStr(mob.count, dungeon.mdt.totalCount)}
        </div>
        {efficiencyScore > 0 && (
          <div>
            Efficiency: <span style={{ color: efficiencyColor }}>{efficiencyScore}</span>
          </div>
        )}
        <div style={{ fontSize: 10 }}>[Right click for more]</div>
        <div style={{ fontSize: 10 }}>[Ctrl-right click to mark]</div>
      </div>
    </Tooltip>
  )
}
