import { useCallback, useState } from 'react'
import { useWindowEvent } from './useWindowEvent.ts'

export function useKeyHeld(key: string): boolean {
  const [isKeyHeld, setKeyHeld] = useState(false)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) setKeyHeld(true)
    },
    [key],
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key) setKeyHeld(false)
    },
    [key],
  )

  useWindowEvent('keydown', handleKeyDown)
  useWindowEvent('keyup', handleKeyUp)

  return isKeyHeld
}
