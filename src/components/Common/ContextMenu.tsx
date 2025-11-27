import type { ReactNode } from 'react'
import { Panel } from './Panel.tsx'
import { Button, type ButtonProps } from './Button.tsx'

export type ContextMenuPosition = {
  left: number
  top: number
}

export interface ContextMenuButton extends Omit<ButtonProps, 'children' | 'tooltip' | 'tooltipId'> {
  contents: ReactNode
  onClick: NonNullable<ButtonProps['onClick']>
}

export interface ContextMenuProps {
  position: ContextMenuPosition
  buttons: ContextMenuButton[]
  onClose: () => void
  minHeight: number
  minWidth: number
  gap?: number
}

export function ContextMenu({
  position,
  buttons,
  onClose,
  minHeight,
  minWidth,
  gap,
}: ContextMenuProps) {
  return (
    <div
      className="fixed z-[10000]"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        minWidth,
        minHeight,
        ...position,
      }}
    >
      <Panel blue>
        <div
          className="flex flex-col gap-2"
          style={{
            gap,
          }}
        >
          {buttons.map(({ contents, onClick, ...rest }, idx) => (
            <Button
              key={idx}
              justifyStart
              short
              {...rest}
              onClick={(e) => {
                onClick(e)
                onClose()
                e.stopPropagation()
              }}
            >
              {contents}
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  )
}
