import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { type DungeonKey } from '../../data/dungeonKeys.ts'
import type { DispelType, Mob, Spell } from '../../data/types.ts'
import { BoltIcon, HandRaisedIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { SootheIcon } from '../Common/Icons/SootheIcon.tsx'
import { DiseaseIcon } from '../Common/Icons/DiseaseIcon.tsx'
import { BleedIcon } from '../Common/Icons/BleedIcon.tsx'
import { CurseIcon } from '../Common/Icons/CurseIcon.tsx'
import { ChainIcon } from '../Common/Icons/ChainIcon.tsx'
import { PurgeIcon } from '../Common/Icons/PurgeIcon.tsx'
import { PoisonIcon } from '../Common/Icons/PoisonIcon.tsx'
import type { FC, SVGProps } from 'react'
import { dungeonSpells, getIconLink } from '../../data/spells/spells.ts'

interface Props {
  spell: Spell
  dungeonKey: DungeonKey
  mob: Mob
}

interface DispelIcon {
  name: DispelType
  Icon: FC<SVGProps<SVGSVGElement>>
  label?: string
}

const dispelTypes: DispelIcon[] = [
  { name: 'Bleed', Icon: BleedIcon },
  { name: 'Curse', Icon: CurseIcon },
  { name: 'Disease', Icon: DiseaseIcon },
  { name: 'Poison', Icon: PoisonIcon },
  { name: 'Magic', Icon: SparklesIcon, label: 'Magic dispel' },
  { name: 'Soothe', Icon: SootheIcon },
  { name: 'Purge', Icon: PurgeIcon },
  { name: 'Movement', Icon: ChainIcon, label: 'Movement dispel' },
]

export function MobSpellInfo({ spell, mob, dungeonKey }: Props) {
  const { icon, aoe, damage, physical, name, id } = spell
  const spellDetailsTooltipId = `spell-details-${id}`

  const damageText =
    damage && `${damage} ${aoe ? 'AoE' : 'ST'} ${physical ? 'physical' : 'magic'} damage`

  const isAlternateCast =
    spell.castTime &&
    dungeonSpells[dungeonKey][mob.id]?.find((s) => s.id !== spell.id && s.name === spell.name)

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
          {dispelTypes.map(
            ({ name, Icon, label }) =>
              spell.dispel?.includes(name) && (
                <Icon
                  key={name}
                  height={20}
                  data-tooltip-id={spellDetailsTooltipId}
                  data-tooltip-content={label ?? name}
                />
              ),
          )}
          {spell.stop && !spell.interrupt && (
            <HandRaisedIcon
              height={20}
              data-tooltip-id={spellDetailsTooltipId}
              data-tooltip-content="Stop"
            />
          )}
          {spell.interrupt && (
            <BoltIcon
              height={20}
              data-tooltip-id={spellDetailsTooltipId}
              data-tooltip-content="Interrupt"
            />
          )}
          <TooltipStyled id={spellDetailsTooltipId} place="top" />
          {damageText && (
            <a
              className="flex h-full"
              href={`https://not-even-close-tww.vercel.app/spell/${id}?trash=${!mob.isBoss}`}
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
