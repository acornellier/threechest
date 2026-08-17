import { useCallback } from 'react'
import { useWindowEvent } from '../../util/hooks/useWindowEvent.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { setComparePeeking } from '../../store/reducers/compareReducer.ts'
import { isEventInInput, shortcuts } from '../../data/shortcuts.ts'

const peekKey = shortcuts.comparePeek[0]!.key.toLowerCase()

/**
 * Hold to swap the map to the compare route. Not useShortcut, which only sees keydown.
 */
export function useComparePeek() {
  const dispatch = useAppDispatch()

  const stopPeeking = useCallback(() => {
    dispatch(setComparePeeking(false))
  }, [dispatch])

  useWindowEvent(
    'keydown',
    useCallback(
      (event: KeyboardEvent) => {
        if (event.key.toLowerCase() !== peekKey || event.repeat) return
        if (event.ctrlKey || event.metaKey || event.altKey || isEventInInput(event)) return

        dispatch(setComparePeeking(true))
      },
      [dispatch],
    ),
  )

  useWindowEvent(
    'keyup',
    useCallback(
      (event: KeyboardEvent) => {
        if (event.key.toLowerCase() === peekKey) stopPeeking()
      },
      [stopPeeking],
    ),
  )

  useWindowEvent('blur', stopPeeking)
  useWindowEvent('visibilitychange' as keyof WindowEventMap, stopPeeking)
}
