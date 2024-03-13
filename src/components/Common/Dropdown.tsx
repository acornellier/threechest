import { Button } from './Button.tsx'
import { ReactNode, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

export interface DropdownOption {
  id: string
  label: string
  icon?: ReactNode
}

interface Props {
  selected: DropdownOption | undefined
  options: DropdownOption[]
  onChange: (option: DropdownOption) => void
  className?: string
}

export function Dropdown({ selected, options, onChange, className }: Props) {
  const [open, setOpen] = useState(false)
  const [optionsVisible, setOptionsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const toggleOpen = () => {
    clearTimeout(timeoutRef.current)
    if (!optionsVisible) {
      setOpen(true)
      setTimeout(() => setOptionsVisible(true), 0)
    } else {
      setOptionsVisible(false)
      timeoutRef.current = setTimeout(() => setOpen(false), 200)
    }
  }

  const handleChange = (option: DropdownOption) => {
    if (option.id !== selected?.id) onChange(option)
    toggleOpen()
  }

  return (
    <div className="relative flex-1">
      <Button
        twoDimensional
        className={`w-full dropdown-main ${optionsVisible ? 'options-visible' : ''} ${className}`}
        style={{
          ...(open
            ? {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : {}),
        }}
        onClick={toggleOpen}
      >
        <div className="mr-1">{selected?.icon}</div>
        <div className="dropdown-main-text">{selected?.label}</div>
        {optionsVisible ? (
          <ChevronUpIcon width={20} height={20} className="ml-auto" />
        ) : (
          <ChevronDownIcon width={20} height={20} className="ml-auto" />
        )}
      </Button>

      <div
        className={`absolute w-full z-50 divide-y divide-gray-100 rounded-b-lg rounded-tr-lg bg-[#00000085] 
                    ${open ? '' : 'hidden'}`}
      >
        <div className="flex flex-col text-sm text-gray-200">
          {options.map((option) => (
            <Button
              key={option.id}
              className={`flex py-2 px-2 dropdown-option ${
                optionsVisible ? 'options-visible' : ''
              }`}
              onClick={() => handleChange(option)}
            >
              <div className="mr-1">{option.icon}</div>
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
