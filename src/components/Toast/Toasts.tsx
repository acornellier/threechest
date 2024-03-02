import { useToasts } from './useToasts.ts'
import { Label } from '../Common/Label.tsx'

export function Toasts() {
  const { toasts } = useToasts()

  return (
    <div className="fixed w-full bottom-8 z-20">
      <div className="flex flex-col gap-2 items-center">
        {toasts.map((toast) => (
          <Label key={toast.id}>{toast.message}</Label>
        ))}
      </div>
    </div>
  )
}
