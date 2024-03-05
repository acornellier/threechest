import { Toast } from './ToastProvider.tsx'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

interface Props {
  toast: Toast
}

export function ToastComponent({ toast }: Props) {
  return (
    <div
      className={`fancy-toast flex items-center gap-2 
                  transition-opacity duration-500 ${toast.removing ? 'opacity-0' : ''}`}
    >
      <CheckCircleIcon width={24} height={24} />
      <div>{toast.message}</div>
    </div>
  )
}
