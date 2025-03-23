import { useMemo, useState } from 'react'
import { dungeons } from '../../data/dungeons.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { Button } from '../Common/Button.tsx'
import { setDungeon } from '../../store/routes/routesReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'

export function MobileDungeonDropdown() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const [expanded, setExpanded] = useState(false)
  const selected = useMemo(() => dungeons.find(({ key }) => key === dungeon.key), [dungeon])

  const handleSelect = (key: DungeonKey) => {
    setExpanded(false)
    dispatch(setDungeon(key))
  }

  if (!selected) {
    console.error(`Invalid dungeon key selected: ${dungeon.key}`)
    return null
  }

  return (
    <div className="flex-col sm:flex-row flex items-center gap-1 flex-wrap">
      <Button
        className="[&]:p-1.5"
        twoDimensional
        onClick={() => setExpanded((val) => !val)}
        disabled={isGuestCollab}
      >
        <img
          className="rounded border border-gray-600 w-10 h-10"
          src={`https://wow.zamimg.com/images/wow/icons/large/${selected.icon}.jpg`}
          alt={selected.name}
        />
        <div className="absolute bottom-0 text-outline">
          {(selected.displayKey ?? selected.key).toUpperCase()}
        </div>
      </Button>
      {expanded &&
        dungeons
          .filter((dungeon) => dungeon.key !== selected.key)
          .map((dungeon) => (
            <Button
              key={dungeon.key}
              className="[&]:p-1.5"
              twoDimensional
              onClick={() => handleSelect(dungeon.key)}
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
              <div className="absolute bottom-0 text-outline">
                {(dungeon.displayKey ?? dungeon.key).toUpperCase()}
              </div>
            </Button>
          ))}
    </div>
  )
}
