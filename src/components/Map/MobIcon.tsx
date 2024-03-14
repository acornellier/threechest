import { mobScale } from '../../util/mobSpawns.ts'
import { darkenColor, getPullColor } from '../../util/colors.ts'
import { Mob } from '../../data/types.ts'

interface Props {
  mob: Mob
  matchingPullIndex: number | null
  isGroupHovered: boolean
  iconScaling: number
}

export function MobIcon({ mob, matchingPullIndex, iconScaling, isGroupHovered }: Props) {
  return (
    <div
      className="absolute h-full w-full rounded-full border border-slate-300 overflow-hidden border-transparent pointer-events-none"
      style={{
        background:
          'linear-gradient(white, white) padding-box, linear-gradient(to bottom, #dfdfe3, #373738) border-box',
        borderWidth: iconScaling * mobScale(mob) * 0.04,
        boxShadow: 'black 0px 0px 10px 0px',
      }}
    >
      <div
        className="absolute h-full w-full"
        style={{
          backgroundImage: `url(/npc_portraits/${mob.id}.png)`,
          backgroundSize: 'contain',
          backgroundBlendMode: 'overlay',
          backgroundColor:
            matchingPullIndex !== null
              ? darkenColor(getPullColor(matchingPullIndex), 100)
              : undefined,
        }}
      >
        {isGroupHovered && mob.count > 0 && (
          <div
            className="absolute flex items-center justify-center w-full h-full font-bold"
            style={{
              fontSize: iconScaling * 0.7 * mobScale(mob),
              WebkitTextStroke: `${iconScaling * 0.02}px black`,
            }}
          >
            {mob.count}
          </div>
        )}
      </div>
    </div>
  )
}
