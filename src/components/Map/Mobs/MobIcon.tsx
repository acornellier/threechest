import { mobScale } from '../../../util/mobSpawns.ts'
import { getPullColor } from '../../../util/colors.ts'
import type { MobSpawn } from '../../../data/types.ts'
import { MobBorder } from './MobBorder.tsx'

interface Props {
  mobSpawn: MobSpawn
  matchingPullIndex: number | null
  showCount: boolean
  showGroup: boolean
  isSelected: boolean
  isSearchMatch: boolean
  iconScaling: number
  faded: boolean
}

export function MobIcon({
  mobSpawn,
  matchingPullIndex,
  iconScaling,
  showCount,
  showGroup,
  isSelected,
  isSearchMatch,
  faded,
}: Props) {
  return (
    <>
      {/* mob-border class so that the map zoom handler rescales the border width */}
      {isSearchMatch && (
        <div
          className="mob-search-match mob-border absolute rounded-full pointer-events-none"
          style={{
            height: '135%',
            width: '135%',
            top: '-17.5%',
            left: '-17.5%',
            borderWidth: iconScaling * mobScale(mobSpawn) * 0.05,
          }}
        />
      )}
      {isSelected && <MobBorder mobSpawn={mobSpawn} iconScaling={iconScaling} scale={1.1} />}
      <MobBorder mobSpawn={mobSpawn} iconScaling={iconScaling}>
        <div
          className="absolute h-full w-full"
          style={{
            backgroundImage: `url(/npc_portraits/${mobSpawn.mob.id}.png)`,
            backgroundSize: 'contain',
            backgroundBlendMode: 'overlay',
            backgroundColor: faded
              ? '#444444'
              : matchingPullIndex !== null
                ? getPullColor(matchingPullIndex, true)
                : undefined,
          }}
        >
          {(showGroup || (showCount && mobSpawn.mob.count > 0)) && (
            <div
              className="text-outline absolute flex items-center justify-center w-full h-full font-bold"
              style={{
                fontSize: iconScaling * 0.7 * mobScale(mobSpawn) * (showGroup ? 0.8 : 1),
              }}
            >
              {showGroup ? `G${mobSpawn.spawn.group}` : mobSpawn.mob.count}
            </div>
          )}
        </div>
      </MobBorder>
    </>
  )
}
