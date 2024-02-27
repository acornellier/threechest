import { MobSpawn } from './MobSpawn.tsx'
import { mobSpawnToKey } from '../../code/util.ts'
import { Mob } from '../../data/types.ts'

interface Props {
  mob: Mob
  iconSize: number
}

export function Mob({ mob, iconSize }: Props) {
  return mob.spawns.map((spawn) => (
    <MobSpawn key={mobSpawnToKey({ mob, spawn })} iconScaling={iconSize} mob={mob} spawn={spawn} />
  ))
}
