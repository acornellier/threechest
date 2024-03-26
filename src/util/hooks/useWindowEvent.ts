import { useEffect } from 'react'

export function useWindowEvent<K extends keyof WindowEventMap>(
  event: K,
  callback: (event: WindowEventMap[K]) => void,
) {
  useEffect(() => {
    window.addEventListener(event, callback)

    return () => {
      window.removeEventListener(event, callback)
    }
  }, [callback, event])
}
