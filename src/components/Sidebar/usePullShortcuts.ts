import { useCallback } from 'react'
import { appendPull, deletePull, selectPullRelative } from '../../store/routesReducer.ts'
import { useKeyPress } from '../../hooks/useKeyPress.ts'
import { useAppDispatch } from '../../store/hooks.ts'

const deleteKeys = ['Backspace', 'Delete']

export function usePullShortcuts() {
  const dispatch = useAppDispatch()

  const onKeyBackspace = useCallback(() => dispatch(deletePull()), [dispatch])
  useKeyPress(deleteKeys, onKeyBackspace)

  const onKeyA = useCallback(() => dispatch(appendPull()), [dispatch])
  useKeyPress('a', onKeyA)

  const onKeyDown = useCallback(() => dispatch(selectPullRelative(1)), [dispatch])
  useKeyPress('ArrowDown', onKeyDown)

  const onKeyUp = useCallback(() => dispatch(selectPullRelative(-1)), [dispatch])
  useKeyPress('ArrowUp', onKeyUp)
}
