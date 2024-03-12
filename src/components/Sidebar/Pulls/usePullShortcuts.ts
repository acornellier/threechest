import { useCallback } from 'react'
import {
  appendPull,
  clearPull,
  deletePull,
  prependPull,
  selectPull,
  selectPullRelative,
} from '../../../store/routesReducer.ts'
import { useKeyPress } from '../../../hooks/useKeyPress.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { shortcuts } from '../../../data/shortcuts.ts'

export function usePullShortcuts() {
  const dispatch = useAppDispatch()

  const onKeyBackspace = useCallback(() => dispatch(deletePull({ moveUp: true })), [dispatch])
  useKeyPress(shortcuts.backspacePull, onKeyBackspace)

  const onKeyDelete = useCallback(() => dispatch(deletePull({})), [dispatch])
  useKeyPress(shortcuts.deletePull, onKeyDelete)

  const onAppend = useCallback(() => dispatch(appendPull()), [dispatch])
  useKeyPress(shortcuts.appendPull, onAppend)

  const onPrepend = useCallback(() => dispatch(prependPull()), [dispatch])
  useKeyPress(shortcuts.prependPull, onPrepend)

  const onClearPull = useCallback(() => dispatch(clearPull()), [dispatch])
  useKeyPress(shortcuts.clearPull, onClearPull)

  const onPullDown = useCallback(() => dispatch(selectPullRelative(1)), [dispatch])
  useKeyPress(shortcuts.pullDown, onPullDown)

  const onPullUp = useCallback(() => dispatch(selectPullRelative(-1)), [dispatch])
  useKeyPress(shortcuts.pullUp, onPullUp)

  const onNumberKey = useCallback(
    (e: KeyboardEvent) => {
      let num = Number(e.key)
      if (num === 0) num += 10
      dispatch(selectPull(num - 1))
    },
    [dispatch],
  )
  useKeyPress(shortcuts.selectPullNumber, onNumberKey)
}
