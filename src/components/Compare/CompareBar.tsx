import { ArrowsRightLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common/Button.tsx'
import { Panel } from '../Common/Panel.tsx'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import {
  useActualCompareRoute,
  useActualRoute,
  useCompareMode,
  useSavedRoutes,
} from '../../store/routes/routeHooks.ts'
import {
  exitCompare,
  setCompareMode,
  swapCompareRoute,
} from '../../store/reducers/compareReducer.ts'
import type { CompareMode } from '../../store/reducers/compareReducer.ts'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import { useComparePeek } from './useComparePeek.ts'
import { compareColors } from '../../util/colors.ts'
import type { Route } from '../../util/types.ts'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { useCallback } from 'react'
import { selectMobSearchOpen } from '../../store/reducers/mobSearchReducer.ts'

const compareBarBottomOffset = 32

const modes: { mode: CompareMode; label: string; tooltip: string }[] = [
  { mode: 'overlay', label: 'Overlay', tooltip: 'Outline the compare route’s differing pulls' },
  { mode: 'diff', label: 'Diff', tooltip: 'Colour every enemy by which routes pull it' },
]

export function CompareBar() {
  const compareRoute = useActualCompareRoute()
  const isPreviewing = useRootSelector((state) => state.compare.previewRoute !== null)

  useComparePeek()

  // Hidden while previewing so the bar doesn't flicker as the mouse moves down a dropdown.
  if (!compareRoute || isPreviewing) return null

  return <CompareBarPanel compareRoute={compareRoute} />
}

function CompareBarPanel({ compareRoute }: { compareRoute: Route }) {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const mode = useCompareMode()
  const savedRoutes = useSavedRoutes()

  const canSwap = savedRoutes.some((saved) => saved.uid === compareRoute.uid)

  const onExit = useCallback(() => {
    dispatch(exitCompare())
  }, [dispatch])

  // Mob search claims Escape first while it's open.
  const isMobSearchOpen = useRootSelector(selectMobSearchOpen)
  const onCancel = useCallback(() => {
    if (!isMobSearchOpen) onExit()
  }, [isMobSearchOpen, onExit])

  useShortcut(shortcuts.cancel, onCancel)

  return (
    <div
      className="fixed z-[10000] left-1/2 w-full flex justify-center pointer-events-none"
      style={{ transform: 'translateX(-50%)', bottom: compareBarBottomOffset }}
    >
      <Panel className="w-fit pointer-events-auto" innerClass="flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div className="font-bold max-w-40 truncate">{route.name}</div>
            <ArrowsRightLeftIcon width={16} height={16} className="text-gray-400 shrink-0" />
            <div
              className="font-bold max-w-40 truncate"
              style={{ color: compareColors.accent }}
              title={compareRoute.name}
            >
              {compareRoute.name}
            </div>
          </div>

          <div className="flex gap-1">
            {modes.map(({ mode: modeOption, label, tooltip }) => (
              <Button
                key={modeOption}
                short
                twoDimensional
                outline={mode !== modeOption}
                onClick={() => dispatch(setCompareMode(modeOption))}
                tooltip={tooltip}
                tooltipId={`compare-mode-${modeOption}`}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex gap-1">
            <Button
              short
              twoDimensional
              outline
              Icon={ArrowsRightLeftIcon}
              disabled={!canSwap}
              onClick={() => dispatch(swapCompareRoute())}
              tooltip={canSwap ? 'Swap which route is being edited' : 'Only saved routes can swap'}
              tooltipId="compare-swap"
            />
            <Button
              short
              twoDimensional
              outline
              Icon={XMarkIcon}
              onClick={onExit}
              tooltip="Stop comparing"
              tooltipId="compare-exit"
            />
          </div>
        </div>

        <div className="text-sm text-gray-300">
          hold {keyText(shortcuts.comparePeek[0]!)} to peek · {keyText(shortcuts.cancel[0]!)} to exit
        </div>
      </Panel>
    </div>
  )
}
