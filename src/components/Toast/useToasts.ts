import { useContext } from 'react'
import { ToastContext } from './ToastProvider.tsx'

export const useToasts = () => useContext(ToastContext)!
