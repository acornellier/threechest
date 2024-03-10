import { ReactNode } from 'react'
import { Panel } from './Panel.tsx'

export const minContextMenuWidth = 140

export type ContextMenuPosition = {
  left: number
  top: number
}

export interface ContextMenuProps {
  position: ContextMenuPosition
  onClose: () => void
  children: ReactNode
}

export function ContextMenu({ position, children }: ContextMenuProps) {
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
        <div className="flex flex-col gap-2">{children}</div>
      </Panel>
    </div>
  )
}
