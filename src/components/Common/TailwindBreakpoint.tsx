import { useWindowSize } from 'usehooks-ts'
import { useCallback, useState } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import type { Shortcut } from '../../data/shortcuts.ts'

const shortcut: Shortcut[] = [{ key: 'B', ctrl: true }]

export function TailwindBreakpoint() {
  const [show, setShow] = useState(false)
  const { width } = useWindowSize()

  const onShow = useCallback(() => setShow((v) => !v), [])
  useShortcut(shortcut, onShow)

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 bg-amber-950 px-1 text-white z-[9999]">
      <div id="breakpoint-xs" className="block sm:hidden md:hidden lg:hidden xl:hidden 2xl:hidden">
        xs {width}
      </div>
      <div id="breakpoint-sm" className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">
        sm {width}
      </div>
      <div id="breakpoint-md" className="hidden sm:hidden md:block lg:hidden xl:hidden 2xl:hidden">
        md {width}
      </div>
      <div id="breakpoint-lg" className="hidden sm:hidden md:hidden lg:block xl:hidden 2xl:hidden">
        lg {width}
      </div>
      <div id="breakpoint-xl" className="hidden sm:hidden md:hidden lg:hidden xl:block 2xl:hidden">
        xl {width}
      </div>
      <div id="breakpoint-2xl" className="hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block">
        2xl {width}
      </div>
    </div>
  )
}
