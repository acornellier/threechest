import { Button } from '../Common/Button.tsx'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { selectPullRelative } from '../../store/routes/routesReducer.ts'
import { Panel } from '../Common/Panel.tsx'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import { useCallback } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'

const livePlayheadHeightEstimate = 100
const livePlayheadBottomOffset = 32
export const livePlayheadBottom = livePlayheadHeightEstimate + livePlayheadBottomOffset

export function LivePlayhead() {
  const dispatch = useAppDispatch()

  const onNextPull = useCallback(() => {
    dispatch(selectPullRelative(1))
  }, [dispatch])

  useShortcut(shortcuts.pullDown, onNextPull, { allowRepeat: true })

  const onPrevPull = useCallback(() => {
    dispatch(selectPullRelative(-1))
  }, [dispatch])

  useShortcut(shortcuts.pullUp, onPrevPull, { allowRepeat: true })

  return (
    <div
      className="fixed z-[10000] bottom-8 left-1/2 w-full flex justify-center"
      style={{ transform: 'translateX(-50%)', bottom: livePlayheadBottomOffset }}
    >
      <Panel row className="text-base w-fit">
        <div className="grid grid-cols-2 gap-2">
          <Button className="min-w-48 [&]:text-lg" onClick={onPrevPull}>
            Previous pull
          </Button>
          <Button className="min-w-48 [&]:text-lg" onClick={onNextPull}>
            Next pull
          </Button>
          <div className="flex justify-center">
            {shortcuts.pullUp.map((shortcut, index) => (
              <div key={shortcut.key} className="flex">
                <div className="text-gray-300 flex justify-end">{keyText(shortcut)}</div>
                {index !== shortcuts.pullUp.length - 1 && <div className="mx-2">or</div>}
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            {shortcuts.pullDown.map((shortcut, index) => (
              <div key={shortcut.key} className="flex">
                <div className="text-gray-300 flex justify-end">{keyText(shortcut)}</div>
                {index !== shortcuts.pullDown.length - 1 && <div className="mx-2">or</div>}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  )
}
