import { useEffect } from 'react'
import { isEventInInput, isMac, Shortcut } from '../data/shortcuts.ts'

export function useShortcut(
  shortcuts: string | Shortcut[],
  callback: (event: KeyboardEvent) => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEventInInput(event)) return

      if (typeof shortcuts === 'string') {
        if (event.key.toLowerCase() === shortcuts.toLowerCase()) {
          event.preventDefault()
          callback(event)
        }

        return
      }

      for (const { key, ctrl, shift, allowShift } of shortcuts) {
        const eventCtrlKey = isMac ? event.metaKey : event.ctrlKey
        if (
          !!ctrl !== eventCtrlKey ||
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
