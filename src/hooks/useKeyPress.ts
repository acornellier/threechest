import { useEffect } from 'react'

type Key = 'Control' | string

interface Modifiers {
  ctrl?: boolean
  shift?: boolean
}

export function useKeyPress(keys: Key | Key[], callback: () => void, modifiers?: Modifiers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return

      if (
        (!!modifiers?.ctrl !== event.ctrlKey && !!modifiers?.ctrl !== event.metaKey) ||
        !!modifiers?.shift !== event.shiftKey
      )
        return

      if (
        (typeof keys === 'string' && event.key.toLowerCase() === keys.toLowerCase()) ||
        (Array.isArray(keys) &&
          keys.map((key) => key.toLowerCase()).includes(event.key.toLowerCase()))
      ) {
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [callback, keys, modifiers])
}
