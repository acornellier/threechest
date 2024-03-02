import { useState } from 'react'
import { Dungeon } from '../../data/types.ts'
import { DungeonButton } from './DungeonButton.tsx'
import { dungeons } from '../../data/dungeons.ts'
import { useAppDispatch, useDungeon } from '../../store/hooks.ts'
import { setDungeon } from '../../store/reducer.ts'

export function DungeonDropdown() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

  const [open, setOpen] = useState(false)

  const handleChange = (dungeon: Dungeon) => {
    dispatch(setDungeon(dungeon.key))
    setOpen(false)
  }

  return (
    <div className="fixed left-2 top-2 z-20">
      <DungeonButton
        dungeon={dungeon}
        onClick={() => setOpen(!open)}
        className={`${open ? 'rounded-b-none' : ''}`}
      >
        <svg
          className="w-2.5 h-2.5 ml-auto"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </DungeonButton>

      {open && (
        <div className="absolute z-10 min-w-[300px] divide-y divide-gray-100 rounded-b-lg rounded-tr-lg bg-[#00000085] border-2 border-gray-600">
          <div className="flex flex-col gap-2 p-2 text-sm text-gray-200">
            {dungeons.map((dungeon) => (
              <DungeonButton
                key={dungeon.key}
                dungeon={dungeon}
                onClick={() => handleChange(dungeon)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
