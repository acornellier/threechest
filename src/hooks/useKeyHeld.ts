import { useEffect, useState } from 'react'

type Key = 'Control' | string

export function useKeyDown(key: Key): boolean {
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
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('keyup', handleKeyUp)
    }
  }, [key]) // Update effect when `key` changes

  return isKeyPressed
}
