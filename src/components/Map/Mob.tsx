import { MobSpawn } from './MobSpawn.tsx'
import { mobSpawnToKey } from '../../code/mobSpawns.ts'
import { Mob } from '../../data/types.ts'

interface Props {
  mob: Mob
  iconScaling: number
}

export function MobComponent({ mob, iconScaling }: Props) {
  return mob.spawns.map((spawn) => (
    <MobSpawn
      key={mobSpawnToKey({ mob, spawn })}
      iconScaling={iconScaling}
      mob={mob}
      spawn={spawn}
    />
  ))
}
