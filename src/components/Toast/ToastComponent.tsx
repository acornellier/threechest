import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Toast } from '../../store/toastReducer.ts'

interface Props {
  toast: Toast
}

export function ToastComponent({ toast }: Props) {
  return (
    <div
      className={`fancy-toast flex items-center gap-2 transition-opacity duration-500
                  ${toast.type === 'error' ? 'error' : ''} 
                  ${toast.removing ? 'opacity-0' : ''}`}
    >
      {toast.type === 'success' ? (
        <CheckCircleIcon width={24} height={24} />
      ) : (
        <ExclamationTriangleIcon width={24} height={24} />
      )}
      <div>{toast.message}</div>
    </div>
  )
}
