import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'

export interface Toast {
  id: number
  message: string
  removing?: boolean
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string) => {
    const toast = { id: new Date().getTime(), message }
    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((cur) => (cur.id !== toast.id ? cur : { ...cur, removing: true })),
      )

      setTimeout(() => {
        setToasts((prev) => prev.filter((cur) => cur.id !== toast.id))
      }, 1_000)
    }, 5_000)
  }, [])

  const value = useMemo(
    () => ({
      toasts,
      addToast,
    }),
    [toasts, addToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
