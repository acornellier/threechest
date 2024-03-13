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

      for (const { key, ctrl, shift, allowShift } of shortcuts) {
        if (
          (!!ctrl !== event.ctrlKey && !!ctrl !== event.metaKey) ||
          (!!shift !== event.shiftKey && !(allowShift && event.shiftKey))
        ) {
          continue
        }

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
