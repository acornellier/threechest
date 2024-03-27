import { useMemo } from 'react'
import { DungeonKey } from '../../data/types.ts'
import { dungeons } from '../../data/dungeons.ts'
import { setDungeon } from '../../store/routes/routesReducer.ts'
import { Dropdown, DropdownOption } from '../Common/Dropdown.tsx'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { isMobile } from '../../util/dev.ts'

const options: DropdownOption[] = dungeons.map((dungeon) => ({
  id: dungeon.key,
  content: dungeon.name,
  icon: (
    <img
      className="rounded border-2 border-gray-600"
      height={36}
      width={36}
      src={`https://wow.zamimg.com/images/wow/icons/large/${dungeon.icon}.jpg`}
      alt={dungeon.name}
    />
  ),
}))

export function DungeonDropdown() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const selected = useMemo(() => options.find((option) => option.id === dungeon.key)!, [dungeon])

  return (
    <Dropdown
      className="dungeon-dropdown"
      twoDimensional
      short={isMobile}
      options={options}
      selected={selected}
      onSelect={(newDungeon) => dispatch(setDungeon(newDungeon.id as DungeonKey))}
      disabled={isGuestCollab}
    />
  )
}
