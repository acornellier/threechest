import { getIconLink } from '../../data/spells/mergeSpells.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { isSeason4 } from '../../data/dungeonKeys.ts'
import type { Dungeon, Mob, Spell } from '../../data/types.ts'
import { BoltIcon } from '@heroicons/react/24/outline'
import { VortexIcon } from '../Common/Icons/VortexIcon.tsx'

interface Props {
  spell: Spell
  dungeon: Dungeon
  mob: Mob
}

export function MobSpellInfo({ spell, mob, dungeon }: Props) {
  const { icon, aoe, damage, physical, name, id } = spell
  console.log(spell)
  return (
    <div className="h-8 flex items-center border border-gray-500 rounded-md">
      <a
        href={`https://www.wowhead.com/spell=${id}?dd=23&ddsize=5`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={getIconLink(icon)}
          width={30}
          height={30}
          alt={name}
          className="rounded-md rounded-r-none"
        />
      </a>

      <div className="gritty flex flex-grow justify-between items-center gap-6 pl-2 h-full bg-fancy-red opacity-90 text-nowrap rounded-md rounded-l-none">
        <div data-tooltip-id={`spell-details-${id}`}>{name}</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="text-xs">{spell.id}</div>
            {spell.interrupt && (
              <BoltIcon
                width={20}
                data-tooltip-id={`spell-details-icon-${id}`}
                data-tooltip-content="Interruptible"
              />
            )}
            {spell.stop && (
              <VortexIcon
                className="-m-1"
                width={24}
                height={24}
                color="white"
                data-tooltip-id={`spell-details-icon-${id}`}
                data-tooltip-content="Stoppable"
              />
            )}
            <TooltipStyled id={`spell-details-icon-${id}`} place="top" />
          </div>
          {damage === undefined && !spell.interrupt && !spell.stop ? (
            <div className="w-[30px] h-[30px]" />
          ) : (
            <a
              className="flex h-full"
              href={`https://not-even-close.com/spell/${id}?trash=${!mob.isBoss}`}
              target="_blank"
              rel="noreferrer"
              data-tooltip-id="view-in-not-even-close"
            >
              <img
                src={getIconLink('ability_argus_soulburst')}
                width={30}
                height={30}
                alt="stealth detect"
                className="rounded-md rounded-l-none"
              />
            </a>
          )}
        </div>
        <TooltipStyled id={`spell-details-${id}`} place="top">
          {damage && (
            <div>
              {isSeason4(dungeon.key) ? damage.s4 : damage.s3} {aoe ? 'AoE' : 'ST'}{' '}
              {physical ? 'physical' : 'magic'} damage
            </div>
          )}
        </TooltipStyled>
      </div>
    </div>
  )
}
