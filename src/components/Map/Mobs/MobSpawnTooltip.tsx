import { Mob, Spawn } from '../../../data/types.ts'
import { Tooltip } from 'react-leaflet'
import { mobCountPercentStr, roundTo } from '../../../util/numbers.ts'
import { rgbToHex } from '../../../util/colors.ts'
import { isMobile } from '../../../util/dev.ts'

import { useDungeon } from '../../../store/routes/routeHooks.ts'

interface Props {
  mob: Mob
  spawn: Spawn
  iconScaling: number
  hidden: boolean
}

export function MobSpawnTooltip({ mob, spawn, iconScaling, hidden }: Props) {
  const dungeon = useDungeon()

  if (isMobile) return null

  const efficiencyScore = roundTo(
    (2.5 * (mob.count / dungeon.mdt.totalCount) * 300) / (mob.health / 500000),
    1,
  )

  const efficiencyColor = rgbToHex(
    Math.max(0, Math.min(1, 2 * (1 - efficiencyScore / 10))),
    Math.min(1, (2 * efficiencyScore) / 10),
    0,
  )

  const spawnText = mob.spawns.length > 1 ? ` ${spawn.idx}` : ''
  const groupText = spawn.group ? ` | G${spawn.group}` : ''

  return (
    <Tooltip
      key={hidden.toString()}
      className={`no-arrow flex flex-col text-white p-0 bg-transparent rounded-sm border-gray-400 ${hidden ? 'hidden' : ''}`}
      direction="right"
      offset={[iconScaling * 0.8, 0]}
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
        <div>
          Efficiency: <span style={{ color: efficiencyColor }}>{efficiencyScore}</span>
        </div>
        <div style={{ fontSize: 10 }}>[Right click for more]</div>
      </div>
    </Tooltip>
  )
}
