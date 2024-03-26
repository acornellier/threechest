import { useEffect, useState } from 'react'

export function useDelay(delay: number) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return isReady
}
