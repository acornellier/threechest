import { ReactNode, useCallback } from 'react'
import { useKeyPress } from '../../hooks/useKeyPress.ts'
import { useOutsideClick } from '../../hooks/useOutsideClick.ts'

interface Props {
  title: ReactNode
  contents: ReactNode
  buttons: ReactNode
  onClose: () => void
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
}

export function Modal({
  title,
  contents,
  buttons,
  onClose,
  closeOnEscape,
  closeOnClickOutside,
}: Props) {
  const escapeCallback = useCallback(() => {
    if (closeOnEscape) onClose()
  }, [onClose, closeOnEscape])

  useKeyPress('Escape', escapeCallback)

  const clickOutsideCallback = useCallback(() => {
    if (closeOnClickOutside) onClose()
  }, [onClose, closeOnClickOutside])

  const ref = useOutsideClick(clickOutsideCallback)

  return (
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full">
      <div className="fixed w-full h-full opacity-80 bg-neutral-800" />
      <div ref={ref} className="relative z-10 w-[400px] flex rounded-lg border-2 border-gray-600">
        <div className="gritty absolute z-[-10] w-full h-full bg-fancy-blue opacity-90 rounded-lg" />
        <div className="flex flex-col w-full h-full justify-center gap-5 p-5">
          <h3 className="text-xl font-semibold text-center">{title}</h3>

          <div className="leading-relaxed">{contents}</div>

          <div className="flex justify-center items-center gap-2">{buttons}</div>
        </div>
      </div>
    </div>
  )
}
