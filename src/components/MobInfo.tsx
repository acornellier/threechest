import { Panel } from './Common/Panel.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { selectSelectedSpawn, selectSpawn } from '../store/reducers/hoverReducer.ts'
import { getIconLink } from '../data/spells/mergeSpells.ts'
import { addToast } from '../store/reducers/toastReducer.ts'

import { useDungeon } from '../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../store/storeUtil.ts'
import { mobCcTypes } from '../util/mobSpawns.ts'
import { Spell } from '../data/types.ts'

export function MobInfo() {
  const dispatch = useAppDispatch()
  const selectedSpawn = useRootSelector(selectSelectedSpawn)
  const dungeon = useDungeon()
  if (selectedSpawn === null) return

  const mobSpawn = dungeon.mobSpawns[selectedSpawn]
  if (!mobSpawn) return

  const { mob } = mobSpawn
  const spells = dungeon.spells[mob.id]

  const onClickSpellId = async (spell: Spell, altKey: boolean) => {
    if (!altKey) {
      await navigator.clipboard.writeText(spell.id.toString())
      dispatch(addToast({ message: `Copied Spell ID to clipboard: ${spell.id}` }))
      return
    }

    const varName = spell.name[0]!.toLowerCase() + spell.name.substring(1).replaceAll(' ', '')
    const ts = `
    
const ${varName}: EnemyAbility = {
  name: '${spell.name}',
  id: ${spell.id},
  icon: '${spell.icon.split('.jpg')[0]!}',
  baseDamage: 0,
  isAoe: true,
}`

    await navigator.clipboard.writeText(ts.toString())
    dispatch(addToast({ message: `Copied NEC text to clipboard: ${ts}` }))
  }

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

                <a
                  className="flex-grow h-full"
                  href={`https://www.wowhead.com/spell=${spell.id}?dd=23&ddsize=5`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="gritty flex justify-between items-center gap-2 px-2 h-full bg-fancy-red opacity-90 text-nowrap border border-transparent border-r-gray-500">
                    {spell.name}
                  </div>
                </a>
                <div
                  className="gritty flex w-[70px] justify-between items-center gap-2 px-2 h-full bg-fancy-red rounded-md rounded-l-none opacity-90 cursor-pointer select-none"
                  onClick={(e) => onClickSpellId(spell, e.altKey)}
                >
                  {spell.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
