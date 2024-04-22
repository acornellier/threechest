import { useMemo } from 'react'
import { dungeons } from '../../data/dungeons.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { Button } from '../Common/Button.tsx'
import { setDungeon } from '../../store/routes/routesReducer.ts'

export function DungeonDropdown() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const selected = useMemo(() => dungeons.find(({ key }) => key === dungeon.key), [dungeon])

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {dungeons.map((dungeon) => (
        <Button
          key={dungeon.key}
          className="[&]:p-1.5"
          color={selected?.key === dungeon.key ? 'green' : 'red'}
          twoDimensional
          onClick={() => dispatch(setDungeon(dungeon.key))}
          disabled={isGuestCollab}
          tooltip={dungeon.name}
          tooltipId={`dungeon-tooltip-${dungeon.key}`}
          tooltipPlace="bottom"
        >
          <img
            className="rounded border border-gray-600 w-10 h-10"
            src={`https://wow.zamimg.com/images/wow/icons/large/${dungeon.icon}.jpg`}
            alt={dungeon.name}
          />
        </Button>
      ))}
    </div>
  )
}
