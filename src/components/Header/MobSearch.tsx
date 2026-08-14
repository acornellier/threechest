import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { KeyboardEvent } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import {
  clearMobSearch,
  mobMatchesSearch,
  openMobSearch,
  selectMobSearchOpen,
  selectMobSearchTerm,
  selectMobSearchTermNormalized,
  setMobSearchTerm,
} from '../../store/reducers/mobSearchReducer.ts'
import { useDungeon } from '../../store/routes/routeHooks.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { Button } from '../Common/Button.tsx'
import { Panel } from '../Common/Panel.tsx'

const plural = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`

export function MobSearch() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const open = useRootSelector(selectMobSearchOpen)
  const term = useRootSelector(selectMobSearchTerm)
  const normalizedTerm = useRootSelector(selectMobSearchTermNormalized)
  const inputRef = useRef<HTMLInputElement>(null)

  const onOpen = useCallback(() => {
    dispatch(openMobSearch())
    // Already open: refocus and select so a new search can be typed right away
    inputRef.current?.select()
  }, [dispatch])

  const onClear = useCallback(() => {
    if (open) {
      dispatch(clearMobSearch())
    }
  }, [dispatch, open])

  const onToggle = useCallback(() => {
    if (open) {
      onClear()
    } else {
      onOpen()
    }
  }, [open, onClear, onOpen])

  useShortcut(shortcuts.findMob, onOpen)
  // Only fires when focus is outside the input, e.g. after clicking on the map
  useShortcut(shortcuts.cancel, onClear)

  const { mobCount, spawnCount } = useMemo(() => {
    if (!normalizedTerm) return { mobCount: 0, spawnCount: 0 }

    const mobIds = new Set<number>()
    let spawnCount = 0
    for (const { mob } of dungeon.mobSpawnsList) {
      if (!mobMatchesSearch(mob, normalizedTerm)) continue

      mobIds.add(mob.id)
      spawnCount += 1
    }

    return { mobCount: mobIds.size, spawnCount }
  }, [dungeon.mobSpawnsList, normalizedTerm])

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        dispatch(clearMobSearch())
      } else if (e.key === 'Enter') {
        // Keep the highlights, but give the map shortcuts back
        e.currentTarget.blur()
      }
    },
    [dispatch],
  )

  return (
    <div className="hidden sm:flex items-start gap-2 h-full">
      <Button
        twoDimensional={open}
        color={open ? 'green' : 'red'}
        Icon={MagnifyingGlassIcon}
        onClick={onToggle}
        justifyStart
        tooltip={`Find mobs (${keyText(shortcuts.findMob[0]!)})`}
        tooltipId="find-mob-tooltip"
      />
      {open && (
        <Panel row className="w-[340px] max-w-[60vw]" innerClass="items-center">
          <input
            ref={inputRef}
            className="bg-transparent outline-none w-full min-w-0"
            autoFocus
            placeholder="Find mobs by name"
            value={term}
            onChange={(e) => dispatch(setMobSearchTerm(e.target.value))}
            onKeyDown={onKeyDown}
          />
          {!!normalizedTerm && (
            <div className="text-sm text-gray-400 whitespace-nowrap select-none">
              {spawnCount === 0
                ? 'No matches'
                : `${plural(mobCount, 'mob')}, ${plural(spawnCount, 'spawn')}`}
            </div>
          )}
          <button className="outline-none" onClick={() => dispatch(clearMobSearch())}>
            <XMarkIcon width={20} height={20} className="min-w-5" />
          </button>
        </Panel>
      )}
    </div>
  )
}
