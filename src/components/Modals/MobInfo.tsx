import { Panel } from '../Common/Panel.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { selectSelectedSpawn, selectSpawn } from '../../store/reducers/hoverReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { mobCcTypes } from '../../util/mobSpawns.ts'
import { MobSpellInfo } from './MobSpellInfo.tsx'
import { dungeonSpells, getIconLink } from '../../data/spells/spells.ts'

export function MobInfo() {
  const dispatch = useAppDispatch()
  const selectedSpawn = useRootSelector(selectSelectedSpawn)
  const dungeon = useDungeon()
  if (selectedSpawn === null) return false

  const mobSpawn = dungeon.mobSpawns[selectedSpawn]
  if (!mobSpawn) return false

  const { mob } = mobSpawn
  const spells = dungeonSpells[dungeon.key][mob.id]?.sort((a, b) => {
    return a.name === b.name ? a.id - b.id : a.name.localeCompare(b.name)
  })

  return (
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
            <MobSpellInfo key={spell.id} spell={spell} dungeonKey={dungeon.key} mob={mob} />
          ))}
        </div>
      )}
    </Panel>
  )
}
