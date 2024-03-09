import { ToastComponent } from './ToastComponent.tsx'
import { useRootSelector } from '../../store/hooks.ts'

export function Toasts() {
  const toasts = useRootSelector((state) => state.toast.toasts)

  return (
    <div
      className="fixed left-1/2 bottom-8 z-20 select-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="flex flex-col gap-2 items-center">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
