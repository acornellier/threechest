import { Button } from './Button.tsx'
import { ReactNode, useCallback, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useOutsideClick } from '../../hooks/useOutsideClick.ts'

export interface DropdownOption {
  id: string
  label: string
  icon?: ReactNode
}

interface Props<T extends DropdownOption> {
  options: T[]
  onSelect: (option: T) => void
  selected?: T
  buttonText?: string
  short?: boolean
  outline?: boolean
  className?: string
}

export function Dropdown<T extends DropdownOption>({
  selected,
  options,
  onSelect,
  buttonText,
  short,
  outline,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const onClose = useCallback(() => {
    setOptionsVisible(false)
    timeoutRef.current = setTimeout(() => setOpen(false), 200)
  }, [])

  const ref = useOutsideClick(onClose)

  const toggleOpen = useCallback(() => {
    clearTimeout(timeoutRef.current)
    if (!optionsVisible) {
      setOpen(true)
      setTimeout(() => setOptionsVisible(true), 0)
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
        className={`dropdown-main 
                    ${optionsVisible ? 'options-visible' : ''} 
                    ${className ?? ''}`}
        style={{
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
