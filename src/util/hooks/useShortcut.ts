import { useEffect } from 'react'
import type { Shortcut } from '../../data/shortcuts.ts';
import { isEventInInput } from '../../data/shortcuts.ts'
import { isMac } from '../dev.ts'

export function useShortcut(
  shortcuts: string | Shortcut[],
  callback: (event: KeyboardEvent) => void,
  options?: { allowRepeat?: boolean },
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((!options?.allowRepeat && event.repeat) || isEventInInput(event)) return

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
