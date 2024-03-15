import { ToastComponent } from './ToastComponent.tsx'
import { useAppDispatch, useRootSelector } from '../../store/hooks.ts'
import { useEffect } from 'react'
import { getTipsSeen, neverShowTipsKey, pageVisitsKey, tips, tipsSeenKey } from '../../data/tips.ts'
import { addToast } from '../../store/toastReducer.ts'

export function Toasts() {
  const dispatch = useAppDispatch()
  const toasts = useRootSelector((state) => state.toast.toasts)

  useEffect(() => {
    if (localStorage.getItem(neverShowTipsKey) === 'true') return

    const pageVisitsItem = localStorage.getItem(pageVisitsKey)
    let pageVisits = pageVisitsItem ? Number(pageVisitsItem) : 0
    pageVisits += 1
    localStorage.setItem(pageVisitsKey, pageVisits.toString())

    if (pageVisits < 3) return
    if (Math.random() < 0.5) return

    const tipsSeen = getTipsSeen()
    const tip = tips.find(({ id }) => !tipsSeen.includes(id))
    if (!tip) return

    setTimeout(() => {
      dispatch(addToast({ message: tip.tip, type: 'info', duration: 60_000, isTip: true }))
      tipsSeen.push(tip.id)
      localStorage.setItem(tipsSeenKey, JSON.stringify(tipsSeen))
    }, 10_000)
  }, [dispatch])

  return (
    <div
      className="fixed left-1/2 bottom-8 z-20 select-none w-max max-w-full"
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
