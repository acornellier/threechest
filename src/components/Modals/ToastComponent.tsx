import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { removeToast, Toast } from '../../store/reducers/toastReducer.ts'
import { useAppDispatch } from '../../store/hooks.ts'
import { Button } from '../Common/Button.tsx'
import { neverShowTips } from '../../data/tips.ts'

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
      className={`fancy-toast flex items-center gap-2 transition-opacity duration-500
                  ${toast.type} 
                  ${toast.removing ? 'opacity-0' : ''}`}
      onClick={onRemove}
    >
      <Icon width={24} height={24} />
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
