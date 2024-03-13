import { useEffect, useState } from 'react'

type Key = 'Control' | string

export function useKeyHeld(key: Key): boolean {
  const [isKeyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) setKeyPressed(true)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) setKeyPressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [key]) // Update effect when `key` changes

  return isKeyPressed
}
