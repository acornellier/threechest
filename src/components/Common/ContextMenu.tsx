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
  /** A nested array renders one column per entry. */
  buttons: ContextMenuButton[] | ContextMenuButton[][]
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
  const columns = (Array.isArray(buttons[0]) ? buttons : [buttons]) as ContextMenuButton[][]

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
        <div className="flex gap-2" style={{ gap }}>
          {columns.map((column, columnIdx) => (
            <div key={columnIdx} className="flex flex-col gap-2" style={{ gap }}>
              {column.map(({ contents, onClick, ...rest }, idx) => (
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
          ))}
        </div>
      </Panel>
    </div>
  )
}
