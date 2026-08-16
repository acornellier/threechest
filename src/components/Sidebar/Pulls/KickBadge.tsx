import { BoltIcon } from '@heroicons/react/24/solid'
import { KICK_BUDGET } from '../../../util/interrupts.ts'

interface Props {
  kicksNeeded: number
}

export function KickBadge({ kicksNeeded }: Props) {
  return (
    <div
      className={`text-outline flex items-center font-bold text-sm
                  ${kicksNeeded > KICK_BUDGET + 1 ? 'text-red-400' : 'text-yellow-300'}`}
    >
      {kicksNeeded}
      <BoltIcon height={14} stroke="black" strokeWidth={2} style={{ paintOrder: 'stroke' }} />
    </div>
  )
}
