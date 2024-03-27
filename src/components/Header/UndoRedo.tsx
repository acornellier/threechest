import { Button } from '../Common/Button.tsx'
import { ActionCreators } from 'redux-undo'
import { useCallback } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'

export function UndoRedo() {
  const dispatch = useAppDispatch()

  const isGuestCollab = useIsGuestCollab()

  const hasPast = useRootSelector((state) => state.routes.past.length > 0)
  const hasFuture = useRootSelector((state) => state.routes.future.length > 0)

  const undo = useCallback(() => {
    dispatch(ActionCreators.undo())
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch(ActionCreators.redo())
  }, [dispatch])

  useShortcut(shortcuts.undo, undo, { allowRepeat: true })
  useShortcut(shortcuts.redo, redo, { allowRepeat: true })

  if (isGuestCollab) return

  return (
    <div className="flex items-start gap-2 h-full flex-row">
      <Button
        Icon={ArrowUturnLeftIcon}
        onClick={undo}
        disabled={!hasPast}
        justifyStart
        tooltip={`Undo (${keyText(shortcuts.undo[0]!)})`}
        tooltipId="undo-tooltip"
      />
      <Button
        Icon={ArrowUturnRightIcon}
        iconRight
        onClick={redo}
        disabled={!hasFuture}
        justifyStart
        tooltip={`Redo (${keyText(shortcuts.redo[0]!)})`}
        tooltipId="redo-tooltip"
      />
    </div>
  )
}
