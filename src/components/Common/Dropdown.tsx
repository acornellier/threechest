import type { ButtonProps, ButtonTooltipProps } from './Button.tsx'
import { Button } from './Button.tsx'
import type { ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useOutsideClick } from '../../util/hooks/useOutsideClick.ts'
import type { IconComponent } from '../../util/types.ts'
import { ReactSortable } from 'react-sortablejs'

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
  onReorder?: (options: T[]) => void
  selected?: T
  buttonContent?: ReactNode
  MainButtonIcon?: IconComponent
  className?: string
  disabled?: boolean
  hideArrow?: boolean
} & Pick<ButtonProps, 'short' | 'twoDimensional' | 'outline'> &
  ButtonTooltipProps

const transitionDuration = 200

export function Dropdown<T extends DropdownOption>({
  selected,
  options,
  onOpen,
  onClose,
  onSelect,
  onHover,
  onReorder,
  buttonContent,
  MainButtonIcon,
  short,
  outline,
  twoDimensional,
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
      handleClose()
    },
    [handleClose, onSelect, selected?.id],
  )

  const ChevronIcon = optionsVisible ? ChevronUpIcon : ChevronDownIcon

  return (
    <div ref={ref} className={`relative flex-1 min-w-0 h-full ${className ?? ''}`}>
      <Button
        twoDimensional={twoDimensional}
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
          ...(optionsVisible
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
            {!hideArrow && (
              <ChevronIcon
                width={24}
                height={24}
                className={`ml-auto ${disabled ? 'invisible' : ''}`}
              />
            )}
          </>
        )}
      </Button>

      <div
        className={`absolute w-full z-50 ${open ? '' : 'hidden'}`}
        style={{ marginTop: twoDimensional ? 0 : -3 }}
      >
        <div className="flex flex-col">
          <ReactSortable
            className="flex flex-col relative overflow-auto h-fit"
            disabled={onReorder === undefined}
            list={options}
            setList={(newOptions) => {
              if (!onReorder) return
              if (newOptions.every((newOption, idx) => newOption.id === options[idx]!.id)) return

              onReorder?.(newOptions)
            }}
            delay={100}
            delayOnTouchOnly
          >
            {options.map((option) => (
              <Button
                key={option.id}
                className={`dropdown-option ${optionsVisible ? 'options-visible' : ''}`}
                twoDimensional
                outline={outline}
                onClick={() => selectOption(option)}
                onTouchEnd={() => selectOption(option)}
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
          </ReactSortable>
        </div>
      </div>
    </div>
  )
}
