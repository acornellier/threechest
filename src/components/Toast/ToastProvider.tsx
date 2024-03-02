import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'

export interface Toast {
  id: number
  message: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string) => void
  removeToast: (index: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string) => {
      const toast = { id: new Date().getTime(), message }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => removeToast(toast.id), 5_000)
    },
    [removeToast],
  )

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts, addToast, removeToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
