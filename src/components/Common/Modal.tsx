import { ReactNode, useCallback } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { useOutsideClick } from '../../util/hooks/useOutsideClick.ts'
import { Button } from './Button.tsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Portal } from 'react-portal'

interface Props {
  title: ReactNode
  onClose: () => void
  contents?: ReactNode
  children?: ReactNode
  buttons?: ReactNode
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  closeButton?: boolean
  width?: number
}

export function Modal({
  title,
  contents,
  children,
  buttons,
  width,
  onClose,
  closeOnEscape,
  closeOnClickOutside,
  closeButton,
}: Props) {
  const escapeCallback = useCallback(() => {
    if (closeOnEscape) onClose()
  }, [onClose, closeOnEscape])

  useShortcut('Escape', escapeCallback)

  const clickOutsideCallback = useCallback(() => {
    if (closeOnClickOutside) onClose()
  }, [onClose, closeOnClickOutside])

  const ref = useOutsideClick(clickOutsideCallback)

  return (
    <Portal>
      <div className="fixed top-0 right-0 left-0 z-50 max-w-full flex justify-center items-center w-full h-full">
        <div className="fixed w-full h-full opacity-80 bg-neutral-800" />
        <div
          ref={ref}
          className="relative z-10 max-h-full flex rounded-lg border-2 border-gray-600"
          style={{
            width: width ?? 440,
          }}
        >
          <div className="gritty absolute z-[-10] w-full h-full bg-fancy-blue opacity-90 rounded-lg" />
          {closeButton && (
            <div className="absolute top-4 right-4">
              <Button Icon={XMarkIcon} outline onClick={onClose} />
            </div>
          )}
          <div className="overflow-auto flex flex-col w-full max-h-full gap-5 p-3 sm:p-5">
            <h3 className="text-xl font-semibold text-center">{title}</h3>

            {contents ?? children}

            {buttons && <div className="flex justify-center items-center gap-2">{buttons}</div>}
          </div>
        </div>
      </div>
    </Portal>
  )
}
