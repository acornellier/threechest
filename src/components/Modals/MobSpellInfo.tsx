import { getIconLink } from '../../data/spells/mergeSpells.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { isSeason4 } from '../../data/dungeonKeys.ts'
import type { Dungeon, Mob, Spell } from '../../data/types.ts'

export function MobSpellInfo(props: { spell: Spell; dungeon: Dungeon; mob: Mob }) {
  return (
    <div className="h-8 flex items-center border border-gray-500 rounded-md">
      <a
        href={`https://www.wowhead.com/spell=${props.spell.id}?dd=23&ddsize=5`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={getIconLink(props.spell.icon)}
          width={30}
          height={30}
          alt={props.spell.name}
          className="rounded-md rounded-r-none"
        />
      </a>

      <a className="flex-grow h-full" data-tooltip-id={`spell-details-${props.spell.id}`}>
        <div className="gritty flex justify-between items-center gap-2 px-2 h-full bg-fancy-red opacity-90 text-nowrap border border-transparent border-r-gray-500">
          {props.spell.name}
        </div>
      </a>
      {props.spell.damage && (
        <TooltipStyled id={`spell-details-${props.spell.id}`} place="top">
          <div>
            {isSeason4(props.dungeon.key) ? props.spell.damage.s4 : props.spell.damage.s3}{' '}
            {props.spell.physical ? 'physical' : 'magic'} damage
          </div>
          {props.spell.aoe && <div>AoE</div>}
        </TooltipStyled>
      )}
      {props.spell.damage !== undefined && (
        <a
          className="flex h-full"
          href={`https://not-even-close.com/spell/${props.spell.id}?trash=${!props.mob.isBoss}`}
          target="_blank"
          rel="noreferrer"
          data-tooltip-id="view-in-not-even-close"
        >
          <img
            src={getIconLink('ability_argus_soulburst')}
            width={30}
            height={30}
            alt="stealth detect"
            className="rounded-md rounded-r-none"
          />
        </a>
      )}
    </div>
  )
}
