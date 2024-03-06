import { ToastComponent } from './ToastComponent.tsx'
import { useRootSelector } from '../../store/hooks.ts'

export function Toasts() {
  const toasts = useRootSelector((state) => state.toast.toasts)

  return (
    <div className="fixed w-full bottom-8 z-20">
      <div className="flex flex-col gap-2 items-center">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
