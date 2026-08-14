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
  faded: boolean
}

export function MobIcon({
  mobSpawn,
  matchingPullIndex,
  showCount,
  showGroup,
  isSelected,
  isSearchMatch,
  faded,
}: Props) {
  return (
    <>
      {isSearchMatch && (
        <div
          className="mob-search-match mob-border absolute rounded-full pointer-events-none"
          style={{
            height: '135%',
            width: '135%',
            top: '-17.5%',
            left: '-17.5%',
            borderWidth: 'calc(var(--icon-size) * 0.05)',
          }}
        />
      )}
      {isSelected && <MobBorder scale={1.1} />}
      <MobBorder>
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
                fontSize: `calc(var(--icon-size) * ${showGroup ? 0.56 : 0.7})`,
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
