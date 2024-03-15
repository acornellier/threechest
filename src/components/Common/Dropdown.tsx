import { Button } from './Button.tsx'
import { ReactNode, useCallback, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useOutsideClick } from '../../hooks/useOutsideClick.ts'
import { IconComponent } from '../../util/types.ts'

export interface DropdownOption {
  id: string
  label: string
  icon?: ReactNode
}

interface Props<T extends DropdownOption> {
  options: T[]
  onSelect: (option: T) => void
  onHover?: (option: T | null) => void
  selected?: T
  buttonText?: string
  MainButtonIcon?: IconComponent
  short?: boolean
  outline?: boolean
  className?: string
}

const transitionDuration = 200

export function Dropdown<T extends DropdownOption>({
  selected,
  options,
  onSelect,
  onHover,
  buttonText,
  MainButtonIcon,
  short,
  outline,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [fullyOpen, setFullyOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const onClose = useCallback(() => {
    onHover?.(null)
    setFullyOpen(false)
    setOptionsVisible(false)
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, transitionDuration)
  }, [onHover])

  const ref = useOutsideClick(onClose)

  const toggleOpen = useCallback(() => {
    clearTimeout(timeoutRef.current)
    if (!optionsVisible) {
      setOpen(true)
      setTimeout(() => setOptionsVisible(true), 0)
      setTimeout(() => setFullyOpen(true), transitionDuration)
    } else {
      onClose()
    }
  }, [onClose, optionsVisible])

  const selectOption = useCallback(
    (option: T) => {
      if (option.id !== selected?.id) onSelect(option)
      toggleOpen()
    },
    [onSelect, selected?.id, toggleOpen],
  )

  const ChevronIcon = optionsVisible ? ChevronUpIcon : ChevronDownIcon

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <Button
        twoDimensional={!buttonText}
        short={short}
        outline={outline}
        onClick={toggleOpen}
        Icon={MainButtonIcon}
        className={`dropdown-main 
                    ${optionsVisible ? 'options-visible' : ''} 
                    ${className ?? ''}`}
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
        {buttonText ? (
          buttonText
        ) : (
          <>
            {selected?.icon && <div className="mr-1">{selected?.icon}</div>}
            {selected?.label ? (
              <div className="dropdown-main-text">{selected?.label}</div>
            ) : (
              buttonText ?? null
            )}
            <ChevronIcon width={20} height={20} className="ml-auto" />
          </>
        )}
      </Button>

      <div
        className={`absolute w-full z-50 ${open ? '' : 'hidden'}`}
        style={{ marginTop: buttonText ? -3 : 0 }}
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
                if ((e.relatedTarget as Element)?.closest('.dropdown-option')) return
                onHover?.(null)
              }}
              title={option.label}
            >
              {option.icon && <div className="mr-1">{option.icon}</div>}
              <div className="dropdown-option-text">{option.label}</div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
