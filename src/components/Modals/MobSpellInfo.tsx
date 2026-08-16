import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { type DungeonKey } from '../../data/dungeonKeys.ts'
import type { Mob, Spell, SpellAttribute } from '../../data/types.ts'
import { BoltIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { SootheIcon } from '../Common/Icons/SootheIcon.tsx'
import { DiseaseIcon } from '../Common/Icons/DiseaseIcon.tsx'
import { BleedIcon } from '../Common/Icons/BleedIcon.tsx'
import { CurseIcon } from '../Common/Icons/CurseIcon.tsx'
import { PoisonIcon } from '../Common/Icons/PoisonIcon.tsx'
import type { FC, SVGProps } from 'react'
import { dungeonSpells, getIconLink } from '../../data/spells/spells.ts'
import { MELEE_LOCKOUT } from '../../util/interrupts.ts'
import { roundTo } from '../../util/numbers.ts'

interface Props {
  spell: Spell
  dungeonKey: DungeonKey
  mob: Mob
}

interface AttributeIcon {
  name: SpellAttribute
  Icon: FC<SVGProps<SVGSVGElement>>
  label?: string
}

const attributeIcons: AttributeIcon[] = [
  { name: 'interruptible', Icon: BoltIcon },
  { name: 'bleed', Icon: BleedIcon },
  { name: 'curse', Icon: CurseIcon },
  { name: 'disease', Icon: DiseaseIcon },
  { name: 'poison', Icon: PoisonIcon },
  { name: 'magic', Icon: SparklesIcon },
  { name: 'enrage', Icon: SootheIcon },
  // { name: 'Purge', Icon: PurgeIcon },
  // { name: 'Movement', Icon: ChainIcon, label: 'Movement dispel' },
]

export function MobSpellInfo({ spell, mob, dungeonKey }: Props) {
  const { icon, aoe, damage, physical, name, id } = spell
  const spellDetailsTooltipId = `spell-details-${id}`
  const kickTooltipId = `spell-kick-${id}`

  const damageText =
    damage && `${damage} ${aoe ? 'AoE' : 'ST'} ${physical ? 'physical' : 'magic'} damage`

  const isAlternateCast =
    spell.castTime &&
    dungeonSpells[dungeonKey][mob.id]?.find((s) => s.id !== spell.id && s.name === spell.name)

  // The kick interval is the wait until the mob can cast again, plus the cast time the kicker has
  // to react in. Whichever of the spell's cooldown and the interrupt lockout is longer sets the
  // wait, so a value at the lockout means the spell itself has no meaningful cooldown.
  const castSeconds = (spell.castTime ?? 0) / 1000
  const waitSeconds = spell.cooldown ? roundTo(spell.cooldown - castSeconds, 1) : 0
  const waitLabel = waitSeconds <= MELEE_LOCKOUT ? 'kick lockout' : 'spell cd'

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

      <div
        className={`gritty flex flex-grow justify-between items-center gap-6 pl-2 h-full opacity-90 text-nowrap rounded-md rounded-l-none
                 ${isAlternateCast ? 'bg-fancy-orange' : 'bg-fancy-red'}`}
      >
        <div>
          <span>
            <a
              href={`https://www.wowhead.com/spell=${id}?dd=23&ddsize=5`}
              target="_blank"
              rel="noreferrer"
            >
              {name}
            </a>
          </span>
          <span className="text-xs">
            {' '}
            {spell.id} {isAlternateCast && ` (cast)`}
          </span>
        </div>
        <div className={`flex items-center gap-1 ${damage ? '' : 'pr-1'}`}>
          {attributeIcons.map(
            ({ name, Icon, label }) =>
              spell.attributes?.includes(name) && (
                <Icon
                  key={name}
                  height={20}
                  data-tooltip-id={spellDetailsTooltipId}
                  data-tooltip-content={label ?? name[0]?.toUpperCase() + name.substring(1)}
                />
              ),
          )}
          {!!spell.cooldown && (
            <>
              <span className="text-xs" data-tooltip-id={kickTooltipId}>
                {spell.cooldown}s
              </span>
              <TooltipStyled id={kickTooltipId} place="top">
                <div>Seconds until this needs kicking again</div>
                <div>
                  {waitSeconds}s {waitLabel}
                  {castSeconds > 0 && ` + ${castSeconds}s cast`}
                </div>
              </TooltipStyled>
            </>
          )}
          <TooltipStyled id={spellDetailsTooltipId} place="top" />
          {damageText && (
            <a
              className="flex h-full"
              href={`https://not-even-close.com/spell/${id}?trash=${!mob.isBoss}`}
              target="_blank"
              rel="noreferrer"
              data-tooltip-id={`spell-${id}-nec`}
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
          <TooltipStyled id={`spell-${id}-nec`} place="top">
            <div>{damageText}</div>
            <div>Click to view in Not Even Close</div>
          </TooltipStyled>
        </div>
      </div>
    </div>
  )
}
