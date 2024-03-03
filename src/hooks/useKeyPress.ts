import { useEffect } from 'react'

type Key = 'Control' | string

export function useKeyPress(key: Key | Key[], callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return

      if (event.key === key || (key.length && key.includes(event.key))) {
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [callback, key])
}
