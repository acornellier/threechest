import { MouseEventHandler } from 'react'
import { Panel } from './Panel.tsx'
import { Shortcut } from '../../data/shortcuts.ts'
import { Button } from './Button.tsx'
import { IconComponent } from '../../util/types.ts'

export type ContextMenuPosition = {
  left: number
  top: number
}

export interface ContextMenuButton {
  Icon?: IconComponent
  text: string
  onClick: MouseEventHandler
  shortcut?: Shortcut
}

export interface ContextMenuProps {
  position: ContextMenuPosition
  buttons: ContextMenuButton[]
  onClose: () => void
  minHeight: number
  minWidth: number
}

export function ContextMenu({ position, buttons, onClose, minHeight, minWidth }: ContextMenuProps) {
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
        <div className="flex flex-col gap-2">
          {buttons.map(({ Icon, text, onClick, shortcut }, idx) => (
            <Button
              key={idx}
              justifyStart
              short
              Icon={Icon}
              shortcut={shortcut}
              onClick={(e) => {
                onClick(e)
                onClose()
                e.stopPropagation()
              }}
            >
              {text}
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  )
}
