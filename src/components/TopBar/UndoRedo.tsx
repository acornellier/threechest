import { useAppDispatch, useRootSelector } from '../../store/hooks.ts'
import { Button } from '../Common/Button.tsx'
import { ActionCreators } from 'redux-undo'
import { useCallback } from 'react'
import { useKeyPress } from '../../hooks/useKeyPress.ts'
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/outline'
import { shortcuts } from '../../data/shortcuts.ts'

export function UndoRedo() {
  const dispatch = useAppDispatch()

  const hasPast = useRootSelector((state) => state.routes.past.length > 0)
  const hasFuture = useRootSelector((state) => state.routes.future.length > 0)

  const undo = useCallback(() => {
    dispatch(ActionCreators.undo())
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch(ActionCreators.redo())
  }, [dispatch])

  useKeyPress(shortcuts.undo, undo)
  useKeyPress(shortcuts.redo, redo)

  return (
    <div className="flex items-start gap-2">
      <Button className="gap-1" onClick={undo} disabled={!hasPast}>
        <ArrowUturnLeftIcon width={16} height={16} />
        Undo
      </Button>
      <Button className="gap-1" onClick={redo} disabled={!hasFuture}>
        Redo
        <ArrowUturnRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}
