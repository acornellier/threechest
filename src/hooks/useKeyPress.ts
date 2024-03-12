import { useEffect } from 'react'
import { Shortcut } from '../data/shortcuts.ts'

export function useKeyPress(
  shortcuts: string | Shortcut[],
  callback: (event: KeyboardEvent) => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return

      if (typeof shortcuts === 'string') {
        if (event.key.toLowerCase() === shortcuts.toLowerCase()) {
          event.preventDefault()
          callback(event)
        }

        return
      }

      for (const { key, mod } of shortcuts) {
        if (key === 'Tab') {
        }
        if (
          (!!mod?.ctrl !== event.ctrlKey && !!mod?.ctrl !== event.metaKey) ||
          !!mod?.shift !== event.shiftKey
        )
          continue

        if (event.key.toLowerCase() === key.toLowerCase()) {
          event.preventDefault()
          callback(event)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [callback, shortcuts])
}
