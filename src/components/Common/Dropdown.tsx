import { Button, ButtonTooltipProps } from './Button.tsx'
import { ReactNode, useCallback, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useOutsideClick } from '../../hooks/useOutsideClick.ts'
import { IconComponent } from '../../util/types.ts'

export interface DropdownOption {
  id: string
  content: ReactNode
  icon?: ReactNode
}

type Props<T extends DropdownOption> = {
  options: T[]
  onOpen?: () => void
  onClose?: () => void
  onSelect: (option: T) => void
  onHover?: (option: T | null) => void
  selected?: T
  buttonContent?: ReactNode
  MainButtonIcon?: IconComponent
  short?: boolean
  outline?: boolean
  className?: string
  disabled?: boolean
  hideArrow?: boolean
} & ButtonTooltipProps

const transitionDuration = 200

export function Dropdown<T extends DropdownOption>({
  selected,
  options,
  onOpen,
  onClose,
  onSelect,
  onHover,
  buttonContent,
  MainButtonIcon,
  short,
  outline,
  className,
  disabled,
  hideArrow,
  tooltip,
  tooltipId,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleClose = useCallback(() => {
    if (!open && !optionsVisible) return

    setFullyOpen(false)
    setOptionsVisible(false)
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, transitionDuration)
    onClose?.()
  }, [onClose, open, optionsVisible])

  const ref = useOutsideClick(handleClose)

  const toggleOpen = useCallback(() => {
    clearTimeout(timeoutRef.current)
    if (!optionsVisible) {
      setOpen(true)
      setTimeout(() => setOptionsVisible(true), 0)
      setTimeout(() => setFullyOpen(true), transitionDuration)
      onOpen?.()
    } else {
      handleClose()
    }
  }, [handleClose, onOpen, optionsVisible])

  const selectOption = useCallback(
    (option: T) => {
      if (option.id !== selected?.id) onSelect(option)
      toggleOpen()
    },
    [onSelect, selected?.id, toggleOpen],
  )

  const ChevronIcon = optionsVisible ? ChevronUpIcon : ChevronDownIcon

  return (
    <div ref={ref} className={`relative flex-1 min-w-0 h-full ${className ?? ''}`}>
      <Button
        twoDimensional={!buttonContent}
        short={short}
        outline={outline}
        onClick={toggleOpen}
        Icon={MainButtonIcon}
        disabled={disabled}
        className={`dropdown-main 
                    ${optionsVisible ? 'options-visible' : ''} 
                    ${className ?? ''}`}
        tooltip={tooltip}
        tooltipId={tooltipId!}
        style={{
          transitionDuration: transitionDuration.toString(),
          ...(open
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : {}),
        }}
      >
        {buttonContent ? (
          buttonContent
        ) : (
          <>
            {selected?.icon && <div className="mr-1">{selected?.icon}</div>}
            {selected?.content ? (
              <div className="dropdown-main-text">{selected?.content}</div>
            ) : null}
            {!hideArrow && <ChevronIcon width={20} height={20} className="ml-auto" />}
          </>
        )}
      </Button>

      <div
        className={`absolute w-full z-50 ${open ? '' : 'hidden'}`}
        style={{ marginTop: buttonContent ? -3 : 0 }}
      >
        <div className="flex flex-col">
          {options.map((option) => (
            <Button
              key={option.id}
              twoDimensional
              outline={outline}
              className={`dropdown-option ${optionsVisible ? 'options-visible' : ''}`}
              onClick={() => selectOption(option)}
              onMouseEnter={() => {
                if (!fullyOpen) return
                onHover?.(option)
              }}
              onMouseLeave={(e) => {
                if (!fullyOpen) return
                if ((e.relatedTarget as Element)?.closest?.('.dropdown-option')) return
                onHover?.(null)
              }}
            >
              {option.icon && <div className="mr-1">{option.icon}</div>}
              <div className="dropdown-option-text">{option.content}</div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
