import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'
import { keyText, Shortcut } from '../../data/shortcuts.ts'
import { IconComponent } from '../../util/types.ts'
import { TooltipStyled } from './TooltipStyled.tsx'

export type ButtonTooltipProps =
  | {
      tooltip: ReactNode
      tooltipId: string
    }
  | {
      tooltip?: never
      tooltipId?: never
    }

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  Icon?: IconComponent
  iconSize?: number
  iconRight?: boolean
  shortcut?: Shortcut
  innerClass?: string
  outline?: boolean
  short?: boolean
  tiny?: boolean
  twoDimensional?: boolean
  justifyStart?: boolean
  color?: 'red' | 'green' | 'yellow'
} & ButtonTooltipProps

function ButtonIconText({
  Icon,
  iconSize,
  iconRight,
  children,
}: Pick<ButtonProps, 'Icon' | 'iconSize' | 'iconRight' | 'children'>) {
  if (!Icon) return children

  if (!children && Icon) {
    return <Icon width={iconSize ?? 24} height={iconSize ?? 24} />
  }

  return (
    <div className={`flex gap-1 items-center ${iconRight ? 'flex-row-reverse' : ''}`}>
      <Icon
        width={iconSize ?? 18}
        height={iconSize ?? 18}
        className={!iconRight ? '-ml-0.5' : ''}
      />
      {children}
    </div>
  )
}

export function Button({
  Icon,
  iconSize,
  iconRight,
  shortcut,
  innerClass,
  outline,
  short,
  tiny,
  twoDimensional,
  justifyStart,
  className,
  children,
  color,
  tooltip,
  tooltipId,
  ...props
}: ButtonProps) {
  const buttonIconText = (
    <ButtonIconText Icon={Icon} iconSize={iconSize} iconRight={iconRight}>
      {children}
    </ButtonIconText>
  )

  return (
    <>
      <button
        className={`fancy-button
                  ${color ?? ''}
                  ${outline ? 'outline-button' : ''} 
                  ${tiny ? 'tiny' : short ? 'short' : ''} 
                  ${twoDimensional ? 'two-d' : ''} 
                  ${className ?? ''}`}
        data-tooltip-id={tooltipId}
        {...props}
      >
        <div className="fancy-button-hover flex-1 z-[1]" />
        <div
          className={`fancy-button-inner z-[2] ${innerClass ?? ''}`}
          style={{
            ...(justifyStart ? { justifyContent: 'flex-start' } : {}),
          }}
        >
          {shortcut ? (
            <div
              className={`w-full gap-2 ${
                justifyStart
                  ? 'flex justify-between items-center gap-2'
                  : 'grid grid-cols-[1fr_auto_1fr]'
              }`}
            >
              {!justifyStart && <div />}
              <div
                className="flex flex-nowrap flex-1"
                style={{
                  justifyContent: justifyStart ? 'flex-start' : 'center',
                }}
              >
                {buttonIconText}
              </div>
              <div className="text-gray-300 flex justify-end">{keyText(shortcut)}</div>
            </div>
          ) : (
            buttonIconText
          )}
        </div>
      </button>
      {tooltip && <TooltipStyled id={tooltipId}>{tooltip}</TooltipStyled>}
    </>
  )
}
