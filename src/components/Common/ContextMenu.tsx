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
}

export const minContextMenuWidth = 160

export function ContextMenu({ position, buttons, onClose }: ContextMenuProps) {
  return (
    <div
      className="fixed z-[9999]"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        minWidth: minContextMenuWidth,
        top: position.top,
        left: position.left,
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
