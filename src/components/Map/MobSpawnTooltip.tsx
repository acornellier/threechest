import { Mob, Spawn } from '../../data/types.ts'
import { Tooltip } from 'react-leaflet'
import { useDungeon } from '../../store/hooks.ts'
import { mobCountPercentStr, roundTo } from '../../code/util.ts'
import { rgbToHex } from '../../code/colors.ts'

interface Props {
  mob: Mob
  spawn: Spawn
  iconScaling: number
}

export function MobSpawnTooltip({ mob, spawn, iconScaling }: Props) {
  const dungeon = useDungeon()

  const efficiencyScore = roundTo(
    (2.5 * (mob.count / dungeon.mdt.totalCount) * 300) / (mob.health / 500000),
    1,
  )

  const efficiencyColor = rgbToHex(
    Math.max(0, Math.min(1, 2 * (1 - efficiencyScore / 10))),
    Math.min(1, (2 * efficiencyScore) / 10),
    0,
  )

  const spawnText = mob.spawns.length > 1 ? ` ${spawn.spawnIndex}` : ''
  const groupText = spawn.group ? ` | G${spawn.group}` : ''

  return (
    <Tooltip
      className="no-arrow flex flex-col text-white p-0 bg-transparent rounded-sm border-gray-400"
      direction="right"
      offset={[iconScaling * 0.8, 0]}
      permanent
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
      </div>
    </Tooltip>
  )
}
