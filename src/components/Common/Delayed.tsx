import type { ReactNode} from 'react';
import { useEffect, useState } from 'react'

type Props = {
  children: ReactNode
  delay: number
}

export function Delayed({ children, delay }: Props) {
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  return isShown ? children : null
}
