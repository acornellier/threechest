import { useAppDispatch } from '../store/hooks.ts'
import { Button } from './Common/Button.tsx'
import { ActionCreators } from 'redux-undo'
import { useCallback } from 'react'
import { useKeyPress } from '../hooks/useKeyPress.ts'

const undoModifiers = { ctrl: true } as const
const redoModifiers = { ctrl: true, shift: true } as const

export function UndoRedo() {
  const dispatch = useAppDispatch()

  const undo = useCallback(() => {
    dispatch(ActionCreators.undo())
  }, [dispatch])

  const redo = useCallback(() => {
    dispatch(ActionCreators.redo())
  }, [dispatch])

  useKeyPress('z', undo, undoModifiers)
  useKeyPress('z', redo, redoModifiers)

  return (
    <div className="fixed w-full top-2 z-20">
      <div className="flex gap-2 justify-center">
        <Button className="gap-1" onClick={undo}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
            />
          </svg>
          Undo
        </Button>
        <Button className="gap-1" onClick={redo}>
          Redo
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
            />
          </svg>
        </Button>
      </div>
    </div>
  )
}
