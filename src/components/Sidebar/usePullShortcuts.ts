import { useCallback } from 'react'
import { addPull, deletePull, selectPull } from '../../store/reducer.ts'
import { useKeyPress } from '../../hooks/useKeyPress.ts'
import { useAppDispatch, useSelectedPull } from '../../store/hooks.ts'

export function usePullShortcuts() {
  const dispatch = useAppDispatch()
  const selectedPull = useSelectedPull()

  const onKeyBackspace = useCallback(
    () => dispatch(deletePull(selectedPull)),
    [dispatch, selectedPull],
  )
  useKeyPress(['Backspace', 'Delete'], onKeyBackspace)

  const onKeyA = useCallback(() => dispatch(addPull(selectedPull + 1)), [dispatch, selectedPull])
  useKeyPress('a', onKeyA)

  const onKeyDown = useCallback(
    () => dispatch(selectPull(selectedPull + 1)),
    [dispatch, selectedPull],
  )
  useKeyPress('ArrowDown', onKeyDown)

  const onKeyUp = useCallback(
    () => dispatch(selectPull(selectedPull - 1)),
    [dispatch, selectedPull],
  )
  useKeyPress('ArrowUp', onKeyUp)
}
