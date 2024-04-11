import { Panel } from '../Common/Panel.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { selectSelectedSpawn, selectSpawn } from '../../store/reducers/hoverReducer.ts'
import { getIconLink } from '../../data/spells/mergeSpells.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { mobCcTypes } from '../../util/mobSpawns.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { isSeason4 } from '../../data/dungeonKeys.ts'

export function MobInfo() {
  const dispatch = useAppDispatch()
  const selectedSpawn = useRootSelector(selectSelectedSpawn)
  const dungeon = useDungeon()
  if (selectedSpawn === null) return false

  const mobSpawn = dungeon.mobSpawns[selectedSpawn]
  if (!mobSpawn) return false

  const { mob } = mobSpawn
  const spells = dungeon.spells[mob.id]

  return (
    <div className="fixed bottom-14 left-2 z-10 min-w-[250px]">
      <Panel blue>
        <div>
          <div className="flex items-center justify-between gap-2">
            <a href={`https://www.wowhead.com/npc=${mob.id}`} target="_blank" rel="noreferrer">
              <div className="font-bold text-lg">{mob.name}</div>
            </a>
            <XMarkIcon
              width={20}
              height={20}
              className="cursor-pointer -mt-2"
              onClick={() => dispatch(selectSpawn(null))}
            />
          </div>
          <div className="flex justify-between gap-2">
            <div>{mob.creatureType}</div>
            <div>ID: {mob.id}</div>
          </div>
          {mobCcTypes(mob).map((ccType) => (
            <div key={ccType}>{ccType}</div>
          ))}
          {mob.stealthDetect && (
            <div className="flex gap-2">
              <img
                src={getIconLink('ability_eyeoftheowl')}
                width={24}
                height={24}
                alt="stealth detect"
                className="rounded-md rounded-r-none"
              />
              Detects stealth
            </div>
          )}
        </div>
        {spells?.length && (
          <div className="flex flex-col gap-2">
            {spells.map((spell) => (
              <div
                key={spell.id}
                className="h-8 flex items-center border border-gray-500 rounded-md"
              >
                <a
                  href={`https://www.wowhead.com/spell=${spell.id}?dd=23&ddsize=5`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={getIconLink(spell.icon)}
                    width={30}
                    height={30}
                    alt={spell.name}
                    className="rounded-md rounded-r-none"
                  />
                </a>

                <a className="flex-grow h-full" data-tooltip-id={`spell-details-${spell.id}`}>
                  <div className="gritty flex justify-between items-center gap-2 px-2 h-full bg-fancy-red opacity-90 text-nowrap border border-transparent border-r-gray-500">
                    {spell.name}
                  </div>
                </a>
                <TooltipStyled id={`spell-details-${spell.id}`} place="top">
                  {spell.damage && (
                    <div>{isSeason4(dungeon.key) ? spell.damage.s4 : spell.damage.s3} damage</div>
                  )}
                  {spell.aoe && <div>AoE</div>}
                  <div>{spell.physical ? 'Physical' : 'Magic'}</div>
                </TooltipStyled>
                {spell.damage !== undefined && (
                  <a
                    className="flex h-full"
                    href={`http://localhost:3000/spell/${spell.id}?trash=${!mob.isBoss}`}
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
            ))}
          </div>
        )}
      </Panel>
      <TooltipStyled id="view-in-not-even-close" place="right">
        View in Not Even Close
      </TooltipStyled>
    </div>
  )
}
