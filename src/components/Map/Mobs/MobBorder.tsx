import { mobScale } from '../../../util/mobSpawns.ts'
import { MobSpawn } from '../../../data/types.ts'
import { ReactNode } from 'react'

interface Props {
  mobSpawn: MobSpawn
  iconScaling: number
  scale?: number
  children?: ReactNode
}

export function MobBorder({ iconScaling, mobSpawn, scale = 1, children }: Props) {
  const percentSize = 100 * scale
  const diff = (percentSize - 100) / 2

  return (
    <div
      className="mob-border absolute rounded-full overflow-hidden border-transparent pointer-events-none"
      style={{
        height: `${percentSize}%`,
        width: `${percentSize}%`,
        top: diff ? `-${diff}%` : undefined,
        left: diff ? `-${diff}%` : undefined,
        background: 'linear-gradient(to bottom, #dfdfe3, #373738) border-box',
        borderWidth: iconScaling * mobScale(mobSpawn) * 0.04,
        boxShadow: 'black 0px 0px 10px 0px',
      }}
    >
      {children}
    </div>
  )
}
