import { useAppDispatch, useDungeon, useHoverSelector } from '../store/hooks.ts'
import { Panel } from './Common/Panel.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { selectMobSpawn } from '../store/hoverReducer.ts'

export function MobInfo() {
  const dispatch = useAppDispatch()
  const selectedMobSpawn = useHoverSelector((state) => state.selectedMobSpawn)
  const mob = selectedMobSpawn?.mob
  const dungeon = useDungeon()

  if (!mob || !dungeon.spells) return null

  const spells = dungeon.spells[mob.id]

  return (
    <div className="fixed bottom-2 left-2 z-10">
      <Panel blue>
        <div className="flex items-center justify-between gap-2">
          <div className="font-bold text-lg">{mob.name}</div>
          <XMarkIcon
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={() => dispatch(selectMobSpawn(null))}
          />
        </div>
        <div>{mob.creatureType}</div>
        <div className="flex flex-col gap-2">
          {spells?.map((spell) => (
            <a
              key={spell.id}
              href={`https://www.wowhead.com/spell=${spell.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="h-8 flex items-center border border-gray-500 rounded-md">
                <img
                  src={`https://wow.zamimg.com/images/wow/icons/large/${spell.icon}`}
                  width={30}
                  height={30}
                  alt={spell.name}
                  className="rounded-md rounded-r-none"
                />
                <div className="gritty flex items-center px-2 w-full h-full bg-fancy-red rounded-md rounded-l-none opacity-90">
                  {spell.name}
                </div>
              </div>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  )
}
