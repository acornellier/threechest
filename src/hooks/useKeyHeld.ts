import { useEffect, useState } from 'react'

export function useKeyHeld(key: string): boolean {
  const [isKeyHeld, setKeyHeld] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) setKeyHeld(true)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) setKeyHeld(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [key]) // Update effect when `key` changes

  return isKeyHeld
}
