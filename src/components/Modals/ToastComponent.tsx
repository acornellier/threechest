import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { Toast } from '../../store/reducers/toastReducer.ts';
import { removeToast } from '../../store/reducers/toastReducer.ts'
import { Button } from '../Common/Button.tsx'
import { neverShowTips } from '../../data/tips.ts'

import { useAppDispatch } from '../../store/storeUtil.ts'

interface Props {
  toast: Toast
}

export function ToastComponent({ toast }: Props) {
  const dispatch = useAppDispatch()

  const Icon =
    toast.type === 'success'
      ? CheckCircleIcon
      : toast.type === 'info'
        ? InformationCircleIcon
        : ExclamationTriangleIcon

  const onRemove = () => {
    dispatch(removeToast(toast.id))
  }

  const onNeverShowTips = () => {
    neverShowTips()
    onRemove()
  }

  return (
    <div
      className={`fancy-toast flex items-center gap-2 transition-opacity duration-500 pointer-events-auto
                  ${toast.type} 
                  ${toast.removing ? 'opacity-0' : ''}`}
      onClick={onRemove}
    >
      <Icon width={24} height={24} className="min-w-6" />
      <div>{toast.message}</div>
      {(toast.isTip || toast.duration === 0 || toast.duration > 5_000) && (
        <XMarkIcon className="cursor-pointer" width={20} height={20} onClick={onRemove} />
      )}
      {toast.isTip && (
        <Button short outline twoDimensional onClick={onNeverShowTips}>
          Never show tips
        </Button>
      )}
    </div>
  )
}
