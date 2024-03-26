import { mobScale } from '../../../util/mobSpawns.ts'
import { getPullColor } from '../../../util/colors.ts'
import { MobSpawn } from '../../../data/types.ts'
import { MobBorder } from './MobBorder.tsx'

interface Props {
  mobSpawn: MobSpawn
  matchingPullIndex: number | null
  isGroupHovered: boolean
  isSelected: boolean
  iconScaling: number
}

export function MobIcon({
  mobSpawn,
  matchingPullIndex,
  iconScaling,
  isGroupHovered,
  isSelected,
}: Props) {
  return (
    <>
      {isSelected && <MobBorder mobSpawn={mobSpawn} iconScaling={iconScaling} scale={1.1} />}
      <MobBorder mobSpawn={mobSpawn} iconScaling={iconScaling}>
        <div
          className="absolute h-full w-full"
          style={{
            backgroundImage: `url(/npc_portraits/${mobSpawn.mob.id}.png)`,
            backgroundSize: 'contain',
            backgroundBlendMode: 'overlay',
            backgroundColor:
              matchingPullIndex !== null ? getPullColor(matchingPullIndex, true) : undefined,
          }}
        >
          {isGroupHovered && mobSpawn.mob.count > 0 && (
            <div
              className="text-outline absolute flex items-center justify-center w-full h-full font-bold"
              style={{
                fontSize: iconScaling * 0.7 * mobScale(mobSpawn),
              }}
            >
              {mobSpawn.mob.count}
            </div>
          )}
        </div>
      </MobBorder>
    </>
  )
}
