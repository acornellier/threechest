import { MobSpawn } from './MobSpawn.tsx'
import { mobSpawnToKey } from '../../code/util.ts'
import { Mob } from '../../data/types.ts'
import { memo } from 'react'

interface Props {
  mob: Mob
  iconScaling: number
}

function Mob({ mob, iconScaling }: Props) {
  return mob.spawns.map((spawn) => (
    <MobSpawn
      key={mobSpawnToKey({ mob, spawn })}
      iconScaling={iconScaling}
      mob={mob}
      spawn={spawn}
    />
  ))
}

export const MobComponent = memo(Mob)
